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
   
# Flutter

Flutter是移动端开发SDK，包括框架，控件和工具等，能开发出漂亮的移动端APP，且同时支持Android和iOS。


## 下载
```shell

git clone https://github.com/flutter/flutter.git
set path=%cd%/flutter/bin;%path%
flutter doctor  

```
## 使用 IntelliJ IDEA开发
### 安装Flutter和Dart插件
打开IntelliJ IDEA，在仓库里面搜索flutter，然后点击Install，安装的时候自动安装了Dart。
### Creating Flutter Project
### main.dart代码

```dart
import 'package:flutter/material.dart';
void main(){
  runApp(new Center(child: new Text('Hello Flutter!')));
}
Coming in 2018.1
What's New
Features
Learn
Buy
```