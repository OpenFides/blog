
# 高可用方案 - keepalived

## 简介

-     keepalived是以VRRP协议为实现基础的，VRRP全称Virtual Router Redundancy Protocol，即虚拟路由冗余协议。

-     虚拟路由冗余协议，可以认为是实现路由器高可用的协议，即将N台提供相同功能的路由器组成一个路由器组，这个组里面有一个master和多个backup，master上面有一个对外提供服务的vip（该路由器所在局域网内其他机器的默认路由为该vip），master会发组播，当backup收不到VRRP包时就认为master宕掉了，这时就需要根据VRRP的优先级来选举一个backup当master。这样的话就可以保证路由器的高可用了。
-     keepalived主要有三个模块，分别是core、check和VRRP。core模块为keepalived的核心，负责主进程的启动、维护以及全局配置文件的加载和解析。check负责健康检查，包括常见的各种检查方式。VRRP模块是来实现VRRP协议的。 


## 三大模块

- core模块为keepalived的核心，负责主进程的启动、维护以及全局配置文件的加载和解析。
- check负责健康检查，包括常见的各种检查方式。
- vrrp模块是来实现VRRP协议的。vip即虚拟ip，是附在主机网卡上的，即对主机网卡进行虚拟，此IP仍然是占用了此网段的某个IP。

## VRRP虚拟路由器

在一个VRRP虚拟路由器中，有多台物理的VRRP路由器，但是这多台的物理的机器并不能同时工作，而是由一台称为MASTER的负责路由工作，其它的都是BACKUP，MASTER并非一成不变，VRRP让每个VRRP路由器参与竞选，最终获胜的就是MASTER。MASTER拥有一些特权，比如 拥有虚拟路由器的IP地址，我们的主机就是用这个IP地址作为静态路由的。拥有特权的MASTER要负责转发发送给网关地址的包和响应ARP请求。

VRRP通过竞选协议来实现虚拟路由器的功能，所有的协议报文都是通过IP多播(multicast)包(多播地址 224.0.0.18)形式发送的。虚拟路由器由VRID(范围0-255)和一组IP地址组成，对外表现为一个周知的MAC地址。所以，在一个虚拟路由 器中，不管谁是MASTER，对外都是相同的MAC和IP(称之为VIP)。客户端主机并不需要因为MASTER的改变而修改自己的路由配置，对他们来 说，这种主从的切换是透明的。

在一个虚拟路由器中，只有作为MASTER的VRRP路由器会一直发送VRRP广告包(VRRP Advertisement message)，BACKUP不会抢占MASTER，除非它的优先级(priority)更高。当MASTER不可用时(BACKUP收不到广告包)， 多台BACKUP中优先级最高的这台会被抢占为MASTER。这种抢占是非常快速的(<1s)，以保证服务的连续性。


# 安装keepalived

```sh
# 安装LVS
yum install ipvsadm
# 安装keepalived
yum install keepalived -y
# systemctl enable keepalived　
# 修改配置文件
vi /etc/keepalived/keepalived.conf

```

## 配置文件

### global_defs

> 配置故障发生时的通知对象以及机器标识

```yml
global_defs {
   notification_email {
     zhumingwu@126.com #收到通知的邮件地址
   }
   notification_email_from notification@zhumingwu.cn
   smtp_server 127.0.0.1
   smtp_connect_timeout 30
   router_id LVS_DEVEL
}
```


### vrrp_script
> 用来做健康检查
> 当检查失败时会将vrrp_instance的priority减少相应的值。
```yaml
vrrp_script monitor_nginx {
  script "[[ -f /etc/keepalived/monitor_nginx.sh ]] && exit 1 || exit 0"
  interval 1
  weight -15
}
```
> 注：vrrp_script 需要在 vrrp_instance 之前 而且需要注意 { } 前后需要有空格和回车
> 使用ps判断时还需要注意脚本本身的名称

```sh
//监控shell
vi /etc/keepalived/monitor_nginx.sh

#!/bin/bash 
if [ "$(ps -ef | grep "nginx: master process"| grep -v grep )" == "" ]
then 
    systemclt start nginx.service
    sleep 5   
  if [ "$(ps -ef | grep "nginx: master process"| grep -v grep )" == "" ] 
  then  
    killall keepalived 
  fi 
fi
```

### vrrp_instance 
> 定义对外提供服务的VIP区域及其相关属性

```yaml
vrrp_instance VI_1 {
    state MASTER            #标示状态为MASTER 备份机为BACKUP
    interface eth0          #设置实例绑定的网卡
    virtual_router_id 51    #同一实例下virtual_router_id必须相同
    priority 100            #MASTER权重要高于BACKUP 比如BACKUP为99 
    advert_int 1            #MASTER与BACKUP负载均衡器之间同步检查的时间间隔，单位是秒
    authentication {
        auth_type PASS      #主从服务器验证方式
        auth_pass 1111
    }
    virtual_ipaddress {     #设置多个vip，供外部访问
        192.168.200.16
        192.168.200.17
        192.168.200.18
    }
    track_script {
        monitor_nginx    #监控脚本
    }    
}
```


### vrrp_rsync_group
> 定义vrrp_intance组，使得这个组内成员动作一致。

举个例子来说明一下其功能：两个vrrp_instance同属于一个vrrp_rsync_group，那么其中一个vrrp_instance发生故障切换时，另一个vrrp_instance也会跟着切换（即使这个instance没有发生故障）。

## 状态检查

```sh
service keepalived start

service nginx start

# 查看主nginx的eth0设置
/sbin/ip add show eth0
```

 

 

 