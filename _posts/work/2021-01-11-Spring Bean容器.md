# Spring Bean容器

## 简述

Spring IoC容器的初始化包括定位、载入和注册这三个基本的过程。

1. BeanDefinition 定位。由resourceLoader通过统一的Resource接口来完成。比如：FileSystemResource、ClassPathResource。
2. BeanDefinition 载入。该过程把用户定义好的Bean表示成IoC容器内部的数据结构BeanDefinition。BeanDefinition就是Spring的领域对象。
3. BeanDefinition 注册。这个过程是通过调用BeanDefinitionRegistry接口的实现来完成。在IoC容器内部使用HashMap来持有BeanDefinition数据的。



##  动态注入bean思路

Spring管理bean的对象是BeanFactory，具体的是DefaultListableBeanFactory，在这个类当中有一个注入bean的方法：registerBeanDefinition。而Spring提供了BeanDefinitionBuilder可以构建一个BeanDefinition。所以我们只要获取到ApplicationContext对象即可动态注入bean了。

具体步骤如下：

1. 获取ApplicationContext，即BeanFacotory;
2. 通过ApplicationContext获取到BeanFacotory;
3. 通过BeanDefinitionBuilder构建BeanDefiniton;
4. 调用BeanFactory的registerBeanDefinition注入beanDefinition；

具体代码如下：

```
public class TestService {

    private String name;

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public void print() {
        System.out.println("动态载入bean,name=" + name);
    }
}
```



```
import org.springframework.beans.factory.support.BeanDefinitionBuilder;
import org.springframework.beans.factory.support.DefaultListableBeanFactory;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.ApplicationContext;

@SpringBootApplication
public class Application {

    public static void main(String[] args) {
        ApplicationContext ctx = SpringApplication.run(Application.class, args);

        // 获取BeanFactory
        DefaultListableBeanFactory defaultListableBeanFactory = (DefaultListableBeanFactory) ctx
                .getAutowireCapableBeanFactory();

        // 创建bean信息.
        BeanDefinitionBuilder beanDefinitionBuilder = BeanDefinitionBuilder.genericBeanDefinition(TestService.class);
        beanDefinitionBuilder.addPropertyValue("name", "张三");

        // 动态注册bean.
        defaultListableBeanFactory.registerBeanDefinition("testService", beanDefinitionBuilder.getBeanDefinition());

        // 获取动态注册的bean.
        TestService testService = ctx.getBean(TestService.class);
        testService.print();
    }
}
```

> 多次注入同一个bean的，如果beanName不一样的话，那么会产生两个Bean；如果beanName一样的话，后面注入的会覆盖前面的。



在spring boot中有以下方式进行扩展：

1. BeanFactoryPostProcessor

- 实现该接口，可以在spring的bean创建之前修改bean的定义属性
- 允许在容器实例化bean之前读取配置元数据并可以根据需要进行修改
- 多个BeanFactoryPostProcessor可以通过设置‘order’属性来控制各个BeanFactoryPostProcessor的执行顺序

2. BeanDefinitionRegistryPostProcessor

- 继承了BeanFactoryPostProcessor，提供了向工厂注册BeanDefinition的方法
- ConfigurationClassPostProcessor就是该接口的一个实现类，他是初始化BeanFactoy最重要的类 ，没有之一；
- 该后置处理器实现了BeanFactoryPostProcessor 实例化过程中最核心的操作：解析配置类，解析注释，完成扫描，处理@Import导入的类，并将所有交给spring管理的类解析生成BeanDefinition，并将他们注册到BeanFactoryPostProcessor；
- 值得注意的：postProcessBeanFactory（）方法是在postProcessBeanDefinitionRegistry（）之后执行的

3. ImportBeanDefinitionRegistrar

- 通常用于@Import(实现ImportBeanDefinitionRegistrar接口的类.class)

- BeanDefinitionRegistryPostProcessor实现类只要加注解（@Component）就可以执行，

- 而ImportBeanDefinitionRegister加注解（@Component可以不加）只是交给spring管理，并不会执行接口的方法，必须要在配置类中@Import()才会发挥作用；

