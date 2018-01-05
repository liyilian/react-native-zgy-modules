### Http



### 示例
```javascript
  var param = {
            pageNo: page,
            pageSize: 10
        };
        var successCallback = (code, message, json, option) => {
            callback(json.data, {
                allLoaded: option.option.isfinal == "1", //显示结束的底部样式,由你来控制
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
      HttpTool.post("http://192.168.3.240:4050/list", successCallback, failCallback, param);

```
