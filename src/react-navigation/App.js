import {StackNavigator, TabNavigator} from 'react-navigation';
import CardStackStyleInterpolator from 'react-navigation/src/views/CardStack/CardStackStyleInterpolator';
import {withMappedNavigationProps} from 'react-navigation-props-mapper'
import Ionicons from 'react-native-vector-icons/Ionicons';
import help from './help';
import React from 'react';

let reactNavigation = {
    initRoute(routes) {
        let routeList = {};
        for (let key in routes) {
            routeList[key] = {
                screen: withMappedNavigationProps(routes[key]), navigationOptions: {
                    header: null
                },
            }
        }
        return routeList;
    },
    initApp(routeList) {
        return StackNavigator(routeList, {
            transitionConfig: () => ({
                screenInterpolator: CardStackStyleInterpolator.forHorizontal,
            })
        });
    },
    initTabBarRoute(routes) {
        let routeList = {};
        for (let key in routes) {
            routeList[key] = {
                screen: withMappedNavigationProps(routes[key]),
                navigationOptions: {
                    tabBarIcon: ({tintColor, focused}) => (
                        <Ionicons
                            name={focused ? 'ios-home' : 'ios-home-outline'}
                            size={26}
                            style={{color: tintColor}}
                        />
                    ),
                },
            }
        }
        return routeList;
    },
    initNavbar(navBar) {
        global.help = new help(navBar);
    },
    initAppForTabBar(routeList) {
        return RootTabs = TabNavigator(routeList, {
            animationEnabled: true, // 切换页面时是否有动画效果
            tabBarPosition: 'bottom', // 显示在底端，android 默认是显示在页面顶端的
            swipeEnabled: false, // 是否可以左右滑动切换tab
            backBehavior: 'none', // 按 back 键是否跳转到第一个Tab(首页)， none 为不跳转
            tabBarOptions: {
                activeTintColor: '#ff8500', // 文字和图片选中颜色
                inactiveTintColor: '#999', // 文字和图片未选中颜色
                showIcon: true, // android 默认不显示 icon, 需要设置为 true 才会显示
                indicatorStyle: {
                    height: 0  // 如TabBar下面显示有一条线，可以设高度为0后隐藏
                },
                style: {
                    backgroundColor: '#fff', // TabBar 背景色
                    // height: 44
                },
                labelStyle: {
                    fontSize: 10, // 文字大小
                },
            },
        });
    }
};

export default reactNavigation;


