---
layout: post
title: 区块链
---
                               

# 开发环境
IntelliJ IDEA 2017.2.5
JDK 1.8
Spring 5.0.0.RELEASE
Hibernate 5.2.11.Final
Hibernate validator 5.4.1.Final
Servlets 3.1.0
HSQLDB 1.8.0.10
Tomcat 7 maven plugin 2.2


# Maven 依赖
下面是 pom.xml 文件内容
```xml
<project xmlns="http://maven.apache.org/POM/4.0.0" xmlns:xsi="http://www.w3.org/2001/XMLSchema-instance"
	xsi:schemaLocation="http://maven.apache.org/POM/4.0.0 http://maven.apache.org/xsd/maven-4.0.0.xsd">
	<modelVersion>4.0.0</modelVersion>
	<groupId>com.dev-cheats.spring5</groupId>
	<artifactId>spring5-mvc-hibernate-example</artifactId>
	<version>0.0.1-SNAPSHOT</version>
	<packaging>war</packaging>
	<properties>
		<failOnMissingWebXml>false</failOnMissingWebXml>
		<spring.version>5.0.0.RELEASE</spring.version>
		<hibernate.version>5.2.11.Final</hibernate.version>
		<hibernate.validator>5.4.1.Final</hibernate.validator>
		<c3p0.version>0.9.5.2</c3p0.version>
		<jstl.version>1.2.1</jstl.version>
		<tld.version>1.1.2</tld.version>
		<servlets.version>3.1.0</servlets.version>
		<jsp.version>2.3.1</jsp.version>
		<hsqldb.version>1.8.0.10</hsqldb.version>
	</properties>
	<dependencies>
		<!-- Spring MVC Dependency -->
		<dependency>
			<groupId>org.springframework</groupId>
			<artifactId>spring-webmvc</artifactId>
			<version>${spring.version}</version>
		</dependency>

		<!-- Spring ORM -->
		<dependency>
			<groupId>org.springframework</groupId>
			<artifactId>spring-orm</artifactId>
			<version>${spring.version}</version>
		</dependency>

		<!-- Hibernate ORM -->
		<dependency>
			<groupId>org.hibernate</groupId>
			<artifactId>hibernate-core</artifactId>
			<version>${hibernate.version}</version>
		</dependency>

		<!-- Hibernate-C3P0 Integration -->
		<dependency>
			<groupId>org.hibernate</groupId>
			<artifactId>hibernate-c3p0</artifactId>
			<version>${hibernate.version}</version>
		</dependency>

		<!-- c3p0 -->
		<dependency>
			<groupId>com.mchange</groupId>
			<artifactId>c3p0</artifactId>
			<version>${c3p0.version}</version>
		</dependency>

		<!-- Hibernate Validator -->
		<dependency>
			<groupId>org.hibernate</groupId>
			<artifactId>hibernate-validator</artifactId>
			<version>${hibernate.validator}</version>
		</dependency>

		<!-- JSTL Dependency -->
		<dependency>
			<groupId>javax.servlet.jsp.jstl</groupId>
			<artifactId>javax.servlet.jsp.jstl-api</artifactId>
			<version>${jstl.version}</version>
		</dependency>

		<dependency>
			<groupId>taglibs</groupId>
			<artifactId>standard</artifactId>
			<version>${tld.version}</version>
		</dependency>

		<!-- Servlet Dependency -->
		<dependency>
			<groupId>javax.servlet</groupId>
			<artifactId>javax.servlet-api</artifactId>
			<version>${servlets.version}</version>
			<scope>provided</scope>
		</dependency>

		<!-- JSP Dependency -->
		<dependency>
			<groupId>javax.servlet.jsp</groupId>
			<artifactId>javax.servlet.jsp-api</artifactId>
			<version>${jsp.version}</version>
			<scope>provided</scope>
		</dependency>

		<!-- HSQL Dependency -->
		<dependency>
			<groupId>hsqldb</groupId>
			<artifactId>hsqldb</artifactId>
			<version>${hsqldb.version}</version>
		</dependency>
	</dependencies>

	<build>
		<sourceDirectory>src/main/java</sourceDirectory>
		<resources>
			<resource>
				<directory>src/main/resources</directory>
			</resource>
		</resources>
		<plugins>
			<plugin>
				<artifactId>maven-compiler-plugin</artifactId>
				<version>3.5.1</version>
				<configuration>
					<source>1.8</source>
					<target>1.8</target>
				</configuration>
			</plugin>

			<!-- Embedded Apache Tomcat required for testing war -->
			<plugin>
				<groupId>org.apache.tomcat.maven</groupId>
				<artifactId>tomcat7-maven-plugin</artifactId>
				<version>2.2</version>
				<configuration>
					<path>/</path>
				</configuration>
			</plugin>
		</plugins>
	</build>
</project>
```