- ImportBeanDefinitionRegister执行顺序更早

- mybatis中@MapperScan 注解就是利用ImportBeanDefinitionRegister

- 将接口生成代理类然后注册到BeanFactory中，这就是为什么mybatis中只有接口没有实现类的原因

  
# 实例

## BeanFactoryPostProcessor



```java
@Configuration
@Slf4j
public class MyBeanFactoryPostProcessor implements BeanFactoryPostProcessor {
    /**
     * 本方法在Bean对象实例化之前执行，
     * 通过beanFactory可以获取bean的定义信息，
     * 并可以修改bean的定义信息。这点是和BeanPostProcessor最大区别
     */
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory beanFactory) throws BeansException {
        beanFactory.registerSingleton("MyBeanName", ">> BeanFactoryPostProcessor 开始执行了");
        System.out.println(">> BeanFactoryPostProcessor 开始执行了");
        String[] names = beanFactory.getBeanDefinitionNames();
        for (String name : names) {
            System.out.println(">> BeanDefinition Name:" + name);
        }
        System.out.println(">> BeanFactoryPostProcessor 执行结束");
    }
}
```



## BeanDefinitionRegistryPostProcessor

在Spring初始化初期将需要扫描导入Spring容器的类进行注入。在框架开发中，我们通常只需要配置上要扫描的包路径，然后将该路径下接口类实现并注册到容器中。然后我们在使用这些类的时候，直接根据类型注入（@Autowired）即可使用。

首先定义接口类。


```java
public interface BaseMapper {

public void add(String value);

public void remove(String key);
}

```

```

```



其次，定义一个扫描某路径下的类，该类继承ClassPathBeanDefinitionScanner，自定义扫描类：DefaultClassPathScanner


