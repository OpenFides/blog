---
title=install docker on wsl

---



```shell
sudo apt update
sudo apt install libltdl7 cgroupfs-mount
sudo curl -O https://mirrors.tuna.tsinghua.edu.cn/docker-ce/linux/debian/dists/stretch/pool/stable/amd64/docker-ce_17.09.1~ce-0~debian_amd64.deb
sudo dpkg -i docker-ce_17.09.1~ce-0~debian_amd64.deb
sudo usermod -aG docker $USER
sudo cgroupfs-mount
sudo service docker start
sudo docker version

```

