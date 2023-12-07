1. 配置yum
vim /etc/yum.repos.d/mongodb-org-3.4.repo


[mongodb-org-3.4]
name=MongoDB Repository
baseurl=https://repo.mongodb.org/yum/redhat/$releasever/mongodb-org/3.4/x86_64/
gpgcheck=1
enabled=1
gpgkey=https://www.mongodb.org/static/pgp/server-3.4.asc



2. 安装
sudo yum install -y mongodb-org


3.如果使用了SELinux
semanage port -a -t mongod_port_t -p tcp 27017


4.启动 MongoDB,设置自启动
service mongod start|stop|restart
chkconfig mongod on 

5.Remove MongoDB databases and log files.

sudo rm -r /var/log/mongodb
sudo rm -r /var/lib/mongo

6.mongo Shell
db --show current db
use test --switch database
db.Users.insert( { x: 1 } ); --insert
db["Users"].find(); --query
db.Users.find(); --query
exit/quit() -- use the <Ctrl-c> shortcut

7. 如果不能启动mongod
sudo rm /var/lib/mongodb/mongod.lock
sudo mongod --repair --dbpath /var/lib/mongodb
sudo mongod --fork --logpath /var/lib/mongodb/mongodb.log --dbpath /var/lib/mongodb 
sudo service mongod start