1.download:
wget https://pkg.jenkins.io/redhat-stable/jenkins-2.7.4-1.1.noarch.rpm
yum install jenkins-2.7.4-1.1.noarch.rpm


2.���ã�
sudo vim /etc/sysconfig/jenkins
# �޸����ж˿�Ϊ9999��Ĭ��Ϊ8080
JENKINS_PORT="9999"

service jenkins restart

3.�����������
rm /var/lib/jenkins/config.xml -r

4.ͨ����ʼ���밲װ��Ҫ�Ĳ��
cat /var/lib/jenkins/secrets/initialAdminPassword

5.��־
cat /var/log/jenkins/jenkins.log