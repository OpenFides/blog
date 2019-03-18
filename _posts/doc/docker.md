## 安装五笔
yum install ibus ibus-table-wubi
## 安装docker
export http_proxy=http://172.16.210.31:8080/
# 安装Docker
    yum install docker
    #启动docker服务
    systemctl  start docker.service
    #配置开机启动
    systemctl  enable docker.service

## Docker加速
	//修改daemon配置文件/etc/docker/daemon.json
    sudo mkdir -p /etc/docker
    sudo tee /etc/docker/daemon.json <<-'EOF'{  "registry-mirrors": ["https://ihllojuv.mirror.aliyuncs.com"]
    }
    EOF
    sudo systemctl daemon-reload
    sudo systemctl restart docker

## ASP.Net Core Docker
1. 编译asp.net core copy to /docker/pulish
2. 进入/docker/publish目录执行
```
vim dockerfile
//file content
FROM microsoft/aspnetcore:1.1
COPY . /publish
WORKDIR /publish   
EXPOSE 80
CMD ["dotnet", "Bzway.Sites.BackOffice.dll"]
```
3. 生成一个名为web-netcore的镜像
```
docker build -t web-netcore . 
```
4. 运行docker容器
```
//demo是制定容器的名称，-p是进行宿主和容器之间端口的映射
docker run --name demo  -p 8080:80 web-netcore:late
```


## Docker的退出后进入

本文将讨论五种（4+1）连接Docker容器并与其进行交互的方法。
1.nsenter
安装nsenter 可以按照下面的方法从源码安装
$ curl https://www.kernel.org/pub/linux/utils/util-linux/v2.24/util-linux-2.24.tar.gz | tar -zxf-; cd util-linux-2.24;  
or
$ wget https://www.kernel.org/pub/linux/utils/util-linux/v2.24/util-linux-2.24.tar.gz; tar xzvf util-linux-2.24.tar.gz;cd util-linux-2.24;
$ ./configure --without-ncurses && make nsenter  
$ sudo cp nsenter /usr/local/bin  
 

为了连接到容器，你还需要找到容器的第一个进程的PID，通过这个PID，你就可以连接到这个容器：
$ docker inspect --format "{{ .State.Pid }}" <container-id>  
or
$ run 'docker inspect -f "{{ .State.Pid }}" <container-id>'  
$ nsenter --target $PID --mount --uts --ipc --net --pid  

2.nsinit
从0.9版本开始，Docker自身就具有一个管理容器的库，名字为 libcontainer。libcontainer中的nsinit工具允许用户直接访问linux名字空间和cgroup内核。在安装nsinit之前，你首先需要安装Go运行时环境：

$ apt-get installgit golang-go   
  
$ mkdir-p $HOME/go-dev/binmkdir-p $HOME/go-dev/src  
  
$ echo"export GOPATH=\$HOME/go-dev" >> ~/.profileecho "PATH=\$PATH:\$GOPATH/bin">> ~/.profile   
  
$ source~/.profile  
 
接下来才安装nsinit:
$ mkdir -p $GOPATH/src/github.com/dotcloudcd$GOPATH/src/github.com/dotcloud  
  
$ git clone <a target=_blank href="https://github.com/dotcloud/docker.git">https://github.com/dotcloud/docker.git</a> $GOPATH/src/github.com/dotcloud/docker  
  
$ /usr/bin/goget -v github.com/dotcloud/docker/vendor/src/github.com/docker/libcontainer/nsinit  

nsinit读取的是位于/var/lib/docer/execdriver/native/<Container-id>容器目录下的配置数据。要运行nsinit，你需要切换到容器目录下。由于/var/lib/docker目录对于root用户是只读权限，因此你还需要root权限。通过docker的ps命令，你可以确定容器ID。一旦你进入/var/lib/docker目录，你就可以连接容器了：

nsinit exec /bin/bash  

3.lxc(-attach)
直到Docker 0.8.1版本为止，LXC一直是管理容器的基本工具，Docker一直支持这个工具。但是从0.9.0版本开始，Docker默认使用libcontainer管理容器，不再依赖LXC了。因此默认情况下，你不能使用lxc-attach了。

如果你仍然希望使用lxc-attach，那么你需要使用-e lxc选项来重新启动Docker服务进程。使用这个选项，Docker的内部将再次使用LXC管理容器了。完成这个任务最简单的做法就是创建/etc/default/docker文件（如果这个文件仍然不存在），并添加以下内容：
DOCKER_OPTS=" -e lxc"  

