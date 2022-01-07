# 服务端代码结构(尚未完成)

```
graph TD
A(Server)

B1(MonitorService)
B2(PrecreatorService)
B3(SnapshotterService)
B4(ContinuousQueryService)
B5(HTTPDService)
    B5_A1(handler)
        B5_B1(serveOptions)
        B5_B2(serveQuery)
            B5_B2_A1(InfluxQL)
        B5_B3(serveWrite)
            B5_B3_A1(PointWriter)
                B5_B3_A1_A1(TSM-engine)
                    B5_B3_A1_A1_A1(WAL)
                    B5_B3_A1_A1_A2(FileStore)
                    B5_B3_A1_A1_A3(Compactor)
                B5_B3_A1_A2(TSI)
        B5_B4(servePromWrite)
        B5_B5(servePromRead)
        B5_B6(servePing)
        B5_B7(serveStatus)
        B5_B8(promhttp_ServeHTTP)
B6(StorageService)
B7(RetentionPolicyService)
B8(GraphiteService/CollectdService/OpenTSDBService/UDPService)

A-->B1
A-->B2
A-->B3
A-->B4
A-->B5
A-->B6
A-->B7
A-->|可选|B8
B5-->B5_A1

subgraph HTTPDService
B5_A1-->|query-options/write-options|B5_B1
B5_A1-->|query|B5_B2
B5_A1-->|write|B5_B3
B5_A1-->|prometheus-write|B5_B4
B5_A1-->|prometheus-read|B5_B5
B5_A1-->|ping/ping-head|B5_B6
B5_A1-->|status/status-head|B5_B7
B5_A1-->|prometheus-metrics|B5_B8
B5_B3-->B5_B3_A1
end

subgraph InfluxQL
B5_B2-->B5_B2_A1
end

subgraph TSDB
B5_B3_A1-->B5_B3_A1_A1
B5_B3_A1_A2
end


subgraph TSM-engine
B5_B3_A1_A1-->B5_B3_A1_A1_A1
B5_B3_A1_A1-->B5_B3_A1_A1_A2
B5_B3_A1_A1-->B5_B3_A1_A1_A3
end

B5_B2_A1-->B5_B3_A1_A1
B5_B2_A1-->B5_B3_A1_A2

```
## server
Server表示元数据、存储数据和服务的容器。它是使用配置来构建的，并以适当的顺序管理所有服务的启动和关闭。

## service
server所包含的服务

模块名称 | 功能
---|---
MonitorService | 给用户提供一些统计，诊断数据
PrecreatorService | 创建一个定时函数，每隔一定时间间隔，检查并按需预先创建一次shard
SnapshotterService | 接受并处理跟snapshot相关的命令
ContinuousQueryService | 持续查询，通常用来压缩/聚合数据
HTTPDService | 对外提供服务的主要协议，通过http协议查询数据、数据写入、修改database、增加用户等操作
StorageService | 
RetentionPolicyService | 定期检查每个database的过期策略，将满足过期条件的ShardGroup/Shard删除
 |
UDPService | 监听线路协议的传入数据包
GraphiteService | 兼容Graphite监控数据接收协议
CollectdService | 兼容Collectd监控数据接收协议
OpenTSDBService | 兼容OpenTSDB监控数据接收协议

>service接入
```go
func (s *Server) Open() error {
	// Start profiling, if set.
	startProfile(s.CPUProfile, s.MemProfile)

	// Open shared TCP connection.
	ln, err := net.Listen("tcp", s.BindAddress)
	if err != nil {
		return fmt.Errorf("listen: %s", err)
	}
	s.Listener = ln

	// Multiplex listener.
	mux := tcp.NewMux()
	go mux.Serve(ln)

	// Append services.
	s.appendMonitorService()
	s.appendPrecreatorService(s.config.Precreator)
	s.appendSnapshotterService()
	s.appendContinuousQueryService(s.config.ContinuousQuery)
	s.appendHTTPDService(s.config.HTTPD)
	s.appendStorageService(s.config.Storage)
	s.appendRetentionPolicyService(s.config.Retention)
	for _, i := range s.config.GraphiteInputs {
		if err := s.appendGraphiteService(i); err != nil {
			return err
		}
	}
	for _, i := range s.config.CollectdInputs {
		s.appendCollectdService(i)
	}
	for _, i := range s.config.OpenTSDBInputs {
		if err := s.appendOpenTSDBService(i); err != nil {
			return err
		}
	}
	for _, i := range s.config.UDPInputs {
		s.appendUDPService(i)
	}

	s.Subscriber.MetaClient = s.MetaClient
	s.PointsWriter.MetaClient = s.MetaClient
	s.Monitor.MetaClient = s.MetaClient

	s.SnapshotterService.Listener = mux.Listen(snapshotter.MuxHeader)
	.......
}
```


——————————————————————

### HTTPDservice
是对外提供服务的主要协议，通过http协议查询数据、数据写入、修改database、增加用户等操作。

