1. 下载Sonar
   wget https://akamai.bintray.com/21/21ecd2a1c85bfb438411e44d7b9edcca310e8d6fca96b6da97efe9481ff3b806?__gda__=exp=1480681936~hmac=61bf4ffe764ce79ceaa68a2170da54f394f4316d01ecc5ed6cecbcbd7b166aa5&response-content-disposition=attachment%3Bfilename%3D%22sonarqube-6.1.zip%22&response-content-type=application%2Fzip&requestInfo=U2FsdGVkX19b-wezEwR8XG0QQLR8bcfNtemtYEychRyEjF4dCAmBMPKYZR2Qtkk56Fo0MkMk6L8y8GyWh4HJFTIlnXrxgksTIHyUwglpxB8EzQuiWSGyN9OKOh64Th7r93fM7dU7aojzeqa_9JYx0kB_SZEZXBdWZLbuWSP7EcA-j-eNCFnr06Ot9hZx9BHW

2. 使用mysql数据

```sh
vim conf/sonar.properties
```

```
sonar.jdbc.username=sonar
sonar.jdbc.password=abc123$
sonar.jdbc.url=jdbc:mysql://localhost:3306/sonar?useUnicode=true&characterEncoding=utf8&rewriteBatchedStatements=true&useConfigs=maxPerformance
```

3. 创建数据并授权

```sql
create database sonar;
show databases;
create user sonar@localhost identified by 'abc123$';
grant all on sonar.* to sonar;
```

4. start sonar server

```sh
groupadd sonar
useradd sonar -g sonar
chown -R sonar:sonar /opt/sonarqube
/opt/sonarqube/bin/linux-x86-64/sonar.sh start
# if error remove temp files
rm -rf temp/ logs/
```

5. 服务启动

```sh
vi /etc/init.d/sonar
```

```sh
#!/bin/sh  
#chkconfig: 345 96 10  
#description:SonarQube system (www.sonarsource.org)  
### BEGIN INIT INFO  
# Provides: sonar  
# Required-Start:$network  
# Required-Stop:$network  
# Default-Start: 3 4 5  
# Default-Stop: 0 1 2 6  
# Short-Description:SonarQube system (www.sonarsource.org)  
# Description:SonarQube system (www.sonarsource.org)  
### END INIT INFO  
su - sonar -c "/opt/sonarqube/bin/linux-x86-64/sonar.sh $*"
```

增加执行权限

```sh
chmod +x /etc/init.d/sonar
```

添加服务

```sh
chkconfig --add sonar
chkconfig sonar on
```

配置服务启动时依赖的jdk

```sh
vi /opt/sonarqube/conf/wrapper.conf
```

修改wrapper.java.command=java，配置为jdk中java命令的绝对路径:

wrapper.java.command=/opt/jdk/bin/java

启动服务

```sh
service sonar start
```
 
