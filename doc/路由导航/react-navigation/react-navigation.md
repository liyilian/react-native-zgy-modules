#react-navigation
***
### 第一步：导入库
yarn add react-native-librarys
或者
npm install react-native-librarys

### 第二步：链接外部库
执行react-native-link 如果link成功的话，直接跳到第三步，如果link失败，请手动link
[react-native-linear-gradient](https://github.com/react-native-community/react-native-linear-gradient)和[react-native-vector-icons](https://github.com/oblador/react-native-vector-icons)库

### 第三步:初始化导航

 在主入口文件中引入
>import {reactNavigation} from 'react-native-librarys';

其中reactNavigation 对象中包含了5个方法，分别是initRoute()初始化路由,initNavBar()初始化导航栏样式,initApp()初始化路由导航,initTabBarRoute()初始化taBbar路由,initAppForTabBar()初始化tabBar页面。

#### 1、以单页面的形式运行路由

（必须执行）initRoute 例：
>import Page2 from './src/Page/Page2';
import Page3 from './src/Page/Page3';
import Page6 from './src/Page/Page6';
const routeList2 = {
    Page2: Page2,
    Page3: Page3,
    Page6: Page6
};

>let routeMain = reactNavigation.initRoute(routeList2);

把页面以key value的形式组装成一个路由对象传入initRoute方法。

（必须执行）initNavBar() 例:
>let navBar = {
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

把导航栏属相封装成对象传入initNavbar(); 如果不需要自定义默认的导航栏样式，请传入空对象或者直接执行initNavbar();切勿不执行次方法。具体导航栏样式配置，请看[路由使用细则]();

（必须执行）initApp 例:
>export default reactNavigation.initApp(routeMain);

注:和react-native-navigation有区别，react-native-navigation这里是传入页面的key，这里是传入
initRoute()方法执行后的返回的对象,并且路由中的第一个页面做首页处理

***
#### 2、以tabBar形式运行路由

(把tabbar页面进行路由初始化操作)initTabBarRoute 例:
>import Page1 from './src/Page/Page1';
import Page3 from './src/Page/Page3';
import Page6 from './src/Page/Page6';

>const routeList = {
    Page1: Page1,
    Page4: Page4,
    Page5: Page5
};

>let route = reactNavigation.initTabBarRoute(routeList);

(初始化tabBar页面)initAppForTabBar 例:
>let tarBar = reactNavigation.initAppForTabBar(route);

这样就形成了一个tarBar页面，要使用的时候 只要把tarBar对象作为一个页面 初始化路由就好。例如
>const routeList2 = {
    index: tarBar,
    Page2: Page2,
    Page3: Page3,
    Page6: Page6
};

>let routeMain = reactNavigation.initRoute(routeList2);

>export default reactNavigation.initApp(routeMain);

这样tarBar就作为该路由的首页运行了，到此，路由初始化完成

***
路由详细使用说名请看[路由使用细则](../routeAPI.md);