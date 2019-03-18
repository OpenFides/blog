## ��װ���
yum install ibus ibus-table-wubi
## ��װdocker
export http_proxy=http://172.16.210.31:8080/
# ��װDocker
    yum install docker
    #����docker����
    systemctl  start docker.service
    #���ÿ�������
    systemctl  enable docker.service

## Docker����
	//�޸�daemon�����ļ�/etc/docker/daemon.json
    sudo mkdir -p /etc/docker
    sudo tee /etc/docker/daemon.json <<-'EOF'{  "registry-mirrors": ["https://ihllojuv.mirror.aliyuncs.com"]
    }
    EOF
    sudo systemctl daemon-reload
    sudo systemctl restart docker

## ASP.Net Core Docker
1. ����asp.net core copy to /docker/pulish
2. ����/docker/publishĿ¼ִ��
```
vim dockerfile
//file content
FROM microsoft/aspnetcore:1.1
COPY . /publish
WORKDIR /publish   
EXPOSE 80
CMD ["dotnet", "Bzway.Sites.BackOffice.dll"]
```
3. ����һ����Ϊweb-netcore�ľ���
```
docker build -t web-netcore . 
```
4. ����docker����
```
//demo���ƶ����������ƣ�-p�ǽ�������������֮��˿ڵ�ӳ��
docker run --name demo  -p 8080:80 web-netcore:late
```


## Docker���˳������

���Ľ��������֣�4+1������Docker������������н����ķ�����
1.nsenter
��װnsenter ���԰�������ķ�����Դ�밲װ
$ curl https://www.kernel.org/pub/linux/utils/util-linux/v2.24/util-linux-2.24.tar.gz | tar -zxf-; cd util-linux-2.24;  
or
$ wget https://www.kernel.org/pub/linux/utils/util-linux/v2.24/util-linux-2.24.tar.gz; tar xzvf util-linux-2.24.tar.gz;cd util-linux-2.24;
$ ./configure --without-ncurses && make nsenter  
$ sudo cp nsenter /usr/local/bin  
 

Ϊ�����ӵ��������㻹��Ҫ�ҵ������ĵ�һ�����̵�PID��ͨ�����PID����Ϳ������ӵ����������
$ docker inspect --format "{{ .State.Pid }}" <container-id>  
or
$ run 'docker inspect -f "{{ .State.Pid }}" <container-id>'  
$ nsenter --target $PID --mount --uts --ipc --net --pid  

2.nsinit
��0.9�汾��ʼ��Docker����;���һ�����������Ŀ⣬����Ϊ libcontainer��libcontainer�е�nsinit���������û�ֱ�ӷ���linux���ֿռ��cgroup�ںˡ��ڰ�װnsinit֮ǰ����������Ҫ��װGo����ʱ������

$ apt-get installgit golang-go   
  
$ mkdir-p $HOME/go-dev/binmkdir-p $HOME/go-dev/src  
  
$ echo"export GOPATH=\$HOME/go-dev" >> ~/.profileecho "PATH=\$PATH:\$GOPATH/bin">> ~/.profile   
  
$ source~/.profile  
 
�������Ű�װnsinit:
$ mkdir -p $GOPATH/src/github.com/dotcloudcd$GOPATH/src/github.com/dotcloud  
  
$ git clone <a target=_blank href="https://github.com/dotcloud/docker.git">https://github.com/dotcloud/docker.git</a> $GOPATH/src/github.com/dotcloud/docker  
  
$ /usr/bin/goget -v github.com/dotcloud/docker/vendor/src/github.com/docker/libcontainer/nsinit  

nsinit��ȡ����λ��/var/lib/docer/execdriver/native/<Container-id>����Ŀ¼�µ��������ݡ�Ҫ����nsinit������Ҫ�л�������Ŀ¼�¡�����/var/lib/dockerĿ¼����root�û���ֻ��Ȩ�ޣ�����㻹��ҪrootȨ�ޡ�ͨ��docker��ps��������ȷ������ID��һ�������/var/lib/dockerĿ¼����Ϳ������������ˣ�

nsinit exec /bin/bash  

3.lxc(-attach)
ֱ��Docker 0.8.1�汾Ϊֹ��LXCһֱ�ǹ��������Ļ������ߣ�Dockerһֱ֧��������ߡ����Ǵ�0.9.0�汾��ʼ��DockerĬ��ʹ��libcontainer������������������LXC�ˡ����Ĭ������£��㲻��ʹ��lxc-attach�ˡ�

�������Ȼϣ��ʹ��lxc-attach����ô����Ҫʹ��-e lxcѡ������������Docker������̡�ʹ�����ѡ�Docker���ڲ����ٴ�ʹ��LXC���������ˡ�������������򵥵��������Ǵ���/etc/default/docker�ļ����������ļ���Ȼ�����ڣ���������������ݣ�
DOCKER_OPTS=" -e lxc"  

�����������������Docker�����ˡ�Ҫ��������������Ҫ֪������������ID:
docker ps --no-trunc  
����������Ϳ���������������ˡ�Ҫ������湤�����㻹��ҪrootȨ�ޣ�

lxc-attach -n <container-id> -- /bin/bash  

