## Install

1.download:
wget https://pkg.jenkins.io/redhat-stable/jenkins-2.7.4-1.1.noarch.rpm
yum install jenkins-2.7.4-1.1.noarch.rpm
2.配置：
sudo vim /etc/sysconfig/jenkins

# 修改运行端口为9999，默认为8080
JENKINS_PORT="9999"
service jenkins restart

3.如果忘记密码
rm /var/lib/jenkins/config.xml -r
4.通过初始密码安装必要的插件
cat /var/lib/jenkins/secrets/initialAdminPassword
5.日志
cat /var/log/jenkins/jenkins.log

## docker 方式

sudo chown -R 1000 /var/jenkins

docker run -p 8080:8080 -p 50000:50000 -d  -v /var/jenkins:/var/jenkins_home -v /etc/localtime:/etc/localtime --name jenkins docker.io/jenkins/jenkins

docker exec jenkins tail /var/jenkins_home/secrets/initialAdminPassword


docker exec -it jenkins /bin/bash

## 直接下载

下载以下内容到opt目录中：

1. node js for node and npm
2. open jdk and maven for java and mvn
3. jenkins.war文件

更改Jenkins的主目录

```shell
vi /etc/profile 

JENKINS_HOME=/opt/jenkins
NODE_HOME=/opt/node
M2_HOME=/opt/maven
export JENKINS_HOME
export M2_HOME
export NODE_HOME
export PATH=${PATH}:${M2_HOME}/bin:${NODE_HOME}/bin

:wq
source /etc/profile
```



vi /opt/jenkins/jenkins.sh

```bash
#! /bin/sh  
# chkconfig: 2345 10 90   
# description: jenkins ....  
# This script will be executed *after* all the other init scripts.    
# You can put your own initialization stuff in here if you don't    
# want to do the full Sys V style init stuff.    
# prefix=/var/jenkins  
# nohup $prefix/start_jenkins.sh >> $prefix/jenkins.log 2>&1 &  
export PATH=$PATH:/opt/maven/bin:/opt/node/bin 
JENKINS_ROOT=/opt/jenkins
JENKINSFILENAME=jenkins.war

#停止方法  
stop(){  
    echo "Stoping $JENKINSFILENAME "
    ps -ef | grep grep -v | grep $JENKINSFILENAME |awk '{print $2}'|while read pid  
    do  
       kill -9 $pid  
       echo " $pid kill"  
    done  
}  
start()
{
    echo "Starting $JENKINSFILENAME "  
    nohup $JENKINS_ROOT/start_jenkins.sh >> $JENKINS_ROOT/jenkins.log 2>&1 &  
}
case "$1" in  
start)
  start
  ;;  
stop)  
  stop  
  ;;  
restart)  
  stop  
  start  
  ;;  
status)  
  ps -ef | grep grep -v |grep $JENKINSFILENAME  
  ;;  
*)  
  printf 'Usage: %s {start|stop|restart|status}\n' "$prog"  
  exit 1  
  ;;  
esac
```

vi /opt/jenkins/start_jenkins.sh

```bash
#!/bin/bash  
JENKINS_ROOT=/opt/jenkins
export JENKINS_HOME=$JENKINS_ROOT
java -jar $JENKINS_ROOT/jenkins.war -Dfile.encoding=UTF-8 --httpPort=8080
```

## 服务启动设置

ln -s /opt/jenkins/jenkins.sh /etc/init.d/jenkins 

chkconfig --add jenkins

chkconfig --level 345 jenkins on


## node 安装

[点击此处]: https://nodejs.org/en/download	"下载node"