模块名称 | 功能
---|---
serveOptions | 返回一个空响应
serveQuery | 解析查询语句，如果有有效则执行查询
serveWrite | 接收传入的数据，并写入数据库
servePromWrite | 将Prometheus的远程查询请求转换成存储查询，并以Prometheus的格式返回
servePromRead | 接收Prometheu的远程写入协议中的数据，并写入数据库
servePing | 响应客户端的ping命令
serveStatus | 已废弃，用ping代替
promhttp_ServeHTTP | ---

>通过路由规则配置http请求的处理器
```go
// NewService returns a new instance of Service.
func NewService(c Config) *Service {
	s := &Service{
		addr:           c.BindAddress,
		https:          c.HTTPSEnabled,
		cert:           c.HTTPSCertificate,
		key:            c.HTTPSPrivateKey,
		limit:          c.MaxConnectionLimit,
		err:            make(chan error),
		unixSocket:     c.UnixSocketEnabled,
		unixSocketPerm: uint32(c.UnixSocketPermissions),
		bindSocket:     c.BindSocket,
		Handler:        NewHandler(c),
		Logger:         zap.NewNop(),
	}
	if s.key == "" {
		s.key = s.cert
	}
	if c.UnixSocketGroup != nil {
		s.unixSocketGroup = int(*c.UnixSocketGroup)
	}
	s.Handler.Logger = s.Logger
	return s
}

func NewHandler(c Config) *Handler {
	h := &Handler{
		mux:            pat.New(),
		Config:         &c,
		Logger:         zap.NewNop(),
		CLFLogger:      log.New(os.Stderr, "[httpd] ", 0),
		Store:          storage.NewStore(),
		stats:          &Statistics{},
		requestTracker: NewRequestTracker(),
	}

	// Limit the number of concurrent & enqueued write requests.
	h.writeThrottler = NewThrottler(c.MaxConcurrentWriteLimit, c.MaxEnqueuedWriteLimit)
	h.writeThrottler.EnqueueTimeout = c.EnqueuedWriteTimeout

	// Disable the write log if they have been suppressed.
	writeLogEnabled := c.LogEnabled
	if c.SuppressWriteLog {
		writeLogEnabled = false
	}

	h.AddRoutes([]Route{
		Route{
			"query-options", // Satisfy CORS checks.
			"OPTIONS", "/query", false, true, h.serveOptions,
		},
		Route{
			"query", // Query serving route.
			"GET", "/query", true, true, h.serveQuery,
		},
		Route{
			"query", // Query serving route.
			"POST", "/query", true, true, h.serveQuery,
		},
		Route{
			"write-options", // Satisfy CORS checks.
			"OPTIONS", "/write", false, true, h.serveOptions,
		},
		Route{
			"write", // Data-ingest route.
			"POST", "/write", true, writeLogEnabled, h.serveWrite,
		},
		Route{
			"prometheus-write", // Prometheus remote write
			"POST", "/api/v1/prom/write", false, true, h.servePromWrite,
		},
		Route{
			"prometheus-read", // Prometheus remote read
			"POST", "/api/v1/prom/read", true, true, h.servePromRead,
		},
		Route{ // Ping
			"ping",
			"GET", "/ping", false, true, h.servePing,
		},
		Route{ // Ping
			"ping-head",
			"HEAD", "/ping", false, true, h.servePing,
		},
		Route{ // Ping w/ status
			"status",
			"GET", "/status", false, true, h.serveStatus,
		},
		Route{ // Ping w/ status
			"status-head",
			"HEAD", "/status", false, true, h.serveStatus,
		},
		Route{
			"prometheus-metrics",
			"GET", "/metrics", false, true, promhttp.Handler().ServeHTTP,
		},
	}...)

	return h
}

```

# 读写流程

## 数据写入代码调用流程

```
graph TD
A(ServeWrite)
B(PointWriter.WritePoints)
C(PointsWriter.WritePointsPrivileged)
D(PointsWriter.writeToShard)
E(Store.WriteToShard)
F(Shard.WritePoints)
G(Engine.WritePoints)

A-->B
B-->C
C-->|获取points的ShardID|D
D-->|TSDBStore|E
E-->|根据ShardID获取Shard|F
F-->|TSM engine|G
```


## 数据读取代码调用流程
```
graph TD
A(ServeQuery)
B(Parser.ParseQuery)
C(QueryExecutor.ExecuteQuery)

A-->|influxql.NewParser创建解析器|B
B-->C
```


# TSM-engine读写重要接口

-- | 接口 | 功能
---|---|---
读 | CreateIterator | 返回表的游标
- | KeyCursor | 返回指定时间开始的游标
- | MeasurementTagKeysByExpr | 查询索引找到符合条件的数据源
写 | WritePoints| 写数据到engine
- | ScheduleFullCompaction | 压缩内存数据写入TSM文件
