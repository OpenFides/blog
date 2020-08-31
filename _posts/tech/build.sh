cd /app/www
cd $JOB_NAME

#容器要映射到宿主机的端口号
port=7070
#容器内部暴露的端口号
container_port=80
#构建的镜像名称
image_name=$JOB_NAME
#容器启动之后的服务名
container_name=$JOB_NAME
#默认要保留历史镜像数量
image_number=2
#重启后是否打开日志界面
open_log=true
newversion=$BUILD_NUMBER

docker build -t ${image_name}:${newversion} .
tag=`docker images | grep ${image_name} | awk '{print $2}' | sort -n`
echo "现存在的版本有 "
echo "${tag[@]}"
flag=0
for loop in ${tag[@]}
do
    if [ ${loop} == ${newversion} ]
    then
        echo "新镜像构建成功"
        echo ${newversion} > version.txt
        flag=1
    fi
    size=`docker images | grep -c ${image_name}`
    if [ ${size} -gt ${image_number} ]
        then
            echo "只保留${image_number}个镜像，删除版本为${loop}的${image_name}历史镜像"
            docker rmi ${image_name}:${loop}
        fi
done

if [ ${flag} -eq 1 ]
then
        docker stop ${container_name}
        if [ $(docker ps | grep -c ${container_name})  -lt 1 ]
        then
            echo "成功停止旧容器${container_name}"
        fi
        docker rm ${container_name}
        if [ $(docker ps -a| grep -c ${container_name})  -lt 1 ]
        then
            echo "成功移除旧容器${container_name}"
        fi

        docker run --name=${container_name} --restart=always -p ${port}:${container_port} -d ${image_name}:${newversion}
        if [ $(docker ps -a| grep -c ${container_name}) -ge 1 ]
        then
            echo "新容器${container_name}启动成功"
            container_id=`docker ps -a | grep ${container_name} |awk '{print $1}'`
            echo "新容器id为${container_id}"
            if ${open_log}
            then
               sleep 2
               docker logs ${container_id} -f --tail 200
            fi
        fi
else
    echo "镜像${image_name}构建失败"
fi