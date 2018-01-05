'use strict'
import React, {Component} from 'react';
import {
    ListView,
    TouchableHighlight,
    View,
    Text,
    RefreshControl,
    ActivityIndicator,
} from 'react-native'
import LoadingView from './MyLoadingView.js';
class MyListView extends Component {
    constructor(props) {
        super(props);
        var ds = new ListView.DataSource({rowHasChanged: (r1, r2) => r1 !== r2});
        this.state = {
            dataSource: ds.cloneWithRows([]),
            isRefreshing: false,
            paginationStatus: 'none',
            loadData: false,
            pageTotal: null,
        }
    }

    _setPage(page) {
        this._page = page;
    }

    _getPage() {
        return this._page;
    }

    _setRows(rows) {
        this._rows = rows;
    }

    _getRows() {
        return this._rows;
    }

    MergeRecursive(obj1, obj2) {
        for (var p in obj2) {
            try {
                if (obj2[p].constructor == Object) {
                    obj1[p] = MergeRecursive(obj1[p], obj2[p])
                } else {
                    obj1[p] = obj2[p];
                }
            } catch (e) {
                obj1[p] = obj2[p]
            }
        }
        return obj1;
    }

    paginationFetchingView() {//底部加载更新动画
        if (this.props.paginationFetchingView) {
            return this.props.paginationFetchingView();
        }
        return (
            <View style={[{
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
        }, this.props.customStyles.paginationView]}>
    <LoadingView
        color={this.props.refreshableTintColor}
    />
    </View>
    );
    }

    paginationAllLoadedView() {//数据加载完成
        if (this.props.paginationAllLoadedView) {
            return this.props.paginationAllLoadedView();
        }
        return (
            <View style={[{
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
        }, this.props.customStyles.paginationView]}>
    <Text style={[{
            fontSize: 20,
        }, this.props.customStyles.actionsLabel]}>
        end
        </Text>
        </View>
    )
    }

    paginationWaitingView(paginateCallback) {//等待触摸，paginateCallback调用加载更多
        if (this.props.paginationWaitingView) {
            return this.props.paginationWaitingView(paginateCallback);
        }
        return (
            <TouchableHighlight
        underlayColor='#c8c7cc'
        onPress={paginateCallback}
        style={[{
            height: 44,
            justifyContent: 'center',
            alignItems: 'center',
        }, this.props.customStyles.paginationView]}
    >
    <Text style={[{
            fontSize: 20,
        }, this.props.customStyles.actionsLabel]}>
        点击更多
        </Text>
        </TouchableHighlight>
    )
    }

    headerView() {
        if (this.state.paginationStatus === 'firstLoad' || !this.props.headerView) {
            return null;
        }
        return this.props.headerView();
    }

