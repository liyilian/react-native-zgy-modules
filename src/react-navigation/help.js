/**
 * Created by pzp on 17/12/11.
 */
import React, {Component} from 'react';
import {
    AppRegistry,
    Platform,
    StyleSheet,
    View,
    Text,
    TextInput,
    Navigator,
    TouchableOpacity,
    TouchableHighlight,
    Image,
    DeviceInfo
} from 'react-native';
import LinearGradient from 'react-native-linear-gradient';
import {NavigationActions} from 'react-navigation'

const DEFAULT_WIDTH = 60;
const BAR_HEIGHT = 44;
const BACKIMG_SIZE = 24;
const barStateHeight = Platform.OS === 'android' ? 0 : DeviceInfo.isIPhoneX_deprecated ? 44 : 20;
const default_backImg = require("./img/img_back.png");

class help {
    constructor(mainNavBar) {
        if (Object.prototype.toString.call(mainNavBar) === "[object Object]") {
            //读取配置样式
            this.backImg = mainNavBar.backImage || default_backImg;
            this.backImageStyle = mainNavBar.backImageStyle;
            this.mainContainerStyle = mainNavBar.mainContainerStyle;
            this.leftContainerStyle = mainNavBar.leftContainerStyle;
            this.rightContainerStyle = mainNavBar.rightContainerStyle;
            this.centerContainerStyle = mainNavBar.centerContainerStyle;
            this.titleStyle = mainNavBar.titleStyle;
            this.mainNavbarGradientStyle = mainNavBar.mainNavbarGradientStyle;
        }
    }

    /**
     * 默认顶部导航栏
     * @param obj 当前页面的this
     * @param option.navBar 自定义顶部导航栏参数：默认全为undefined
     *      (boolean)showBackButton          是否显示默认左侧button --- 默认显示
     *      (string -> uri)leftButtonImg       自定义左侧按钮图片
     *      (function)leftButtonFunc            自定义左侧按钮方法
     *      (string)title                       自定义标题文字
     *      (string -> uri)rightButtonImg     自定义右侧按钮图片
     *      (string)rightButtonText             自定义右侧按钮文字
     *      (function)rightButtonFunc           自定义右侧按钮方法
     *
     *      (style)leftContainerStyle
     *      (style)backImageStyle
     *      (style)titleStyle
     *      (style)rightImgStyle
     *      (style)rightTextStyle
     *      (style)backgroundColor
     */
    navBar(obj, option) {
        //自定义导航栏
        if (obj && obj.customNavBar) {
            return obj.customNavBar();
        } else {
            let navBarParams = this._assembleParams(obj, option);
            return this._renderNavBar(obj, navBarParams);
        }
    }

    /**
     * 私有方法，组装参数
     * @param obj
     * @param option
     * @returns {{}}
     * @private
     */
    _assembleParams(obj, option) {
        let navBarParams = {};
        navBarParams = {
            showBackButton: true,
            leftButtonImg: this.backImg,
            leftButtonFunc: undefined,
            title: obj.props.title || "",
            mainContainerStyle: [styles.container, this.mainContainerStyle],
            leftContainerStyle: [styles.left, this.leftContainerStyle],
            rightContainerStyle: [styles.right, this.rightContainerStyle],
            centerContainerStyle: [styles.center, this.centerContainerStyle],
            backImageStyle: [styles.backImageStyle, this.backImageStyle],
            titleStyle: [styles.titleStyle, this.titleStyle],
            rightImgStyle: [styles.backImageStyle],
            rightTextStyle: [styles.rightTextStyle],
            mainNavbarGradientStyle: this.mainNavbarGradientStyle
        };
        if (option && Object.prototype.toString.call(option.navBar) === "[object Object]") {
            for (key in option.navBar) {
                navBarParams[key] = option.navBar[key];
            }
        }
        return navBarParams;
    }

    /**
     * 私有方法：渲染默认的导航栏，通过判断mainNavbarGradientStyle使用不同的容器，用来实现渐变色效果
     * @param obj
     * @param navBarParams
     * @returns {view}
     * @private
     */
    _renderNavBar(obj, navBarParams) {
        let linearGradient = navBarParams.mainNavbarGradientStyle;
        if (linearGradient && !this._isEmpty(linearGradient)) {
            return (
                <LinearGradient
                    start={linearGradient.start}
                    end={linearGradient.end}
                    locations={linearGradient.locations}
                    colors={linearGradient.colors}
                    style={navBarParams.mainContainerStyle}>
                    {this._renderContainer(obj, navBarParams)}
                </LinearGradient>
            )
        } else {
            return (
                <View style={navBarParams.mainContainerStyle}>
                    {this._renderContainer(obj, navBarParams)}
                </View>
            )
        }

    }

    _isEmpty(obj) {
        for (let key in obj) {
            return false;
        }
        return true;
    }

