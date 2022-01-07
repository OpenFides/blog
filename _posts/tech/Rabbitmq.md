1. install erlang
yum install erlang   -y
or 
wget http://www.erlang.org/download/otp_src_17.1.tar.gz
tar zxvf  otp_src_17.1.tar.gz
cd  otp_src_17.1
./configure
make && make install 

2. confirm
erl 
1+1 .
halt().

3. download from https://www.rabbitmq.com/install-rpm.html
wget https://www.rabbitmq.com/releases/rabbitmq-server/v3.6.6/rabbitmq-server-3.6.6-1.el7.noarch.rpm
or 
wget https://github.com/rabbitmq/rabbitmq-server/releases/download/rabbitmq_v3_6_6/rabbitmq-server-3.6.6-1.el7.noarch.rpm
yum install rabbitmq-server-3.6.6-1.el7.noarch.rpm 

4. start server
cd /usr/rabbitmq/sbin/

rabbitmq-server  -detached
rabbitmqctl stop

rabbitmqctl status 

5. 增加用户admin，密码admin
rabbitmqctl add_user admin admin 
rabbitmqctl set_user_tags admin administraotr 
rabbitmqctl list_users 