```
import java.io.IOException;
import java.util.Arrays;
import java.util.Set;

import org.springframework.beans.factory.annotation.AnnotatedBeanDefinition;
import org.springframework.beans.factory.config.BeanDefinitionHolder;
import org.springframework.beans.factory.config.RuntimeBeanReference;
import org.springframework.beans.factory.support.AbstractBeanDefinition;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.beans.factory.support.GenericBeanDefinition;
import org.springframework.context.annotation.ClassPathBeanDefinitionScanner;
import org.springframework.core.type.classreading.MetadataReader;
import org.springframework.core.type.classreading.MetadataReaderFactory;
import org.springframework.core.type.filter.TypeFilter;

public class DefaultClassPathScanner extends ClassPathBeanDefinitionScanner {

    private final String DEFAULT_MAPPER_SUFFIX = "Mapper";
    
    public DefaultClassPathScanner(BeanDefinitionRegistry registry) {
        super(registry, false);
    }
    
    private String mapperManagerFactoryBean;
    
    /**
     * 扫描包下的类-完成自定义的Bean定义类
     *
     * @param basePackages
     * @return
     */
    @Override
    protected Set<BeanDefinitionHolder> doScan(String... basePackages) {
        Set<BeanDefinitionHolder> beanDefinitions = super.doScan(basePackages);
        // 如果指定的基础包路径中不存在任何类对象，则提示
        if (beanDefinitions.isEmpty()) {
            logger.warn("系统没有在 '" + Arrays.toString(basePackages) + "' 包中找到任何Mapper，请检查配置");
        } else {
            processBeanDefinitions(beanDefinitions);
        }
        return beanDefinitions;
    }
    
    /**
     * 注册过滤器-保证正确的类被扫描注入
     */
    protected void registerFilters() {
        addIncludeFilter(new TypeFilter() {
            @Override
            public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory)
                    throws IOException {
                String className = metadataReader.getClassMetadata().getClassName();
                // TODO 这里设置包含条件-此处是个扩展点，可以根据自定义的类后缀过滤出需要的类
                return className.endsWith(DEFAULT_MAPPER_SUFFIX);
            }
        });
        addExcludeFilter(new TypeFilter() {
            @Override
            public boolean match(MetadataReader metadataReader, MetadataReaderFactory metadataReaderFactory)
                    throws IOException {
                String className = metadataReader.getClassMetadata().getClassName();
                return className.endsWith("package-info");
            }
        });
    }
    
    /**
     * 重写父类的判断是否能够实例化的组件-该方法是在确认是否真的是isCandidateComponent 原方法解释：
     * 确定给定的bean定义是否有资格成为候选人。 默认实现检查类是否不是接口，也不依赖于封闭类。 以在子类中重写。
     *
     * @param beanDefinition
     * @return
     */
    protected boolean isCandidateComponent(AnnotatedBeanDefinition beanDefinition) {
        // 原方法这里是判断是否为顶级类和是否是依赖类（即接口会被排除掉-由于我们需要将接口加进来，所以需要覆盖该方法）
        return beanDefinition.getMetadata().isInterface() && beanDefinition.getMetadata().isIndependent();
    }
    
    /**
     * 扩展方法-对扫描到的含有BeetlSqlFactoryBean的Bean描述信息进行遍历
     *
     * @param beanDefinitions
     */
    void processBeanDefinitions(Set<BeanDefinitionHolder> beanDefinitions) {
        GenericBeanDefinition definition;
        for (BeanDefinitionHolder holder : beanDefinitions) {
            definition = (GenericBeanDefinition) holder.getBeanDefinition();
            String mapperClassName = definition.getBeanClassName();
            // 必须在这里加入泛型限定，要不然在spring下会有循环引用的问题
            definition.getConstructorArgumentValues().addGenericArgumentValue(mapperClassName);
            // 依赖注入
            definition.getPropertyValues().add("mapperInterface", mapperClassName);
            // 根据工厂的名称创建出默认的BaseMapper实现
            definition.getPropertyValues().add("mapperManagerFactoryBean",
                    new RuntimeBeanReference(this.mapperManagerFactoryBean));
            definition.setBeanClass(BaseMapperFactoryBean.class);
            // 设置Mapper按照接口组装
            definition.setAutowireMode(AbstractBeanDefinition.AUTOWIRE_BY_TYPE);
            logger.info("已开启自动按照类型注入 '" + holder.getBeanName() + "'.");
        }
    }
    
    public void setMapperManagerFactoryBean(String mapperManagerFactoryBean) {
        this.mapperManagerFactoryBean = mapperManagerFactoryBean;
    }
}
```

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0);)

4、核心的接口实现类：BaseMapperFactoryBean

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0);)

```
package com.dxz.test;

import java.lang.reflect.Proxy;

import org.springframework.beans.BeansException;
import org.springframework.beans.factory.FactoryBean;
import org.springframework.beans.factory.InitializingBean;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.ApplicationEvent;
import org.springframework.context.ApplicationListener;

public class BaseMapperFactoryBean<T>
        implements FactoryBean<T>, InitializingBean, ApplicationListener<ApplicationEvent>, ApplicationContextAware {
    /**
     * 要注入的接口类定义
     */
    private Class<T> mapperInterface;

    /**
     * Spring上下文
     */
    private ApplicationContext applicationContext;
    
    // 也因该走工厂方法注入得来
    
    private BaseMapper mapperManagerFactoryBean;
    
    public BaseMapperFactoryBean(Class<T> mapperInterface) {
        this.mapperInterface = mapperInterface;
    }
    
    @Override
    public T getObject() throws Exception {
        // 采用动态代理生成接口实现类，核心实现
        return (T) Proxy.newProxyInstance(applicationContext.getClassLoader(), new Class[] { mapperInterface },
                new MapperJavaProxy(mapperManagerFactoryBean, mapperInterface));
    }
    
    @Override
    public Class<?> getObjectType() {
        return this.mapperInterface;
    }
    
    @Override
    public boolean isSingleton() {
        return true;
    }
    
    @Override
    public void afterPropertiesSet() throws Exception {
        // TODO 判断属性的注入是否正确-如mapperInterface判空
        if (null == mapperInterface)
            throw new IllegalArgumentException("Mapper Interface Can't Be Null!!");
    }
    
    /**
     * Handle an application event.
     *
     * @param event
     *            the event to respond to
     */
    @Override
    public void onApplicationEvent(ApplicationEvent event) {
        // TODO 可依据事件进行扩展
    }
    
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }
    
    public void setMapperInterface(Class<T> mapperInterface) {
        this.mapperInterface = mapperInterface;
    }
    
    public void setMapperManagerFactoryBean(BaseMapper mapperManagerFactoryBean) {
        this.mapperManagerFactoryBean = mapperManagerFactoryBean;
    }
}
```