# 配置 DispatcherServlet
随着 Servlet 3.0 规范的发布，可以不使用 xml 来配置 Servlet 容器。 在 Servlet 规范中提供了 ServletContainerInitializer，在这个类中，你可以注册过滤器，监听器，servlet等，就像你在 web.xml 中配置是一样的。
Spring 提供了一个用于处理 WebApplicationInitializer 类的 SpringServletContainerInitializer。 AbstractAnnotationConfigDispatcherServletInitializer 内部实现类实现了 WebApplicationInitializer的WebMvcConfigurer。 它注册一个 ContextLoaderlistener（可选）和一个 DispatcherServlet，并允许你轻松地添加配置类来加载他们， 并将过滤器应用到 DispatcherServlet 并提供servlet映射。
```java
package com.devcheats.demo.spring.config;

public class AppInitializer extends AbstractAnnotationConfigDispatcherServletInitializer {

   @Override
   protected Class<?>[] getRootConfigClasses() {
      return new Class[] { HibernateConfig.class };
   }

   @Override
   protected Class<?>[] getServletConfigClasses() {
      return new Class[] { WebMvcConfig.class };
   }

   @Override
   protected String[] getServletMappings() {
      return new String[] { "/" };
   }
}
```
# Spring WebMVC 配置
Spring Web MVC配置如下。
```java
package com.devcheats.demo.spring.config;

@Configuration
@EnableWebMvc
@ComponentScan(basePackages = { "com.devcheats.demo.spring"})
public class WebMvcConfig implements WebMvcConfigurer {

   @Bean
   public InternalResourceViewResolver resolver() {
      InternalResourceViewResolver resolver = new InternalResourceViewResolver();
      resolver.setViewClass(JstlView.class);
      resolver.setPrefix("/WEB-INF/views/");
      resolver.setSuffix(".jsp");
      return resolver;
   }

   @Bean
   public MessageSource messageSource() {
      ResourceBundleMessageSource source = new ResourceBundleMessageSource();
      source.setBasename("messages");
      return source;
   }

   @Override
   public Validator getValidator() {
      LocalValidatorFactoryBean validator = new LocalValidatorFactoryBean();
      validator.setValidationMessageSource(messageSource());
      return validator;
   }
}
```
WebMvcConfigurer 定义了通过使用 @EnableWebMvc 注解来自定义或设置默认的Spring MVC配置。
@EnableWebMvc 启用默认的Spring MVC配置，并注册 DispatcherServlet 为Spring MVC基础组件。
@Configuration 等价于XML中配置beans，可以在该类下配置多个以 @Bean 为返回值的方法，这些方法可以被Spring容器托管。
@ComponentScan 注解用于指定要扫描的包。任何用 @Component 和 @Configuration 注解的类都会被扫描。
InternalResourceViewResolver 帮助映射视图文件，便于在指定的目录下直接查看文件。
ResourceBundleMessageSource 使用指定的名称访问资源包（本文里是message）。
LocalValidatorFactoryBean 实现了 javax.validation.ValidatorFactory 和 javax.validation.Validator 这两个接口，以及Spring的 Validator接口，用于暴露一个验证器工厂Bean，这样就允许在应用程序任何需要验证的地方注入 javax.validation.ValidatorFactory。
# Hibernate 配置
下面是本文例子的 Hibernate 配置。
```java
package com.devcheats.demo.spring.config;

@Configuration
@EnableTransactionManagement
@ComponentScans(value = { @ComponentScan("com.devcheats.demo.spring")})
public class HibernateConfig {

	@Autowired
	private ApplicationContext context;

	@Bean
	public LocalSessionFactoryBean getSessionFactory() {
		LocalSessionFactoryBean factoryBean = new LocalSessionFactoryBean();
		factoryBean.setConfigLocation(context.getResource("classpath:hibernate.cfg.xml"));
		factoryBean.setAnnotatedClasses(User.class);
		return factoryBean;
	}

	@Bean
	public HibernateTransactionManager getTransactionManager() {
		HibernateTransactionManager transactionManager = new HibernateTransactionManager();
		transactionManager.setSessionFactory(getSessionFactory().getObject());
		return transactionManager;
	}

}
```
LocalSessionFactoryBean 创建一个Hibernate SessionFactory，这是Spring应用上下文中设置共享Hibernate SessionFactory的常用方式。
EnableTransactionManagement 让 Spring 支持以注解的方式驱动事务管理。
HibernateTransactionManager 将Hibernate Session从指定的工厂绑定到线程，允许每个工厂有一个线程绑定的Session。这个事务管理器适用于使用单个Hibernate SessionFactory进行数据访问的应用程序，但它也支持在事务内直接访问数据源，即普通的JDBC形式。
hibernate.cfg.xml
```xml
<?xml version="1.0" encoding="utf-8"?>
<!DOCTYPE hibernate-configuration PUBLIC
"-//Hibernate/Hibernate Configuration DTD 3.0//EN"
"http://hibernate.sourceforge.net/hibernate-configuration-3.0.dtd">
<hibernate-configuration>
	<session-factory>
		<property name="hibernate.archive.autodetection">class,hbm</property>
		<property name="hibernate.dialect">org.hibernate.dialect.HSQLDialect</property>
		<property name="hibernate.show_sql">true</property>
		<property name="hibernate.connection.driver_class">org.hsqldb.jdbcDriver</property>
		<property name="hibernate.connection.username">sa</property>
		<property name="hibernate.connection.password"></property>
		<property name="hibernate.connection.url">jdbc:hsqldb:mem:devcheats</property>
		<property name="hibernate.hbm2ddl.auto">create</property>

		<property name="hibernate.c3p0.min_size">5</property>
		<property name="hibernate.c3p0.max_size">20</property>
		<property name="hibernate.c3p0.acquire_increment">2</property>
		<property name="hibernate.c3p0.acquire_increment">1800</property>
		<property name="hibernate.c3p0.max_statements">150</property>
	</session-factory>
</hibernate-configuration>
```

