import React, {Component} from "react";
import {ActivityIndicator, TouchableOpacity, StyleSheet, Text, View, ScrollView, FlatList} from "react-native";

import HttpTool from '../http/HttpTool.js';
import MyListView from '../list/MyFlatList'
class page extends Component {
    constructor(props) {
        super(props);
        this.state = {
            allLoaded: false,
            errorMessage: "暂无数据",
            arr: []
        }
    }

    //网络请求——获取第pageNo页数据
    onFetch(page = 0, callback, options) {
        //这个是js的访问网络的方法
        var param = {
            pageNo: page,
            pageSize: 10
        };
        var successCallback = (code, message, json, option) => {
            callback(json.data, {
                allLoaded: option.option.isfinal == "1", //显示结束的底部样式,由你来控制
                option: json.options.allNum
            });
        };
        var failCallback = (code, message, option) => {
            callback([], {
                allLoaded: option.option.isfinal == "1", //显示结束的底部样式,由你来控制
            });
            this.setState({
                errorMessage: message
            })
        };
        setTimeout(() => {
            // HttpTool.post("http://192.168.3.240:4050/list", successCallback, failCallback, param);
            let arr = [];
            for (let i = 0; i < 10; i++) {
                arr.push({
                    key: "a_" + ((parseInt(page - 1) * 10) + i),
                });
            }
            console.log("加载网络" + page);
            callback(page > 2 ? [] : arr, {
                allLoaded: page > 2 ? true : false, //显示结束的底部样式,由你来控制
            });
        }, 0)
    }

    componentDidMount() {
        setTimeout(() => {
            //第一次请求列表可以
            //  this.flatList._onRefresh();
        }, 3000)
    }

    //返回itemView
    _renderItemView(rowData, sectionID, rowID, highlightRow) {
        return (
            <View style={{height: 200}}>
                <Text style={styles.title}>name:{rowData.item.key}</Text>
            </View>
        );
    }

    render() {
        return (
            <View
                style={{marginTop: 20}}
            >
                <MyListView
                    ref={(lv) => {
                        this.flatList = lv;
                    }}
                    autoMore={false}
                    defaultLoadType={"refresh"}
                    onFetch={(page, callBack, option) => {
                        this.onFetch(page, callBack, option);
                    }}//抓取数据
                    rowView={this._renderItemView.bind(this)}//每行显示
                    //  pageSize={10}
                    emptyView={(refreshCallback) => {
                        return (
                            <View style={{width: "100%", height: 480, justifyContent: "center"}}>
                                <TouchableOpacity
                                    onPress={() => {
                                        this.flatList.refresh();
                                    }}>
                                    <Text style={{
                                        backgroundColor: "transparent",
                                        textAlign: "center",
                                        color: "#00a",
                                        marginTop: 20
                                    }}>
                                        {this.state.errorMessage}
                                    </Text>
                                </TouchableOpacity>
                            </View>
                        );
                    }}
                />
            </View>

        );
    }
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: '#F5FCFF',
    },
    title: {
        fontSize: 15,
        color: 'blue',
    },
    footer: {
        flexDirection: 'row',
        height: 24,
        justifyContent: 'center',
        alignItems: 'center',
        marginBottom: 10,
    },
    content: {
        fontSize: 15,
        color: 'black',
    }
});
module.exports = page;




