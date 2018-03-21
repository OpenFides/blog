
# 高可用方案：
- 数据库镜像，热备份应对服务故障，成本低效率高，易于实现和管理。要实现高可用需要引入证人服务器。
- 事务复制，高性能，低成本，可数据库或表级别实现。
- 日志传送，低成本，允许在辅助服务器上运行读操作
- 备份、还原，静态的复制数据，支持压缩
- 故障转移群集，使用硬件冗余和上面技术实现整体故障转移
- 数据库快照，提供只读的数据库副本。


# keepalived主要有三个模块，分别是core、check和vrrp。
- core模块为keepalived的核心，负责主进程的启动、维护以及全局配置文件的加载和解析。
- check负责健康检查，包括常见的各种检查方式。
- vrrp模块是来实现VRRP协议的。vip即虚拟ip，是附在主机网卡上的，即对主机网卡进行虚拟，此IP仍然是占用了此网段的某个IP。

在一个VRRP虚拟路由器中，有多台物理的VRRP路由器，但是这多台的物理的机器并不能同时工作，而是由一台称为MASTER的负责路由工作，其它的都是BACKUP，MASTER并非一成不变，VRRP让每个VRRP路由器参与竞选，最终获胜的就是MASTER。MASTER拥有一些特权，比如 拥有虚拟路由器的IP地址，我们的主机就是用这个IP地址作为静态路由的。拥有特权的MASTER要负责转发发送给网关地址的包和响应ARP请求。

VRRP通过竞选协议来实现虚拟路由器的功能，所有的协议报文都是通过IP多播(multicast)包(多播地址 224.0.0.18)形式发送的。虚拟路由器由VRID(范围0-255)和一组IP地址组成，对外表现为一个周知的MAC地址。所以，在一个虚拟路由 器中，不管谁是MASTER，对外都是相同的MAC和IP(称之为VIP)。客户端主机并不需要因为MASTER的改变而修改自己的路由配置，对他们来 说，这种主从的切换是透明的。

在一个虚拟路由器中，只有作为MASTER的VRRP路由器会一直发送VRRP广告包(VRRPAdvertisement message)，BACKUP不会抢占MASTER，除非它的优先级(priority)更高。当MASTER不可用时(BACKUP收不到广告包)， 多台BACKUP中优先级最高的这台会被抢占为MASTER。这种抢占是非常快速的(<1s)，以保证服务的连续性。

# keepalived的配置文件，分别是global_defs、static_ipaddress、static_routes、vrrp_script、vrrp_instance和virtual_server。
- global_defs区域，主要是配置故障发生时的通知对象以及机器标识
- static_ipaddress和static_routes区域配置的是是本节点的IP和路由信息。如果你的机器上已经配置了IP和路由，那么这两个区域可以不用配置。其实，一般情况下你的机器都会有IP地址和路由信息的，因此没必要再在这两个区域配置。

- vrrp_script区域，用来做健康检查。当检查失败时会将vrrp_instance的priority减少相应的值。
- vrrp_instance和vrrp_sync_group区域
- vrrp_instance区域用来定义对外提供服务的VIP区域及其相关属性。
- vrrp_rsync_group区域用来定义vrrp_intance组，使得这个组内成员动作一致。

举个例子来说明一下其功能：
两个vrrp_instance同属于一个vrrp_rsync_group，那么其中一个vrrp_instance发生故障切换时，另一个vrrp_instance也会跟着切换（即使这个instance没有发生故障）。

# 编排是一个广义的概念，它是指容器调度、集群管理和可能其他主机供应配置。
- Kubernetes：这是Google的高级调度器，kubernetes提供对你的基础设备上的容器更多的控制。容器可以被打标签、分组和配置通信子网。
- compose：Docker的compose项目通过定义配置文件来提供容器组管理功能。它通过Docker的link来分析容器间的依赖关系。
- Docker Swarm：这是Docker的原生集群。Swarm 将一个 Docker 主机池转换为单个、虚拟的 Docker 主机。因为 Docker Swarm 提供了标准的 Docker API，任何已经与Docker 守护进程建立通信的工具都可以使用 Swarm 透明地扩展到多个主机。