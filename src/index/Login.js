/**
 * Created by apin on 2017/6/30.
 */
/**
 * 登录
 */
import React, {
    Component,
} from 'react';
import {
    Text,
    TouchableOpacity,
} from 'react-native';
import HttpTool from '../http/HttpTool.js';
class page extends Component {
    //构造器(如果你想做某些事情 ..就是我们经常看到的do someing)
    constructor(props) {
        super(props);
    }

    //组件的视图核心  渲染显示
    render() {
        return (
            <TouchableOpacity
                onPress={
                    () => {
                      this.load()
                     }
                }>
                <Text style={{marginTop: 50}}>登录</Text>
            </TouchableOpacity>
        );
    }

    load() {
        //参数
        var param = {
        };
        var successCallback = (code, message, json, option) => {
            console.log("1111"+json)
        };
        var failCallback = (code, message) => {
            console.log("2222")
        };
        HttpTool.post("https://www.raiyku.com/json", successCallback, failCallback, param);

    }


}
module.exports = page;