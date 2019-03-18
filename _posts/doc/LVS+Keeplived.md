## LVS + Keeplived
分别在两台设备上安装
![LVS + Keeplived](http://images2015.cnblogs.com/blog/42248/201604/42248-20160412004639957-885199920.png)
``` shell
//安装LVS
yum install ipvsadm
//安装Keepalived
yum install Keepalived
systemctl enable keepalived　
//配置Keepalived
vim /etc/keepalived/keepalived.conf

#配置的内容
! Configuration File for keepalived
 
global_defs {
   notification_email {
     zhumingwu@126.com #收到通知的邮件地址
   }
   notification_email_from zhumingwu@126.com
   smtp_server 127.0.0.1
   smtp_connect_timeout 30
   router_id LVS_DEVEL
}
 
vrrp_script monitor_nginx{
   script "/usr/local/etc/keepalived/script/monitor_nginx.sh"
   interval 1
   weight -15
}
 
vrrp_instance VI_1 {
    state BACKUP
    interface eno16777736
    virtual_router_id 51
    priority 80
    advert_int 1
    authentication {
        auth_type PASS
        auth_pass 1111
    }
    virtual_ipaddress {
        192.168.1.120
    }
    track_script {
        monitor_nginx
    }
}
 
virtual_server 192.168.1.120 80 {
    delay_loop 6
    lb_algo wrr
    lb_kind DR
    persistence_timeout 50
    protocol TCP
 
    real_server 192.168.1.103 80 {
        weight 1
        TCP_CHECK {
            connect_timeout 10
            nb_get_retry 3
            delay_before_retry 3
            connect_port 80
        }
    }
 
    real_server 192.168.1.104 80 {
        weight 5
        TCP_CHECK {
            connect_timeout 10
            nb_get_retry 3
            delay_before_retry 3
            connect_port 80
        }
    }
}


//监控shell
vim /usr/local/etc/keepalived/script/monitor_nginx.sh

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
