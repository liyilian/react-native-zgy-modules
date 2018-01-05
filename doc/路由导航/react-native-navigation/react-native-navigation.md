#react-native-navigation
***
### 第一步：导入库
yarn add react-native-librarys
或者
npm install react-native-librarys

### 第二步：手动链接react-native-navigation库
详见 [https://wix.github.io/react-native-navigation/#/installation-ios](https://wix.github.io/react-native-navigation/#/installation-ios)

#### 一、ios配置
1、打开Xcode 在左侧的工程目录中 右键点击Libraries > Add files to [project name（你的项目名）] 添加 ./node_modules/react-native-navigation/ios/ReactNativeNavigation.xcodeproj。

2、找到项目导航栏中的Build Phases,在Link Binary With Libraries 条目中添加libReactNativeNavigation.a

3、找到项目导航栏中的Build Settings,在Header Search Paths 中添加$(SRCROOT)/../node_modules/react-native-navigation/ios

4、修改AppDelegate.m文件,
引入#import "RCCManager.h"
注释掉下面代码
> RCTRootView *rootView = [[RCTRootView alloc] initWithBundleURL:jsCodeLocation
                                                      moduleName:@"example"
                                               initialProperties:nil
                                                   launchOptions:launchOptions];
  self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  UIViewController *rootViewController = [UIViewController new];
  rootViewController.view = rootView;
  self.window.rootViewController = rootViewController;
 [self.window makeKeyAndVisible];

加入以下代码
> self.window = [[UIWindow alloc] initWithFrame:[UIScreen mainScreen].bounds];
  self.window.backgroundColor = [UIColor whiteColor];
  [[RCCManager sharedInstance] initBridgeWithBundleURL:jsCodeLocation launchOptions:launchOptions];

  到此ios配置完成

  ***

####  二、Android配置

  1、在android目录下的settings.gradle文件中加入
  >include ':react-native-navigation'
 project(':react-native-navigation').projectDir = new File(rootProject.projectDir, '../node_modules/react-native-navigation/android/app/')

 2、打开android/app/build.gradle文件。加入
 > android {
     compileSdkVersion 25
     buildToolsVersion "25.0.1"
     ...
 }

 dependencies {
     compile fileTree(dir: "libs", include: ["*.jar"])
     compile "com.android.support:appcompat-v7:23.0.1"
     compile "com.facebook.react:react-native:+"
     compile project(':react-native-navigation')
 }

 注意android中的编译版本要改为25，dependencies中添加缺失的项目

 3、 打开MainActivity.java文件，在文件中引入com.reactnativenavigation.controllers.SplashActivity包代替ReactActivity。
 >import com.reactnativenavigation.controllers.SplashActivity;

 >public class MainActivity extends SplashActivity {
 }

 4、在MainApplication.java文件中，把方法修改为
 > import com.reactnativenavigation.NavigationApplication;

 >public class MainApplication extends NavigationApplication {

     @Override
     public boolean isDebug() {
         // Make sure you are using BuildConfig from your own application
         return BuildConfig.DEBUG;
     }

     protected List<ReactPackage> getPackages() {
         // Add additional packages you require here
         // No need to add RnnPackage and MainReactPackage
         return Arrays.<ReactPackage>asList(
             // eg. new VectorIconsPackage()
         );
     }

     @Override
     public List<ReactPackage> createAdditionalReactPackages() {
         return getPackages();
     }
     }

5、更新AndroidManifest.xml文件，把里面的android.name赋值为.MainApplication
><application
     android:name=".MainApplication"
     ...
 />
 ***

### 第三步:初始化导航

 在主入口文件中引入
>import {reactNativeNavigation} from "react-native-librarys";

其中reactNativeNavigation 对象中包含了4个方法，分别是initRoute()初始化路由,initNavBar()初始化导航栏样式,initApp()初始化首页,initAppByTab()以tabBar的形式初始化首页。

（必须执行）initRoute 例：
>import App from "./App";
import Page2 from './src/navigator/Page2';
import Page3 from './src/navigator/Page3';

>let routes = {
    "indexPage": App,
    "Page2": Page2,
    "Page3": Page3
};

>reactNativeNavigation.initRoute(routes);
把页面以key value的形式组装成一个路由对象传入initRoute方法。

（必须执行）initNavBar() 例:
>et navBar = {

    backImageStyle: {},

    mainContainerStyle: {
        backgroundColor: 'red',
    },

    mainNavbarGradientStyle: {
        start: {x: 0.0, y: 0.25},
        end: {x: 0.5, y: 1.0},
        locations: [0, 0.5, 0.6],
        colors: ['#4c669f', '#3b5998', '#192f6a'],
        style: {}
    },

    leftContainerStyle: {},

    rightContainerStyle: {},

    centerContainerStyle: {},

    titleStyle: {
        fontSize: 18,
        color: "#fff",
    },
    };
>reactNativeNavigation.initNavbar(navBar);

把导航栏属相封装成对象传入initNavbar(); 如果不需要自定义默认的导航栏样式，请传入空对象或者直接执行initNavbar();切勿不执行次方法。具体导航栏样式配置，请看[路由使用细则](../routeAPI.md);

（下列2个方法2选一）
1、以单页面的方式初始化路由
>export default reactNativeNavigation.initApp(pageKey);

其中pageKey是你想设置的路由首页的key
>let routes = {
    "indexPage": App,
    "Page2": Page2,
    "Page3": Page3
};

如上面路由对象routes中的indexPage。
所以我们可以将路由初始化为
>export default reactNativeNavigation.initApp(”indexPage“);

2、以tabbar形式初始化首页
>let tabs = [{
    label:'首页',
    screen: 'indexPage',
    icon: require('./src/img/list.png'),
}, {
    label:'首页',
    screen: 'Page2',
    icon: require('./src/img/list.png'),
},
    {
        label:'首页',
        screen: 'Page3',
        icon: require('./src/img/list.png'),
}];
export default reactNativeNavigation.initAppByTab(tabs);

如上图所示：先定义一个tabBar的Array，然后传入initAppByTab(tabs)方法。screen传入我们自定义路由的key。

***
路由具体使用 详见[路由使用细则](../routeAPI.md)
