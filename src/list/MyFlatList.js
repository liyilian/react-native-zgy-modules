'use strict'
import React from 'react';
import {
    FlatList,
    TouchableHighlight,
    TouchableOpacity,
    View,
    Text,
    ActivityIndicator,
} from 'react-native'
import LoadingView from './MyLoadingView.js';
class MyFlatList extends React.PureComponent {
    constructor(props) {
        super(props);
        this.pageIndex = 1;
        this.loadState = "none";
        //loadingMore loadingRefresh none
        this.isEnd = false;//判断是否还有数据
        this.loadData = [];
        this.state = {
            dataSource: [],
            refreshing: false,
            moring: false,
            upView: 1,
        }
    }

    componentDidMount() {
        if (!this.props.defaultLoad) {
            return;
        }
        if (this.props.defaultLoadType === "more") {
            this.more();
        } else {
            this.refresh();
        }
    }

    more() {
        if (this.verLoading()) {
            return;
        }
        this.loadState = "loadingMore";
        this.showMore(true, () => {
            this.getLoadData((data, option) => {
            this.isEnd = option.allLoaded
        setTimeout(() => {
            this.setState({
            dataSource: this.state.dataSource.concat(data),
        }, () => {
            console.log("加载完成" + this.pageIndex)
        this.pageIndex++;
        this.loadState = "none";
        this.showMore(false, () => {
        })

    });
    }, 0)

    })
    });
    }

    refresh() {
        if (this.verLoading()) {
            return;
        }
        this.loadState = "loadingRefresh"
        this.pageIndex = 1;
        this.showRefresh(true, () => {
            this.getLoadData((data, option) => {
            this.isEnd = option.allLoaded
        this.loadData = data
        this.setState({
            dataSource: data,
        }, () => {
            console.log("加载完成" + this.pageIndex)
        this.pageIndex++;

        this.loadState = "none";
        this.showRefresh(false)
    });
    });
        // setTimeout(, 2000)
    })
    }

    verLoading() {

        return this.loadState !== "none";
    }

    showRefresh(refreshing, cb) {
        this.setState({
            refreshing
        }, cb);
    }

    showMore(moring, cb) {
        this.setState({
            moring
        }, cb);
    }


    getLoadState() {
        return this.loadState;
    }

    getLoadData(cb) {


        if (this.props.onFetch) {
            this.props.onFetch(this.pageIndex, cb, {});
        }
    }

    getVMData() {
        let arr = [];
        let pageSize = 10;
        for (let i = 0; i < pageSize; i++) {
            arr.push({
                key: "a" + (this.pageIndex * pageSize + i),
            });
        }
        this.pageIndex++;

        return arr;
    }


    goMore() {
        console.log("goMore")
    }

    renderSeparator() {
        if (this.props.renderSeparator) {
            return this.props.renderSeparator();
        }
        return (
            <View
        style={[{
            height: 1,
            backgroundColor: '#CCC'
        }, this.props.separator]}
    />
    );
    }

    render() {
        let loadState = this.getLoadState();
        console.log("render" + this.isEnd);
        let onRefresh = null;
        let ListFooterComponent = null;

        if (loadState != "loadingRefresh") {
            ListFooterComponent = () => {
                return this.renderBottomView();
            };
        }
        if (loadState != "loadingMore") {
            onRefresh = () => {
                console.log("loading");
                this.refresh();
            };
        }
        let diyPro = {onRefresh, ListFooterComponent};
        let threshold = 0.1;
        return (

            <View style={{height: "100%", backgroundColor: "#ff0000"}}>
    <FlatList
        onMomentumScrollEnd={() => {
            //console.log("begin")
            if (this.begin) {
                this.more();
                this.begin = false;
            }
        }}
        style={{backgroundColor: "#00aaff"}}
        refreshing={this.state.refreshing}
        {...diyPro}
        onEndReached={(info) => {
            if (!this.isEnd)
                this.begin = true;
        }}
        ItemSeparatorComponent={this.renderSeparator.bind(this)}
        onEndReachedThreshold={threshold}
        data={this.state.dataSource}
        renderItem={this.props.rowView}
        {...this.props}
    />
    </View>
    );
    }

    renderBottomView() {
        // let type = "Default";
        if (this.loadData.length === 0) {
            if (this.props.emptyView) {
                return this.props.emptyView(() => {
                        this.refresh()
            })
            }
            return (
                <View style={[{
                justifyContent: 'center',
                alignItems: 'center',
                padding: 20,
            }, this.props.defaultView]}>
        <Text style={[{
                fontSize: 16,
                fontWeight: 'bold',
                marginBottom: 15,
            }, this.props.defaultViewTitle]}>
            对不起，没有内容显示
            </Text>
            <TouchableHighlight
            underlayColor='#c8c7cc'
            onPress={() => {
                this.refresh()
            }}
        >
        <Text>
            点击刷新↻
        </Text>
            </TouchableHighlight>
            </View>
        )
        } else {
            if (this.isEnd) {
                if (this.props.paginationAllLoadedView) {
                    return this.props.paginationAllLoadedView()
                }
                return (
                    <View style={[{
                    height: 44,
                    justifyContent: 'center',
                    alignItems: 'center',
                }, this.props.paginationView]}>
            <Text>{ "没有更多数据"}</Text>
                </View>);

            } else {
                if (this.state.moring) {
                    if (this.props.paginationFetchingView) {
                        return this.props.paginationFetchingView();
                    }
                    return (
                        <View style={[{
                        height: 44,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }, this.props.paginationView]}>
                <LoadingView
                    color={this.props.refreshableTintColor}
                />
                </View>
                );
                } else {
                    if (this.props.paginationWaitingView) {
                        return this.props.paginationWaitingView(() => {
                                this.more();
                    });
                    }
                    return (
                        <TouchableOpacity onPress={() => {
                        this.more();
                    }} style={[{
                        height: 44,
                        justifyContent: 'center',
                        alignItems: 'center',
                    }, this.props.paginationView]}>
                <Text>{ "点击加载更多"}</Text>
                    </TouchableOpacity>);
                }
            }
        }

        // return ( <BottomView
        //
        //     type={type}
        //     onAction={() => {
        //         this.more();
        //     }}/>);
    }


}

class BottomView extends React.Component {

    renderDefault() {
        return (
            <TouchableOpacity onPress={(e) => {
            if (this.props.onAction) {
                this.props.onAction(e);
            }
        }}>
    <Text>{ "点击加载更多"}</Text>
        </TouchableOpacity>);
    }

    renderLoading() {
        return (
            <View style={[{
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
        }, this.props.paginationView]}>
    <LoadingView
        color={this.props.refreshableTintColor}
    />
    </View>
    );
    }

    renderEnd() {
        return (
            <View style={[{
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
        }, this.props.paginationView]}>
    <Text>{ "没有更多数据"}</Text>
        </View>);
    }

    render() {
        return this["render" + this.props.type]();

    }
}
BottomView.defaultProps = {
    type: "Default"//Loading,End,Default
}
/**
 *
 * 组件参数
 */
MyFlatList.defaultProps = {
    autoMore: false,//autoMore: boolean  当不满足一屏数据时,是否自动加载下一次,直到满屏数据  默认：false 注:autoMore生效区间为 defaultLoad:true时
    defaultLoad: true,//defaultLoad:boolean 当组件被挂载时,是否自动加载数据 可选值:true,false 默认:true
    defaultLoadType: "refresh",//defaultLoadType:string 首页加载,默认执行加载动画,可选值:more,refresh 默认:refresh

}

module.exports = MyFlatList;