5、定义默认的BaseMapper的FactoryBean-MapperManagerFactoryBean



```
package com.dxz.test;

import java.lang.reflect.InvocationHandler;
import java.lang.reflect.Method;

public class MapperJavaProxy implements InvocationHandler {

    private BaseMapper baseMapper;
    
    private Class<?> interfaceClass;
    
    public MapperJavaProxy(BaseMapper baseMapper, Class<?> interfaceClass) {
        this.baseMapper = baseMapper;
        this.interfaceClass = interfaceClass;
    }
    
    @Override
    public Object invoke(Object proxy, Method method, Object[] args) throws Throwable {
        if (!interfaceClass.isInterface()) {
            throw new IllegalArgumentException("mapperInterface is not interface.");
        }
    
        if (baseMapper == null) {
            baseMapper = new CustomBaseMapper();
        }
        return method.invoke(baseMapper, args);
    }
}
```

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0);)

 

7、调用时的核心配置类：DefaultClassRegistryBeanFactory

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0);)

```
package com.dxz.test;

import org.apache.commons.lang3.StringUtils;
import org.springframework.beans.BeansException;
import org.springframework.beans.factory.BeanNameAware;
import org.springframework.beans.factory.config.ConfigurableListableBeanFactory;
import org.springframework.beans.factory.support.BeanDefinitionRegistry;
import org.springframework.beans.factory.support.BeanDefinitionRegistryPostProcessor;
import org.springframework.context.ApplicationContext;
import org.springframework.context.ApplicationContextAware;
import org.springframework.context.ConfigurableApplicationContext;

public class DefaultClassRegistryBeanFactory
        implements ApplicationContextAware, BeanDefinitionRegistryPostProcessor, BeanNameAware {

    private String scanPackage;
    
    private String beanName;
    
    private String mapperManagerFactoryBean;
    
    private ApplicationContext applicationContext;
    
    public String getScanPackage() {
        return scanPackage;
    }
    
    public void setScanPackage(String scanPackage) {
        this.scanPackage = scanPackage;
    }
    
    public String getMapperManagerFactoryBean() {
        return mapperManagerFactoryBean;
    }
    
    public void setMapperManagerFactoryBean(String mapperManagerFactoryBean) {
        this.mapperManagerFactoryBean = mapperManagerFactoryBean;
    }
    
    @Override
    public void postProcessBeanDefinitionRegistry(BeanDefinitionRegistry beanDefinitionRegistry) throws BeansException {
        if (StringUtils.isEmpty(this.scanPackage)) {
            throw new IllegalArgumentException("scanPackage can't be null");
        }
        String basePackage2 = this.applicationContext.getEnvironment().resolvePlaceholders(this.scanPackage);
        String[] packages = StringUtils.tokenizeToStringArray(basePackage2,
                ConfigurableApplicationContext.CONFIG_LOCATION_DELIMITERS);
        DefaultClassPathScanner defaultClassPathScanner = new DefaultClassPathScanner(beanDefinitionRegistry);
        defaultClassPathScanner.setMapperManagerFactoryBean(mapperManagerFactoryBean);
        defaultClassPathScanner.registerFilters();
    
        defaultClassPathScanner.doScan(packages);
    }
    
    @Override
    public void postProcessBeanFactory(ConfigurableListableBeanFactory configurableListableBeanFactory)
            throws BeansException {
    
    }
    
    @Override
    public void setApplicationContext(ApplicationContext applicationContext) throws BeansException {
        this.applicationContext = applicationContext;
    }
    
    @Override
    public void setBeanName(String name) {
        this.beanName = name;
    }
}
```

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0);)

