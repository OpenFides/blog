fdisk -l                       # 查看可挂载的磁盘
df -h                          # 查看已经挂载的磁盘
mkfs -t ext4 /dev/vdb          # 初始化磁盘,格式是ext4,注意这里会格式化可挂载磁盘
mount /dev/vdb /data1
blkid                          # 获取磁盘的uuid和属性，用uuid来进行开机mount
vim /etc/fstab                 # 开机mount，模板是UUID=********** 


vim /etc/netplan/00xxxx  # ip 设置

apt autoremove --purge snapd

lvextend -L 10G /dev/mapper/ubuntu--vg-ubuntu--lv      //增大或减小至19G
lvextend -L +10G /dev/mapper/ubuntu--vg-ubuntu--lv     //增加10G
lvreduce -L -10G /dev/mapper/ubuntu--vg-ubuntu--lv     //减小10G
lvresize -l  +100%FREE /dev/mapper/ubuntu--vg-ubuntu--lv   //按百分比扩容

resize2fs /dev/mapper/ubuntu--vg-ubuntu--lv            //执行调整

```
docker run -i -t --hostname git.rongatr.com --publish 443:443 --publish 80:80 --publish 22:22 --name gitlab --restart always --volume /opt:/opt --volume /etc/gitlab:/etc/gitlab --volume /var/log/gitlab:/var/log/gitlab --volume /var/opt/gitlab:/var/opt/gitlab  --shm-size 256m registry.gitlab.cn/omnibus/gitlab-jh:13.12.15

```