    /**
     * 顶部导航栏的具体内容
     * @param obj
     * @param navBarParams
     * @returns {XML}
     * @private
     */
    _renderContainer(obj, navBarParams) {
        return (
            <View style={{flex: 1, flexDirection: "row"}}>
                <View style={[styles.defaultContainer, navBarParams.leftContainerStyle]}>
                    {
                        navBarParams.showBackButton === false ? null :
                            <TouchableOpacity onPress={() => {
                                this.back(obj, navBarParams.leftButtonFunc);
                            }}>
                                <Image style={navBarParams.backImageStyle}
                                       source={navBarParams.leftButtonImg}/>
                            </TouchableOpacity>
                    }
                </View>

                <View style={[styles.defaultContainer, navBarParams.centerContainerStyle]}>
                    <Text style={navBarParams.titleStyle}>
                        {navBarParams.title}
                    </Text>
                </View>

                <View style={[styles.defaultContainer, navBarParams.rightContainerStyle]}>
                    {
                        navBarParams.rightButtonImg ?
                            <TouchableOpacity onPress={() => {
                                navBarParams.rightButtonFunc();
                            }}>
                                <Image style={navBarParams.rightImgStyle}
                                       source={navBarParams.rightButtonImg}/>
                            </TouchableOpacity> :
                            navBarParams.rightButtonText ?
                                <TouchableOpacity onPress={() => {
                                    navBarParams.rightButtonFunc();
                                }}>
                                    <Text style={navBarParams.rightTextStyle}>
                                        {navBarParams.rightButtonText}
                                    </Text>
                                </TouchableOpacity> : null
                    }
                </View>
            </View>
        )
    }

    /**
     *
     * @param obj 当前页面的this
     * @param view 要显示的view
     * @param option 页面的附加配置
     *
     * @returns {view}
     */
    app_render(obj, view, option) {
        let libView = [];

        if (option && option.full) {
            //如果显示全屏
            return (
                <View style={styles.main}>
                    {view}
                    {libView}
                </View>
            );
        } else {
            return (
                <View style={styles.main}>
                    {this.navBar(obj, option)}
                    <View style={styles.content}>
                        {view}
                    </View>
                    {libView}
                </View>
            );
        }
    }

    /**
     *
     * @param obj 当前页面的this
     * @param path 要跳转的页面的路径
     * @param state 要传入的参数
     */
    app_open(obj, path, state) {
        obj.props.navigation.navigate(path, state);
    }

    /**
     *
     * @param obj 当前页面的this
     * @param path 要跳转的页面的路径
     * @param state 要传入的参数
     */
    resetTo(obj, path, state) {
        const resetAction = NavigationActions.reset({
            index: 0,
            actions: [
                NavigationActions.navigate({routeName: path})
            ]
        });
        obj.props.navigation.dispatch(resetAction);
    }

    /**
     * 可自定义页面的返回方法
     * @param obj       当前页面的this
     * @param callback  返回时可执行的回调函数
     */
    popToRoot(obj, callback) {
        throw warn("暂未实现");
    }

    /**
     * 可自定义页面的返回方法
     * @param obj       当前页面的this
     * @param callback  返回时可执行的回调函数
     */
    back(obj, callback) {
        //自定义返回
        if (obj && obj.back) {
            obj.back();
            return;
        }
        let navigation = obj.props.navigation;
        if (navigation) {
            navigation.goBack(null);
            if (typeof callback === "function") {
                callback();
            }
        }
    }

    /**
     * 指定跳转到某一页面
     * @param obj
     * @param key
     * @param callback
     */
    backTo(obj, key, callback) {
        let navigation = obj.props.navigation;
        if (navigation) {
            navigation.goBack(key);
            if (typeof callback === "function") {
                callback();
            }
        }
    }
}

styles = StyleSheet.create({
    main: {
        flex: 1,
    },
    content: {
        backgroundColor: "#fff",
        flexGrow: 1,
    },
    container: {
        width: "100%",
        height: BAR_HEIGHT + barStateHeight,
        paddingTop: barStateHeight,
        backgroundColor: "#c7c7c7",
        flexDirection: 'row'
    },

    left: {
        alignItems: 'flex-start',
        justifyContent: 'center',
        paddingHorizontal: 10,
        width: DEFAULT_WIDTH,
    },
    right: {
        alignItems: 'flex-end',
        justifyContent: 'center',
        paddingHorizontal: 10,
        width: DEFAULT_WIDTH,
    },
    center: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center'
    },

    backImageStyle: {
        width: BACKIMG_SIZE,
        height: BACKIMG_SIZE,
    },

    rightTextStyle: {
        fontSize: 16,
        color: '#fff'
    },

    titleStyle: {
        fontSize: 18,
        color: "#fff",
    },

    defaultContainer: {
        backgroundColor: "transparent"
    }

});

module.exports = help;

