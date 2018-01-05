### Modal
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| open | Modal是否打开 | bool | false |
| overlayBackground | 遮罩层颜色 | string | rgba(0, 0, 0, 0.75) |
| animationDuration | Animated.timing duration | number| 200 |
| animationTension | Animated.spring tension | number | 40 |
| modalDidOpen | 打开完成回调 | func | () => undefined |
| modalDidClose | 关闭回调 | func | () => undefined |
| closeOnTouchOutside | 点击背景是否关闭 | bool | true |
| containerStyle | 遮罩层样式 |
| modalStyle | 内容区域样式 |
| disableOnBackPress | 安卓禁用后退按钮 | bool | true |

### 示例
```javascript
<TouchableHighlight onPress={() => this.setState({ open: true })}>
	<Text>Open modal</Text>
	</TouchableHighlight>
<Modal
  open={this.state.open}
  modalDidOpen={() => console.log('modal did open')}
  modalDidClose={() => this.setState({open: false})}
  style={{alignItems: 'center'}}>
  <View>
	<Text style={{fontSize: 20, marginBottom: 10}}>Hello world!</Text>
	<TouchableOpacity
	  style={{margin: 5}}
	  onPress={() => this.setState({offset: -100})}>
	  <Text>Move modal up</Text>
   </TouchableOpacity>
	<TouchableOpacity
	  style={{margin: 5}}
	  onPress={() => this.setState({offset: 0})}>
	  <Text>Reset modal position</Text>
	</TouchableOpacity>
	<TouchableOpacity
	  style={{margin: 5}}
	  onPress={() => this.setState({open: false})}>
	  <Text>Close modal</Text>
	</TouchableOpacity>
  </View>
</Modal>
```
