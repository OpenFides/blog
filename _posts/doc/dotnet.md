1.	安装.NET Core
if error
yum install libunwind
yum install libicu
end if
curl -sSL https://raw.githubusercontent.com/dotnet/cli/rel/1.0.0-preview1/scripts/obtain/dotnet-install.sh | bash /dev/stdin --version 1.0.0-preview1-002702 --install-dir ~/dotnet

安装完.net core后我们需要配置一个快捷方式，也可以配置环境变量，否则CentOS不认识dotnet命令
ln -s ~/dotnet/dotnet /usr/local/bin

2.	test the install
mkdir hwapp
cd hwapp
dotnet new

dotnet restore
dotnet run


3.	install docker
yum install docker
systemctl start docker

if auto start docker server
systemctl enable docker
end if

docker run -it microsoft/dotnet:latest

4.install vs code
if error
yum install libXScrnSaver
end if