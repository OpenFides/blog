1.��װ
yum install squid

2.����
vi /etc/squid/squid.conf

append:
auth_param basic program /usr/lib64/squid/basic_ncsa_auth /etc/squid/passwd
acl auth_user proxy_auth REQUIRED
http_access allow auth_user

Ȼ��ʹ��htpasswd ��/etc/squid/passwd ����û���������

3.����squid
service squid start/stop
��飺
netstat -tulpn | grep 3128

����ǽ�޸ģ�
vi /etc/sysconfig/iptables
append: -A RH-Firewall-1-INPUT -m state --state NEW,ESTABLISHED,RELATED -m tcp -p tcp --dport 3128 -j ACCEPT

/etc/rc.d/init.d/iptables save
service iptables restart