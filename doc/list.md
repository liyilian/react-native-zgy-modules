### List
| Property        | Type           | Default | Description |
| ------------- |:-------------:| -----:|----:|
|customStyles     |objiect|{} |样式|
| headerView| function      |null|设置list头部样式|
| sectionHeaderView| function      |null|分组头部显示视图|
| onFetch| function      |null| 接收数据|
| renderSeparator|   function    |null|行与行之间的分隔线
| rowView| function      |null|行数据渲染每行View|
| emptyView| function      |null|空界面|
| paginationAllLoadedViewfunction      |function| null|底部"没有更多数据"View|
| paginationFetchingView| function      |null| 底部"加载中"View|
| paginationWaitingView| function      |null|底部"点击加载更多 View|
| onScroll| function      |null|设置list滚动过程中样式变化等|

### 示例
```javascript
<MyListView
                    ref={(lv) => {
                        this.flatList = lv;
                    }}
                    onFetch={this.onFetch.bind(this)}//抓取数据
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
                    paginationAllLoadedView={() => {
                        return (
                            <View style={{
                                height: 44,
                                justifyContent: 'center',
                                alignItems: 'center',
                            }}>
                                <Text>
                                    小伙子，没有更多的数据了
                                </Text>
                            </View>
                        )
                    }}
                />
```