现在你可以重新启动Docker服务了。要连接容器，你需要知道完整的容器ID:
docker ps --no-trunc  
接下来，你就可以连接这个容器了。要完成下面工作，你还需要root权限：

lxc-attach -n <container-id> -- /bin/bash  

4.sshd
上面所有三种方法都要求具有主机系统的root权限。为了不采用root权限，通过ssh访问容器将是一个很好的选择。

要做到这一点，你需要构建一个支持SSH服务的基础映像。此时，我们可能遇到这样的问题：我们是不是用Docker CMD或者ENTRYPOINT运行一条命令就可以了？如果此时有sshd进程运行，那么我们就不要再运行其他进程了。接下来的工作是创建一个脚本或者使用像supervisord这样的进程管理工具来启动其它所有需要启动的进程。有关如何使用supervisord的优秀的文档可以在Docker的web站点上找到。一旦你启动了具有sshd进程的容器，你就可以像以往一样通过ssh客户端了连接这个容器了。

结论
sshd方法可能是最简单的连接容器的方法，而且大多数用户习惯通过ssh连接虚拟机。另外，连接容器时你也不需要一定使用root权限。不过，对于是否一个容器是否应当管理不止一个进程仍然存在许多争议。这种方法最终使得每个容器了多了一个sshd进程，这从根本上来说不是进程虚拟化的所提倡的。

另外三种方法都需要root权限。到0.8.1版本为止，Docker都是使用LXC来管理容器的。正是由于这个原因，使用lxc-attach连接容器就非常容易。不过从版本0.9.0开始Docker服务就必须使用 -e lxc选项启动才能在内部支持LXC管理容器。不过，由于设置了这个选项，Docker将再次依赖LXC，而LXC可能随着发布或者安装的不同可能被剔除。

nsenter和nsinit总的来说是相同的。这两个工具的主要区别是nsinit在本身的容器了建立了一个新的进程，而nsenter只是访问了名字空间。


 

nsenter还可实现多终端对一个容器的操作。如果进入已经终止的容器，第一次安装执行的时候是可以的，可以得到PID的值，不过之后再执行的时候发现PID的值为0，如果你接着执行
nsenter --target $PID --mount --uts --ipc --net --pid
你会发现 切换到了宿主机的超级管理员权限。正确的方法会在下面介绍，首先先补充一下一些命令的参数的含义：
    docker images： 列出images

    docker images -a ：列出所有的images（包含历史）

    docker images --tree ：显示镜像的所有层(layer)

    docker rmi  <image ID>： 删除一个或多个image

查看容器
    docker ps ：列出当前所有正在运行的container
    docker ps -l ：列出最近一次启动的container
    docker ps -a ：列出所有的container（包含历史，即运行过的container）
    docker ps -q ：列出最近一次运行的container ID

5.重点来了：
$ docker ps -a  
CONTAINER ID        IMAGE               COMMAND             CREATED             STATUS           PORTS        NAMES  
9cff554fb6d7        ubuntuold:14.04     /bin/bash           About an hour ago   Up About an hour        condescending_blackwell     
e5c5498881ed        ubuntuold:14.04     /bin/bash           About an hour ago   Exited (0) 55 minutes ago  backstabbing_bardeen    
    通过以上的信息可以看出两者之间的差别：前者是正在运行的容器；而后者是已经终止的容器（Exited(0)）。

    docker start/stop/restart<container> ：开启/停止/重启container
    docker start [container_id] ：再次运行某个container（包括历史container）
    docker attach [container_id]：连接一个正在运行的container实例（即实例必须为start状态，可以多个窗口同时attach一个container实例）
    docker start -i <container>：启动一个container并进入交互模式（相当于先start，在attach）

 

就以后者e5c5498881ed为例：首先执行

$ docker start e5c5498881ed  
//之后再一次查看的时候Exited(0)已经没有了，也就是说明该容器已经从终止的状态变为了正在运行的状态  
  
$docker attach e5c5498881ed  
//你会的发现已经进入该容器了，而且之前的操作的文件依然存在  
//如果没有反应的话，再一次点击回车即可  

    docker run -i -t <image> /bin/bash：使用image创建container并进入交互模式, login shell是/bin/bash
    docker run -i -t -p <host_port:contain_port>：映射 HOST 端口到容器，方便外部访问容器内服务，host_port 可以省略，省略表示把 container_port映射到一个动态端口。
   注：使用start是启动已经创建过得container，使用run则通过image开启一个新的container。

 

附加：

查看root密码
docker容器启动时的root用户的密码是随机分配的。所以，通过这种方式就可以得到容器的root用户的密码了。
docker logs 5817938c3f6e 2>&1 | grep 'User: ' | tail -n1