8、调用测试

  8.1、假设你在包目录：colin.spring.basic.advanced.inject.dao下声明自定义的类UserMapper

```
public interface UserMapper extends BaseMapper {
}
```

8.2、声明配置类：ClassRegistryBeanScannerConfig

```
package com.dxz.test;

@Configuration
public class ClassRegistryBeanScannerConfig {

    @Bean(name = "mapperManagerFactoryBean")
    public MapperManagerFactoryBean configMapperManagerFactoryBean() {
        MapperManagerFactoryBean mapperManagerFactoryBean = new MapperManagerFactoryBean();
        return mapperManagerFactoryBean;
    }
    
    @Bean
    public DefaultClassRegistryBeanFactory configDefaultClassRegistryBeanFactory() {
        DefaultClassRegistryBeanFactory defaultClassRegistryBeanFactory = new DefaultClassRegistryBeanFactory();
        defaultClassRegistryBeanFactory.setScanPackage("colin.spring.basic.advanced.inject.dao");
        defaultClassRegistryBeanFactory.setMapperManagerFactoryBean("mapperManagerFactoryBean");
        return defaultClassRegistryBeanFactory;
    }
}
```

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0);)

8.3、测试调用

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0);)

```
package com.dxz.test;

public class Snippet {
    public static void main(String[] args) {
    AnnotationConfigApplicationContext acApplicationCOntext = new AnnotationConfigApplicationContext("colin.spring.basic.advanced.inject");
    UserMapper userMapper = acApplicationCOntext.getBean(UserMapper.class);
    userMapper.add("lalaldsf");
    acApplicationCOntext.stop();
    }
}
```

[![复制代码](https://common.cnblogs.com/images/copycode.gif)](javascript:void(0);)

 总结：

此处对于BeanPostProcessor接口的调用应该属于高级应用了，该思路常用来解决扩展或集成Spring框架，其核心的思路可以分为以下几步：

  1、自定义实现类路径扫描类，决定哪些类应该被注入进Spring容器。

  2、采用Java动态代理来动态实现对于声明接口类的注入。

  3、实现BeanDefinitionRegistryPostProcessor，在Spring初始化初期将需要扫描导入Spring容器的类进行注入。

　4、通过代码动态创建

## ApplicationContext

ApplicationContext是以bean管理为基础的综合能力扩展，用于满足业务对Spring综合能力的需要；

![这里写图片描述](images/20180812101356107)


# SpringEvent

## 配置ApplicationListener 监听器的6种方式

1. 配置文件中通过context.listener.classes配置

2. 在resources目录下新建META-INF文件夹并新建spring.factories文件通过org.springframework.context.ApplicationListener配置

3. 在启动main函数中通过SpringApplication配置SpringApplication.addListeners(你的监听器);

4. 实现ApplicationListener，并使用@Configuration 注解配置,同时可以配合@Order(-100)设置优先级

5. 使用@EventListener 注解配置在bean中定义任意方法并使用该注解, 注解属性class中可以指定具体监控的事件类,通过方法参数指定事件类型,如果不指定则表示监控所有的事件

6. 通过实现接口org.springframework.context.ApplicationContextInitializer,得到context后通过编程式,设置监听器

## 分布式事件

可以通过Consul或Redis消息订阅实现跨进程通信，计划完成：

1. 服务发现事件。

2. 配置变更事件。

3. 远程通知事件。

##  RPC方式



1. RMI

   基于RMI协议，使用java的序列化机制，客户端服务端都必须时java，RMI协议不被防火墙支持，只能在内网使用

2. Hessian

  基于HTTP协议，使用自身的序列化机制，客户端服务端可以是不同的语言，HTTP协议被防火墙支持，可被外网访问

3. HttpInvoker
    基于HTTP协议，使用java的序列化机制，客户端服务端都必须时java，必须使用spring，HTTP协议被防火墙支持，可被外网访问
