#路由使用细则
***
## 初始化默认导航栏
| 字段名        | 类型           | 默认值  |  是否必须|
| ------------- |:-------------:| -----:| -----:|
|backImage      |require() |左侧图片|No|
|backImageStyle | object      |  {wight：24，height：24}|No|
| mainContainerStyle | object      |  {width: "100%",height: 44 + (20or44),paddingTop:(20or44),backgroundColor: "#c7c7c7",flexDirection: 'row'}  | No|
| leftContainerStyle | object      | {alignItems: 'flex-start',justifyContent: 'center',paddingHorizontal: 10,width: 44,}   | No|
| rightContainerStyle | object      | {alignItems: 'flex-start',justifyContent: 'center',paddingHorizontal: 10,width: 44,   | No|
| centerContainerStyle | object     |{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}  | No|
| titleStyle | object      |   { fontSize: 18,color: "#fff",} | No|
| mainNavbarGradientStyle | object      | {}   | No|

mainNavbarGradientStyle可配置渐变色 详见[react-native-linear-gradient](https://github.com/react-native-community/react-native-linear-gradient);

基础使用方法
>mainNavbarGradientStyle: {
        start: {x: 0.0, y: 0.25},
        end: {x: 0.5, y: 1.0},
        locations: [0, 0.5, 0.6],
        colors: ['#4c669f', '#3b5998', '#192f6a'],
        style: {}
},
***
##自定义某页面的导航栏样式

定义页面样式对象例如 let navbar = {};
在对象中配置样式属性

| 字段名        | 类型           | 默认值  |  是否必须|
| ------------- |:-------------:| -----:| -----:|
| backImage      |require() |左侧图片|No|
| backImageStyle | object      |  {wight：24，height：24}|No|
| mainContainerStyle | object      |  {width: "100%",height: 44 + (20or44),paddingTop:(20or44),backgroundColor: "#c7c7c7",flexDirection: 'row'}  | No|
| leftContainerStyle | object      | {alignItems: 'flex-start',justifyContent: 'center',paddingHorizontal: 10,width: 44,}   | No|
| rightContainerStyle | object      | {alignItems: 'flex-start',justifyContent: 'center',paddingHorizontal: 10,width: 44,   | No|
| centerContainerStyle | object     |{flex:1,flexDirection:'row',alignItems:'center',justifyContent:'center'}  | No|
| titleStyle | object      |   { fontSize: 18,color: "#fff",} | No|
| showBackButton（隐藏左侧按钮） | Bolean      | true   | No|
| title | String      | ""   | No|
| leftButtonFunc | function      | back()   | No|
| rightButtonImg | require()       | undefined   | No|
| rightImgStyle | object     | undefined  | No|
| rightButtonText | String      | undefined   | No|
| rightTextStyle | object      | undefined   | No|
| rightButtonFunc | function      | undefined  | No|
| mainNavbarGradientStyle | object      | {}   | No|

mainNavbarGradientStyle可配置渐变色 详见[react-native-linear-gradient](https://github.com/react-native-community/react-native-linear-gradient);

基础使用方法
>mainNavbarGradientStyle: {
        start: {x: 0.0, y: 0.25},
        end: {x: 0.5, y: 1.0},
        locations: [0, 0.5, 0.6],
        colors: ['#4c669f', '#3b5998', '#192f6a'],
        style: {}
},

再定义一个新对象，把navBar对象传入此对象中，例如：
let navBar = {title : "首页"}
let option = {navBar:navBar};
return help.app_render(this, view, option);//this是当前页面对象，view是页面要渲染的内容

注：option.full 隐藏导航栏。

### 自定义全部导航栏样式
在页面中定义customNavBar方法，返回一个view，那么就会渲染你的view。
***

##导航跳转

|  方法名        | 作用           | 参数 |参数介绍|
| ------------- |:-------------:| -----:|-----:|
  app_render      |渲染页面 |obj,view,this|obj(当前页面对象->this)，view(要渲染的内容)，option(页面可配置项)|
|app_open      |跳转页面 |obj,path,state|obj(当前页面对象->this)，path（要跳转的页面key（String）），state（Object参数对象，其中，title是关键字，是下一页面导航栏中的title）|
| resetTo      |重置路由栈|obj,path,state|obj(当前页面对象->this)，path（重置后的首页key（String）），state（Object参数对象)|
|popToRoot|跳转到首页 |obj,callback|obj(当前页面对象->this),callBack(function)回调函数|
| back      |返回上一页面|obj,callback |obj(当前页面对象->this),callBack(function)回调函数|
| back      |返回指定页面(暂时react-navigation独有)|obj,key,callback |obj(当前页面对象->this),key(react-navigation页面中自己生成的key，要通过this.props.navigation.state.key获取上一页面的key),callBack(function)回调函数|


在页面中定义back方法可以执行自定义back
***