4.sshd
�����������ַ�����Ҫ���������ϵͳ��rootȨ�ޡ�Ϊ�˲�����rootȨ�ޣ�ͨ��ssh������������һ���ܺõ�ѡ��

Ҫ������һ�㣬����Ҫ����һ��֧��SSH����Ļ���ӳ�񡣴�ʱ�����ǿ����������������⣺�����ǲ�����Docker CMD����ENTRYPOINT����һ������Ϳ����ˣ������ʱ��sshd�������У���ô���ǾͲ�Ҫ���������������ˡ��������Ĺ����Ǵ���һ���ű�����ʹ����supervisord�����Ľ��̹���������������������Ҫ�����Ľ��̡��й����ʹ��supervisord��������ĵ�������Docker��webվ�����ҵ���һ���������˾���sshd���̵���������Ϳ���������һ��ͨ��ssh�ͻ�����������������ˡ�

����
sshd������������򵥵����������ķ��������Ҵ�����û�ϰ��ͨ��ssh��������������⣬��������ʱ��Ҳ����Ҫһ��ʹ��rootȨ�ޡ������������Ƿ�һ�������Ƿ�Ӧ������ֹһ��������Ȼ����������顣���ַ�������ʹ��ÿ�������˶���һ��sshd���̣���Ӹ�������˵���ǽ������⻯�����ᳫ�ġ�

�������ַ�������ҪrootȨ�ޡ���0.8.1�汾Ϊֹ��Docker����ʹ��LXC�����������ġ������������ԭ��ʹ��lxc-attach���������ͷǳ����ס������Ӱ汾0.9.0��ʼDocker����ͱ���ʹ�� -e lxcѡ�������������ڲ�֧��LXC�����������������������������ѡ�Docker���ٴ�����LXC����LXC�������ŷ������߰�װ�Ĳ�ͬ���ܱ��޳���

nsenter��nsinit�ܵ���˵����ͬ�ġ����������ߵ���Ҫ������nsinit�ڱ���������˽�����һ���µĽ��̣���nsenterֻ�Ƿ��������ֿռ䡣


 

nsenter����ʵ�ֶ��ն˶�һ�������Ĳ�������������Ѿ���ֹ����������һ�ΰ�װִ�е�ʱ���ǿ��Եģ����Եõ�PID��ֵ������֮����ִ�е�ʱ����PID��ֵΪ0����������ִ��
nsenter --target $PID --mount --uts --ipc --net --pid
��ᷢ�� �л������������ĳ�������ԱȨ�ޡ���ȷ�ķ�������������ܣ������Ȳ���һ��һЩ����Ĳ����ĺ��壺
    docker images�� �г�images

    docker images -a ���г����е�images��������ʷ��

    docker images --tree ����ʾ��������в�(layer)

    docker rmi  <image ID>�� ɾ��һ������image

�鿴����
    docker ps ���г���ǰ�����������е�container
    docker ps -l ���г����һ��������container
    docker ps -a ���г����е�container��������ʷ�������й���container��
    docker ps -q ���г����һ�����е�container ID

5.�ص����ˣ�
$ docker ps -a  
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS           PORTS        NAMES  
9cff554fb6d7        ubuntuold:14.04     /bin/bash           About an hour ago   Up About an hour        condescending_blackwell     
e5c5498881ed        ubuntuold:14.04     /bin/bash           About an hour ago   Exited (0) 55 minutes ago  backstabbing_bardeen    
    ͨ�����ϵ���Ϣ���Կ�������֮��Ĳ��ǰ�����������е����������������Ѿ���ֹ��������Exited(0)����

    docker start/stop/restart<container> ������/ֹͣ/����container
    docker start [container_id] ���ٴ�����ĳ��container��������ʷcontainer��
    docker attach [container_id]������һ���������е�containerʵ������ʵ������Ϊstart״̬�����Զ������ͬʱattachһ��containerʵ����
    docker start -i <container>������һ��container�����뽻��ģʽ���൱����start����attach��

 

���Ժ���e5c5498881edΪ��������ִ��

$ docker start e5c5498881ed  
//֮����һ�β鿴��ʱ��Exited(0)�Ѿ�û���ˣ�Ҳ����˵���������Ѿ�����ֹ��״̬��Ϊ���������е�״̬  
  
$docker attach e5c5498881ed  
//���ķ����Ѿ�����������ˣ�����֮ǰ�Ĳ������ļ���Ȼ����  
//���û�з�Ӧ�Ļ�����һ�ε���س�����  

    docker run -i -t <image> /bin/bash��ʹ��image����container�����뽻��ģʽ, login shell��/bin/bash
    docker run -i -t -p <host_port:contain_port>��ӳ�� HOST �˿ڵ������������ⲿ���������ڷ���host_port ����ʡ�ԣ�ʡ�Ա�ʾ�� container_portӳ�䵽һ����̬�˿ڡ�
   ע��ʹ��start�������Ѿ���������container��ʹ��run��ͨ��image����һ���µ�container��

 

���ӣ�

�鿴root����
docker��������ʱ��root�û����������������ġ����ԣ�ͨ�����ַ�ʽ�Ϳ��Եõ�������root�û��������ˡ�
docker logs 5817938c3f6e 2>&1 | grep 'User: ' | tail -n1
