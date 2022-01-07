## 安装五笔

yum install ibus ibus-table-wubi


## 安装Docker

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


## Docker的命令

正确的方法会在下面介绍，首先先补充一下一些命令的参数的含义：
    docker images： 列出images
    docker images -a ：列出所有的images（包含历史）
    docker images --tree ：显示镜像的所有层(layer)
    docker rmi  <image ID>： 删除一个或多个image

查看容器
    docker ps ：列出当前所有正在运行的container
    docker ps -l ：列出最近一次启动的container
    docker ps -a ：列出所有的container（包含历史，即运行过的container）
    docker ps -q ：列出最近一次运行的container ID


docker start/stop/restart <container> ：开启/停止/重启container
docker start [container_id] ：再次运行某个container（包括历史container）
docker attach [container_id]：连接一个正在运行的container实例（即实例必须为start状态，可以多个窗口同时attach一个container实例）
docker start -i <container>：启动一个container并进入交互模式（相当于先start，在attach）

 
docker run -i -t <image> /bin/bash：使用image创建container并进入交互模式, login shell是/bin/bash
docker run -i -t -p <host_port:contain_port>：映射 HOST 端口到容器，方便外部访问容器内服务，host_port 可以省略，省略表示把 container_port映射到一个动态端口。
注：使用start是启动已经创建过得container，使用run则通过image开启一个新的container。

 

## 附加：

查看root密码
docker容器启动时的root用户的密码是随机分配的。所以，通过这种方式就可以得到容器的root用户的密码了。
docker logs 5817938c3f6e 2>&1 | grep 'User: ' | tail -n1

docker commit ${container.id} ${images.id}

docker push ${images.id}

docker build -t runoob/centos:6.7 .

docker tag ${images.id} ${images.name}:dev

docker export -o ${file.name}.tar ${container.id}
docker import  ${file.name}.tar ${images.id}

docker save -o ${file.name}.tar ${images.id}
docker save ${images.id}>${file.name}.tar

docker load < ${file.name}.tar.gz
docker load --input ${file.name}.tar

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
