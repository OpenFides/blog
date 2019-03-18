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