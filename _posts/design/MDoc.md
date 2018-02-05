# MDoc Maker
MDoc Maker是一个简单、易用、免费的文档生成工具。使用者可以轻松地使用超文本标记语言（html）或轻量级标记言语（*markdown*）编写文章。使用类似Liquid语法（一种广泛的用在Ruby on rails和Django等框架中）可以扩展文章的表现能力。

使用者只需要关注写作内容本身，而无需要关注文字的排版和文档的结构。轻松生成技术文档、博客或者网站，自动导出Word,PDF等格式的电子文档。

# 如何使用
首先下载[MDoc Maker](http://blog.zhumingwu.cn/MDoc.Zip)软件，该软件基于dotnetcore编写，可以运行在windows， linux， mac等主流的操作系统上。下载完成后解压到合适的目录下。
在windows上，使用管理员权限运行install.bat即可。
在Linux上，使用以下命令：
```shell
ln -s ~/writer.dll /usr/local/bin/mdoc
```

# 命令
通过以下几个简单的命令即可完成创作：
```
//创建或编辑一篇文章
mdoc filename
//预览文章
mdoc --view|v [filename]
//发布文档
mdoc --public|p [type]
//输出文档
mdoc --generate|g [type]
```
## 文档结构
mdoc文档是由配置文件（_config.yml)，模板文件（.layouts)和数据文件（如：markdown或html文件）组成。mdoc文档没有明确的目录结构。但推荐使用以下的文件和目录结构：   
1. .layouts - 其中的所有内容除了*.md，*.htm和*.html外都会输出   
1. .output - 临时输出目录
1. config.json - 文档的配置文件
1. source - 建议存储文章

# 配置
config.json中配置了文档的全局设置。,配置信息以key:value或key=value的方式表示，以#作为备注。如下所示：

```
# Configuration
## Url http://blog.zhumingwu.cn
## Source: https://github.com/bzway/dotWriter/

# Book
title: Demo
subtitle:
description: this is a description for the site/book
author: zhumingwu

# Writing
default_layout: default
default_category: uncategorized
date_format: YYYY-MM-DD
time_format: HH:mm:ss
```
以上所有配置信息都可以在文章中以 <code> {{ key }}</code>的方式引用。

# 模板
模板包括结构和引用内容，其中结构以html或md文件形式存在，引用内容包括但不限于：
1.css
2.js
3.png
4.jpg
5.gif

模板文件中必须包含：<code>{{ body }}</code>，通过<code>{% include "head.html" %}</code> 引用其它文件内容。一般模板示例：
```html
<html>
<title>{{title}}</title>
<meta name="description" content="{{description}}">
{% include "head.html" %}
<body>
    {{ body }}
    {% include "footer.html" %}
</body>
</html>
```
如果不希望模板中的文件发布出去，也可以在目录中增加ignore.txt文件，编辑需要排除的文件。比如：
```
*.[Oo]bj
*.html
[Oo]bj/
/css
bin
```
1. 其中以*开关的是文件类型的排除
1. 以/开头的目录从模板的根目录算起下属的所有文件夹和文件排除
1. 以/结尾是任意指定目录下属的所有文件夹和文件排除
1. 单独名称，只要包括此名称部分即排除
1. 同时可以使用[]列表多个可能字符。

[注：通常用户可以通过官网下载现成的模板]

# 文章
## 文章的设置
文章的设置以---开始，以---结束作为文章相关的设置。例如：
```
---
title: 说明
category:首页/产品
layout: default
sort: 12
---
```
如果需要生成文章目录结果的话，可以设置category通过/设置目录层次,title是显示的标题，sort设置在同一个目录下的显示顺序。
## 文章中参数
所有参数通过 {{ parameter }}引用，相关内容可以参考Liquid 语法


       

