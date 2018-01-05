/**
 * Created by lixifeng on 16/8/1.
 */

let HttpTool = {

    
    /**
     *
     * @param param // var param=  JSON.stringify({p: 1, pc: 10,});
     * @param zd_type // var zd_type = HttpTool.Course_getCourseList;
     * @param successCallback
     *  var successCallback = (code,message,json)=>{
                     HttpTool.print("返回 code:"+ code);
                     HttpTool.print("返回 message:"+ message);
                     HttpTool.print("返回 json:"+ json);
                };

     * @param failCallback
     *   var failCallback = (code,message)=>{
                    console.warn("错误 code:"+ code);
                    console.warn("错误 message:"+ message);
                };
     */
    post:(url, successCallback, failCallback,param) =>{
        //option 参数必须是对象,里面包括 (type 请求方式,url 请求路径,param 请求参数)
        var paramsDemo="";
        if (param) {
            //POST请求,用来跨域
            var i=0;
            for (var key in param) {
                var v = param[key];
                if(v === undefined ){
                    continue;
                }
                paramsDemo += i == 0 ? (key + '=' + param[key]) : ('&' + key + '=' + v);
                ++i;
            }

        }
        console.log("参数:"+paramsDemo);
        console.log(param);
        var host = url
        console.log(host)

        fetch(host, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded;charset=utf-8',

            },
            body: paramsDemo
        }).then((response) => response.json())
            .then((json) => {

                json = HttpTool.removeEmpty(json);

                var option = {
                    code:json.code,
                    message:json.msg,
                    host:host,
                    option:json.option?json.option:{},
                };
                console.log("------success--------");
                console.log(option);
                console.log(json);
                if(json.code>0){

                    successCallback(option.code,option.message,json,option);
                }else{
                    if(json.code==-2){
                        HttpTool.logoutAction();
                    }
                    failCallback(option.code,option.message,option)

                }
            })
            .catch((error) => {
                var option = {
                    code:-999,
                    message:"系统繁忙,请稍候再试",
                    host:host,
                    option:{}
                };
                console.log("-----error---------");
                console.log(option);
                console.log(error);
                failCallback(option.code,option.message,option)
            });
    },


     removeEmpty(obj) {
        if(typeof obj === 'object'){
            for(let key in obj){
                //判断是否为NULL
                // log("obj"+key+":"+obj[key])
                if(obj[key] === undefined || obj[key] === null){
                    obj[key] = "";
                    // log("修改"+key+":"+obj[key])
                }else{
                    HttpTool.removeEmpty(obj[key])
                }
            }

        }else if(HttpTool.isArray(obj)){
            for(let v of obj){
                HttpTool.removeEmpty(v);
            }
        }else {
            //其他类型

        }
    return obj;
},
    isArray(object){
        return object && typeof object === 'object' &&
            Array == object.constructor;
    },
}
module.exports = HttpTool;