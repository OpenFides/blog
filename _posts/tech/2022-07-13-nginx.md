#easy way to install nginx#
yum install epel-release
yum -y install nginx


service nginx start
service nginx stop

systemctl enable nginx
service nginx restart

if proxy_pass Permission denied
#Somehow SELinux was not permitting Nginx to proxy to my server. Running the command below fixed the issue.
/usr/sbin/setsebool httpd_can_network_connect true 
end if

uninstall
yum erase -y pcre-devel 
yum erase -y epel-release
yum erase -y nginx 


一、安装nginx 
1、在nginx官方网站下载一个包，下载地址是：http://nginx.org/en/download.html 
wget http://nginx.org/download/nginx-1.10.1.tar.gz
tar zxf nginx-1.10.1.tar.gz
cd nginx-1.10.1
4、安装pcre开发包 
yum install -y pcre-devel 
5、如果安装出现在下面的错误是缺少编译环境。安装编译源码所需的工具和库 
./configure --prefix=/opt/nginx  error: C compiler cc is not found 
yum install gcc gcc-c++ ncurses-devel perl 
6、安装cmake，从http://www.cmake.org下载源码并编译安装 
yum -y install make gcc gcc-c++ ncurses-devel 
yum -y install zlib zlib-devel 
7、如果需要ssl功能需要openssl库 
yum -y install openssl openssl--devel 
8、安装nginx 
cd nginx-1.10.1
./configure --prefix=/opt/nginx --with-http_ssl_module
make 
make install 
9、启动服务 
/opt/nginx/sbin/nginx  -c /opt/nginx/conf/nginx.conf 
10、停止服务 
/opt/nginx/sbin/nginx -s stop 
11、查看端口占用情况 
netstat -tunlp 
12、如果其它机器无法访问，解决方法如下： 
/sbin/iptables -I INPUT -p tcp --dport 80 -j ACCEPT
/etc/rc.d/init.d/iptables save
service iptables restart

13、重启
/opt/nginx/sbin/nginx -s reload



5.设置自动启动
vim /etc/init.d/nginx

#!/bin/bash
# chkconfig:  2345 90 10
# description:  Nginx Web Server
PATH=/usr/local/bin:/sbin:/usr/bin:/bin
EXEC=/opt/nginx/sbin/nginx
CONF=/opt/nginx/conf/nginx.conf
case "$1" in
    start)
        $EXEC -c $CONF
        ;;
    *)
        $EXEC -s $1
        exit 1
esac

执行权限
chmod +x /etc/init.d/nginx 

# 开启服务自启动
chkconfig nginx on

# 尝试启动或停止nginx
service nginx start
service nginx stop

sudo ln -s /opt/redis/redis-cli /usr/local/bin