# Spring 控制器和 Path Mapping
控制器类有两个简单的Mapping注解，@GetMapping 和 @PostMapping。
如果前端输入的数据没有验证通过，会返回这个模型 Bean，并会显示错误消息， 正确的情况下会刷新视图。
```java
package com.devcheats.demo.spring.controller;

@Controller
public class UserController {

	@Autowired
	private UserService userService;

	@GetMapping("/")
	public String userForm(Locale locale, Model model) {
		model.addAttribute("users", userService.list());
		return "editUsers";
	}

	@ModelAttribute("user")
  public User formBackingObject() {
      return new User();
  }

	@PostMapping("/addUser")
	public String saveUser(@ModelAttribute("user") @Valid User user, BindingResult result, Model model) {

		if (result.hasErrors()) {
			model.addAttribute("users", userService.list());
			return "editUsers";
		}

		userService.save(user);
		return "redirect:/";
	}
}
```
# Service 和 DAO
Service 和 DAO 层是用 @Service 和 @Repository 注解表示的组件，@Transactional 注解用于事务支持。
UserService 和 UserServiceImpl
```java
public interface UserService {
   void save(User user);

   List<User> list();
}

@Service
public class UserServiceImpl implements UserService {

   @Autowired
   private UserDao userDao;

   @Transactional
   public void save(User user) {
      userDao.save(user);
   }

   @Transactional(readOnly = true)
   public List<User> list() {
      return userDao.list();
   }
}
UserDao 和 UserDaoImpl
public interface UserDao {
   void save(User user);
   List<User> list();
}

@Repository
public class UserDaoImpl implements UserDao {

   @Autowired
   private SessionFactory sessionFactory;

   @Override
   public void save(User user) {
      sessionFactory.getCurrentSession().save(user);
   }

   @Override
   public List<User> list() {
      @SuppressWarnings("unchecked")
      TypedQuery<User> query = sessionFactory.getCurrentSession().createQuery("from User");
      return query.getResultList();
   }
}
```