    emptyView(refreshCallback) {
        if (this.props.emptyView) {
            return this.props.emptyView(refreshCallback)
        }
        return (
            <View style={[{
            justifyContent: 'center',
            alignItems: 'center',
            padding: 20,
        }, this.props.customStyles.defaultView]}>
    <Text style={[{
            fontSize: 16,
            fontWeight: 'bold',
            marginBottom: 15,
        }, this.props.customStyles.defaultViewTitle]}>
        对不起，没有内容显示
        </Text>
        <TouchableHighlight
        underlayColor='#c8c7cc'
        onPress={refreshCallback}
            >
            <Text>
            点击刷新↻
    </Text>
        </TouchableHighlight>
        </View>
    )
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
        }, this.props.customStyles.separator]}
    />
    );
    }

    sectionHeaderView(sectionData, sectionID) {
        if (this.props.withSections === false) {
            return null;
        }
        if (this.props.sectionHeaderView) {
            return this.props.sectionHeaderView();
        }
        return (
            <View style={{
            backgroundColor: '#50a4ff',
                padding: 10
        }}>
    <Text style={{
            color: '#fff'
        }}>
        Head
        </Text>
        </View>
    )
    }

    getInitialState() {
        this._setPage(1);
        this._setRows([]);
        var ds = null;
        if (this.props.withSections === true) {
            ds = new ListView.DataSource({
                    rowHasChanged: (row1, row2) => row1 !== row2,
                sectionHeaderHasChanged: (section1, section2) => section1 !== section2,
        });
            return {
                dataSource: ds.cloneWithRowsAndSections(this._getRows()),
                isRefreshing: false,
                paginationStatus: 'none',
                isRefreshable: false,
                loadData: false
            }
        } else {
            ds = new ListView.DataSource({
                    rowHasChanged: (row1, row2) => row1 !== row2,
        });
            return {
                dataSource: ds.cloneWithRows(this._getRows()),
                isRefreshing: false,
                paginationStatus: 'none',
                isRefreshable: false,
                loadData: false,
            }
        }
    }

    getGiftedListView() {

    }

    componentDidMount() {
        this._setPage(1);
        if (this.props.startLoad) {
            this.setState({
                isRefreshing: true,
                paginationStatus: 'none',
            });
            this._refresh();
        } else {
            this.setState({
                paginationStatus: 'empty'
            })
        }
    }

    setNativeProps(props) {
        this.refs.listView.setNativeProps(props)
    }

    _refresh() {
        this._onRefresh({external: true});
    }

    _onRefresh(options = {}) {
        if (this.state.paginationStatus === 'fetching' || this.state.isRefreshing) {
            return null
        }

        this.setState({
            isRefreshing: true,
            paginationStatus: 'none'
        });
        this._setPage(1);
        this.props.onFetch(this._getPage(), this._postRefresh.bind(this), options);
    }

    _postRefresh(rows = [], options = {}) {
        this._updateRows(rows, options);
    }

    _onPaginate() {
        if (this._getRows() && this._getRows().length === 0) {
            return null;
        }
        if (this.props.pageSize && this.props.pageSize != 0 && this.state.pageTotal) {
            if (this._getPage() > this.state.pageTotal / this.props.pageSize) {
                this.setState({
                    paginationStatus: "allLoaded"
                })
                return null;
            }
        }
        if (this.state.paginationStatus === 'allLoaded'
            || this.state.paginationStatus === 'fetching'
            || this.state.isRefreshing) {
            return null
        } else {
            this.setState({
                paginationStatus: 'fetching',
            });
            this.props.onFetch(this._getPage() + 1, this._postPaginate.bind(this), {})
        }
    }

    _postPaginate(rows = [], options = {}) {

        this._setPage(this._getPage() + 1);
        var mergedRows = null;
        this.setState({
            pageTotal: options && options.option ? options.option : null
        });
        if (this.props.withSections === true) {
            mergedRows = this.MergeRecursive(this._getRows())
        } else {
            if (options && options.addFirst) {
                mergedRows = rows.concat(this._getRows())
            } else {
                mergedRows = this._getRows().concat(rows)
            }
        }
        this._updateRows(mergedRows, options);
    }

    _updateRows(rows = [], options = {}) {
        if (rows !== null) {
            this._setRows(rows);
            if (this.props.withSections === true) {
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRowsAndSections(rows),
                    isRefreshing: false,
                    loadData: false,
                    paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting'),
                })
            } else {
                console.log("12122232323232")
                this.setState({
                    dataSource: this.state.dataSource.cloneWithRows(rows),
                    isRefreshing: false,
                    loadData: false,
                    paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting')
                })
            }
        } else {
            this.setState({
                isRefreshing: false,
                loadData: false,
                paginationStatus: (options.allLoaded === true ? 'allLoaded' : 'waiting')
            })
        }
    }

    _renderPaginationView() {
        if ((this.state.paginationStatus === 'fetching' ) || (this.state.paginationStatus === 'firstLoad' && this.props.firstLoader === true)) {
            return this.paginationFetchingView();
        } else if (this.state.paginationStatus === 'waiting' && (this.props.withSections === true || (this._getRows() && this._getRows().length > 0))) {
            console.log("wewewe")
            return this.paginationWaitingView(this._onPaginate.bind(this))
        } else if (this.state.paginationStatus === 'allLoaded') {
            return this.paginationAllLoadedView()
        } else if (this.state.paginationStatus === 'none') {
            return null;
        } else if (this._getRows() && this._getRows().length === 0) {
            return this.emptyView(this.refreshList.bind(this))
        } else {
            return null;
        }
    }

    renderRefreshControl() {
        if (this.props.renderRefreshControl) {
            return this.props.renderRefreshControl({onRefresh: this._onRefresh.bind(this)})
        }
        return (
            <RefreshControl
        onRefresh={this._onRefresh.bind(this)}
        refreshing={this.state.isRefreshing}
        colors={this.props.refreshableColors}
        progressBackgroundColor={this.props.refreshableProgressBackgroundColor}
        size={this.props.refreshableSize}
        tintColor={this.props.refreshableTintColor}
        title={this.props.refreshableTitle}
        titleColor={this.props.refreshableTintColor}
    />
    )
    }

    refreshList() {
        var ds = null;
        var dataSource = null;
        if (this.props.withSections === true) {
            dataSource = this.state.dataSource.cloneWithRowsAndSections([]);
        } else {
            dataSource = this.state.dataSource.cloneWithRows([])
        }

        this.setState({
            dataSource: dataSource,
            loadData: true,
        })
        this._onRefresh();
    }

    render() {
        var big = {
            position: "absolute",
            width: "100%",
            height: "100%",
        };
        return (
            <View style={[this.props.style, {position: "relative", width: "100%", height: "100%"}]}>
    <ListView
        style={big}//样式
        ref="listView"//ref
        renderRow={this.props.rowView}//显示每行样式
        dataSource={this.state.dataSource}//数据源
        renderSectionHeader={this.sectionHeaderView.bind(this)}//头部显示视图
        onScroll={(...e) => {
            if (this.props.onScroll) {
                this.props.onScroll(...e);//设置list滚动过程中样式变化等
            }
        }}
        renderHeader={this.headerView.bind(this)}//设置list头部样式
        renderFooter={this._renderPaginationView.bind(this)}//设置list底部样式
        renderSeparator={this.renderSeparator.bind(this)}//渲染每一行的间隔view
        enableEmptySections={true}//错误截图
        automaticallyAdjustContentInsets={false}//在使用Navigator的同时使用ListView或ScrollView，后两者的头部会多出一些空间。
        scrollEnabled={this.props.scrollEnabled}//当值为false的时候，内容不能滚动，默认值为true。
        canCancelContentTouches={true}//可以拖动滚动视图
        refreshControl={
            this.renderRefreshControl()
    } //下拉刷新
        onEndReached={
            this._onPaginate.bind(this)}//上拉加载
        onEndReachedThreshold={10}//距离不到10个像素点时，触发上拉加载事件
        {...this.props}
    />
        {this.state.loadData ?
        <View style={big}>
            <View>
            <ActivityIndicator
            animating={true}
            color={this.props.refreshableTintColor}
            size="small"
                />
                <Text style={{marginTop: 5}}>{this.props.refreshableTitle}</Text>
        </View>
        </View> : null
        }
    </View>
    )
    }
}
MyListView.defaultProps = {
    customStyles: {},//样式
    initialListSize: 10,
    startLoad: false,
    firstLoader: true,
    pagination: true,
    refreshable: true,
    refreshableColors: ['#00bb00', '#00bb00', '#00bb00'],
    refreshableProgressBackgroundColor: '#ffffff',
    refreshableSize: undefined,
    refreshableTitle: '刷新中',
    refreshableTintColor: '#1299F4',
    renderRefreshControl: null,//加载的动画样式
    headerView: null,//设置list头部样式
    sectionHeaderView: null,//分组头部显示视图
    scrollEnabled: true,//当值为false的时候，内容不能滚动，默认值为true。
    withSections: false,//是否分组显示
    onFetch(page, callback, options) {
        callback([]);
    },//传数据
    onScroll: null,//设置list滚动过程中样式变化等
    paginationFetchingView: null,//设置list底部样式（正在加载）
    paginationAllLoadedView: null,//设置list底部样式（加载完）
    paginationWaitingView: null,//设置list底部样式（点击加载）
    emptyView: null,//空界面
    renderSeparator: null,//分割线样式
    rowView: null,//显示每行样式
}

module.exports = MyListView;















