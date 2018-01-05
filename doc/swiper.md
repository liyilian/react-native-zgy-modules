### MySwiper
| 参数 | 说明 | 类型 | 默认值 |
| --- | --- | --- | --- |
| activeDotStyle | active索引样式 |
| autoplay | 是否自动轮播 | bool | false |
| autoplayTimeout | 自动轮播时间 | number |
| dotStyle | 索引样式 |
| onIndexChanged | 索引变化回调 | func | () => undefined |
| paginationStyle | 索引区样式 |
| showsPagination | 是否显示索引区 | bool | true |
| width | 宽度 |

### 示例
```javascript
<MySwiper
	height={300}
	autoplay={true}
	autoplayTimeout={5}
	// showsPagination={false}
	onIndexChanged={(index) => {
		console.log(index)
	}}
	paginationStyle={{ backgroundColor: 'rgba(0,0,0,.3)' }}
	dotStyle={{backgroundColor:'#fff', width: 12, height: 12,borderRadius: 6}}
	activeDotStyle={{backgroundColor:'#0ff', width: 12, height: 12,borderRadius: 6}}
>
	<View style={styles.slide1}>
		<Text style={styles.text}>Hello Swiper</Text>
	</View>
	<View style={styles.slide2}>
		<Text style={styles.text}>Beautiful</Text>
	</View>
	<View style={styles.slide3}>
		<Text style={styles.text}>And simple</Text>
	</View>
</MySwiper>
```
