# 路由
***
目前共集成了2套react-native路由库
分别为

* [react-native-navigation](https://wix.github.io/react-native-navigation/#/)
* [react-navigation](https://reactnavigation.org/)

***

### react-native-navigation

- 优点：纯原生路由库，拥有最极致的性能，页面切换等操作帧率始终能保持在60针左右。简单易用，提供了优秀的原生体验。
- 缺点：
1、侵入性太大，对react-native的入口文件，尤其是android文件进行了较大的修改，导致android在link外部库的时候要手动在MainApplication中引入第三方库。
2、目前还不支持popTo到路由栈中任意页面功能，无法实现A->B->C->D ,从D 返回B或者A这一功能需求。虽然目前通过修改ios库中原生代码实现了此功能，但android暂时未深入研究。

具体如何使用react-native-navigation请查看 [文档](./react-native-navigation/react-native-navigation.md)
***

### react-navigation

- 优点：是目前facebook公司官方推荐的路由库，也是目前使用较多的第三方路由库，网上资料随处可见。提供的功能相当全面。基本能满足各项路由需求。
- 缺点：
  1、据说此路由库提供了接近原生的交互体验。但是，真机实测下来，掉帧问题比较严重，最简单的页面跳转，javascript渲染针数依然会下降到30针左右。
  2、该路由库修改了默认页面传参的模式，正常页面跳转是使用this.props获取传递过来的函数，此库强行改为了this.props.navigation.state.params。目前通过引用[react-navigation-props-mapper](https://github.com/vonovak/react-navigation-props-mapper)库来对传参进行了一次映射，强行改为了this.props这一方法来获取传值。

具体如何使用react-navigation请查看[文档](./react-navigation/react-navigation.md)
