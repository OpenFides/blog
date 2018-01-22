npm config set registry https://registry.npm.taobao.org 



## Cordova
```
//安装
npm install -g cordova
or 
npm update -g cordova
//创建项目
cordova create <path>
//得到支持平台
cordova platform
//增加支持平台
cordova platform add <platform name>
//运行应用【指定平台】
cordova run <platform name>

//Test App
cordova emulate android
```

## Ionic
一个前端开发工具给你Cordova结合开发app
```
//安装
npm install -g ionic cordova

//创建新应用
ionic start myApp --v2
ionic start myApp blank --v2
ionic start myApp tabs --v2
ionic start myApp sidemenu --v2

//Run your app
cd myApp
ionic serve
```

## plugins

1. cordova plugin add [cordova-plugin-wechat](https://www.npmjs.com/package/cordova-plugin-wechat)   
   支持微信登录和分享，支持微信支付，详细请参考 [Demo](https://github.com/xu-li/cordova-plugin-wechat) 
2. cordova plugin add [cordova-plugin-qqsdk](https://www.npmjs.com/package/cordova-plugin-qqsdk)   
   支持QQ登录和分享
3. cordova plugin add [cordova-plugin-alipay-v2](https://www.npmjs.com/package/cordova-plugin-alipay-v2)   
   支持支付宝支付
4. cordova plugin add [cordova-plugin-weibosdk](https://www.npmjs.com/package/cordova-plugin-weibosdk)  
   支持登录和分享
   
   
## user
1. user password  
一个用户只有一个密码，可以设置一个唯一用户名作为登录名
2. user mobile  
一个用户可以有多个手机号，手机号可以作为登录名使用
3. user email
一个用户可以有多个电子邮件，电子邮件可以作为登录名使用
4. user token
一个用户可以有多个token, token可以是本系统或其它系统，如：微信，QQ和微博

## message
发送给用户的消息，包括电子邮件，短信和推送通知
## catelog product 

## order

## 需要准备
1. 支付宝和微信都需要企业认证，其中微信支付认证还需要300元每次。

2. 邮件接口
![email](email.bmp)
3. 短信接口
![aaa](sohu.bmp)
![网易](netease.bmp)

4. 推送接口  
选用个推或极光，以前申请过，可以免费用

5. 服务器
web 服务器 ~2000元每年
db 服务器  ~2500元每年
域名      ~60-80元每年
dns服务   按流量计算（估计500元一年）

