安装redis

1.	下载解压编译
wget http://download.redis.io/releases/redis-3.2.5.tar.gz
tar zxvf redis-3.2.5.tar.gz 
cd redis-3.2.5
make

2.	编译完成后，将src目录下四个可执行文件redis-server、redis-benchmark、redis-cli和redis.conf放到目标文件夹中
cd src
mkdir /opt/redis
cp redis-server  /opt/redis
cp redis-benchmark /opt/redis
cp redis-cli  /opt/redis
cp ../redis.conf  /opt/redis

3.启动服务
cd /opt/redis
./redis-server redis.conf
查看进程，确认redis已经启动
ps -ef | grep redis


4.连接服务
cd /opt/redis
./redis-cli

5.设置自动启动
vim /etc/init.d/redis

#!/bin/bash
# chkconfig:  2345 90 10
# description:  Redis is a persistent key-value database
PATH=/usr/local/bin:/sbin:/usr/bin:/bin
REDISPORT=6379
EXEC=/opt/redis/redis-server
REDIS_CLI=/opt/redis/redis-cli
PIDFILE=/var/run/redis_6379.pid
CONF=/opt/redis/redis.conf
case "$1" in
    start)
        if [ -f $PIDFILE ]
        then
                echo "$PIDFILE exists, process is already running or crashed"
        else
                echo "Starting Redis server..."
                $EXEC $CONF &
        fi
        if [ "$?"="0" ]
        then
              echo "Redis is running..."
        fi
        ;;
    stop)
        if [ ! -f $PIDFILE ]
        then
                echo "$PIDFILE does not exist, process is not running"
        else
                PID=$(cat $PIDFILE)
                echo "Stopping ..."
                $REDIS_CLI -p $REDISPORT SHUTDOWN
                while [ -x ${PIDFILE} ]
                do
                    echo "Waiting for Redis to shutdown ..."
                    sleep 1
                done
                echo "Redis stopped"
        fi
        ;;
   restart|force-reload)
        ${0} stop
        ${0} start
        ;;
   *)
        echo "Usage: /etc/init.d/redis {start|stop|restart|force-reload}" >&2
        exit 1
esac

执行权限
chmod +x /etc/init.d/redis 

# 开启服务自启动
chkconfig redis on

# 尝试启动或停止redis
service redis start
service redis stop

sudo ln -s /opt/redis/redis-cli /usr/local/bin