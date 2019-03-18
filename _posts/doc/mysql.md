1.MYSQL 安装
yum install mysql-server 
or 
wget http://repo.mysql.com/mysql-community-release-el7-5.noarch.rpm
sudo rpm -ivh mysql-community-release-el7-5.noarch.rpm
or 
yum install mysql-community-release-el7-5.noarch.rpm
yum update

yum install mysql-server


sudo systemctl start mysqld

sudo mysql_secure_installation


2.connect to mysql server
mysql  -u root -p123 -h 110.110.110.110
其中 password 和 host可以省略

3.设置密码
mysqladmin -u root -p oldpassword password newpassword


4.创建数据并授权
create database testdb;
show databases;
create user test@localhost identified by 'password';
grant all on testdb.* to 'test' identified by 'password';
 