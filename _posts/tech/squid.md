1.安装
yum install squid

2.配置
vi /etc/squid/squid.conf

append:
auth_param basic program /usr/lib64/squid/basic_ncsa_auth /etc/squid/passwd
acl auth_user proxy_auth REQUIRED
http_access allow auth_user

然后使用htpasswd 向/etc/squid/passwd 添加用户名和密码

3.启动squid
service squid start/stop
检查：
netstat -tulpn | grep 3128

防火墙修改：
vi /etc/sysconfig/iptables
append: -A RH-Firewall-1-INPUT -m state --state NEW,ESTABLISHED,RELATED -m tcp -p tcp --dport 3128 -j ACCEPT

/etc/rc.d/init.d/iptables save
service iptables restart