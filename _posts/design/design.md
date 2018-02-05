# Datasource Management System(DMS)数据管理系统

## 内容
1. 首先是入口，即url.
2. 然后是内容，内容又分为
	* 结构（通常以html组织）
	* 数据（通常以api提供，以json或xml为形式）
	* 资源（比如静态文件，其它一些复杂的文件）

## Url Map
1.	Distinguish the environment (Developement Staging Production)
2.	Get Url ( host , path and query)
    * Get Site Setting By host
    * Get Path with paramaters
        * 静态文件处理
        * 动态内容处理
        * 反向代理处理

## 实现

1. StaticFile
	1. 业务描述
        1. 系统会优先处理静态文件，所以用户定义的路由要避免被静态文件截获。 
        2. 用户可以在后台上传一个文件,多个文件（使用zip格式整体上传）
        3. 用户可以设置前缀避免名称冲突
    2. 业务处理
    	1. 判断静态文件的前缀（由用户后台设置）
    	2. 判断请求文件是否存在
2. 动态文件 - 自定义的插件
   1. 业务描述 
        1. 利用模板展示页面结构
        2. 内容保存到数据库中
        3. 用户可以设置页面的属性和是否启用缓存
   2. 业务处理
    	1. Find Page By Path
    	2. Render Page By Page Setting
   3. IMap 设置  
		1. 路由组成
				Get 'url template' with defaults:[]
			1. HTTP方法 - 目前只支持GET
			2. URL Template
			3. 默认参数 - 定义Area, Controller, Action, Data, Query, PageIndex, PageSize

		2. Template组成  
				/Stage/$controller=Home/$action=Index/$active:bool/$id?
			1. 以/分隔每个节点
            2. 以$开头表示参数输出，紧跟其后的=后面的值为默认值。
            3. 使用:后面的数据作为约束，约束可以是int,bool,string,date,regex,以?结束的参数表示可以为空
		3. data 指定repository,query,and paged  
		eg:
        		data(product,"category=$controller and price>110“, pageIndex=2,pageSize = 10)

3. 反向代理 - 使用WebClient得到外部内容
    > 设置动态url /user/get/{id}
    > 设置目标域名 http://target/abc/{id}
    > 设置返回内容
4. 预览 & 发布

## WebFile中间件

## HtmlContent中间件
使用在线编辑工具编辑

## MultiTenant多租户
1. 首先在管道中增加一个处理，得到当前的请求的host地址
2. 然后从配置文件中得到相关网站的设置 