User
```java
package com.devcheats.demo.spring.model;

@Entity
@Table(name = "TBL_USERS")
public class User {

   @Id
   @GeneratedValue
   @Column(name = "USER_ID")
   private Long id;

   @Column(name = "USER_NAME")
   @Size(max = 20, min = 3, message = "{user.name.invalid}")
   @NotEmpty(message="Please Enter your name")
   private String name;

   @Column(name = "USER_EMAIL", unique = true)
   @Email(message = "{user.email.invalid}")
   @NotEmpty(message="Please Enter your email")
   private String email;

   public Long getId() {
      return id;
   }

   public void setId(Long id) {
      this.id = id;
   }

   public String getName() {
      return name;
   }

   public void setName(String name) {
      this.name = name;
   }

   public String getEmail() {
      return email;
   }

   public void setEmail(String email) {
      this.email = email;
   }
}
```

9. 视图和消息
最后，来编辑视图 JSP 文件和message资源包。
```html

<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8"%>
<%@taglib uri="http://www.springframework.org/tags/form" prefix="form"%>
<%@taglib uri="http://java.sun.com/jsp/jstl/core" prefix="c"%>
<!DOCTYPE html>
<html>
		<head>
		<meta http-equiv="Content-Type" content="text/html; charset=ISO-8859-1">
		<title>Spring5 MVC Hibernate Demo</title>
		<style type="text/css">
			.error {
				color: red;
			}
			table {
				width: 50%;
				border-collapse: collapse;
				border-spacing: 0px;
			}
			table td {
				border: 1px solid #565454;
				padding: 20px;
			}
		</style>
	</head>
	<body>
		<h1>输入表单</h1>
		<form:form action="addUser" method="post" modelAttribute="user">
			<table>
				<tr>
					<td>姓名</td>
					<td>
						<form:input path="name" /> <br />
						<form:errors path="name" cssClass="error" />
					</td>
				</tr>
				<tr>
					<td>邮箱</td>
					<td>
						<form:input path="email" /> <br />
						<form:errors path="email" cssClass="error" />
					</td>
				</tr>
				<tr>
					<td colspan="2"><button type="submit">提交</button></td>
				</tr>
			</table>
		</form:form>

		<h2>用户列表</h2>
		<table>
			<tr>
				<td><strong>姓名</strong></td>
				<td><strong>邮件</strong></td>
			</tr>
			<c:forEach items="${users}" var="user">
				<tr>
					<td>${user.name}</td>
					<td>${user.email}</td>
				</tr>
			</c:forEach>
		</table>
	</body>
</html>
```
messages.properties
user.name.invalid=输入的名称无效。必须在{2}-{1}个字符之间。
user.email.invalid=无效的电子邮件!请输入有效电子邮件。
注意：这里存储 Unicode 编码，否则中文显示可能会有问题。