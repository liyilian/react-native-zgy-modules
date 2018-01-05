package xyz.soyouarehere.superlibrary;

import org.json.JSONObject;

import java.io.Serializable;

/**
 * Created by Administrator on 2017/12/7.
 */

public class Response implements Serializable{
    public String code;
    public String msg;
    public String body;

    @Override
    public String toString() {
        return "Response{" +
                "code='" + code + '\'' +
                ", msg='" + msg + '\'' +
                ", body='" + body + '\'' +
                '}';
    }

    public String getCode() {
        return code;
    }

    public String getMsg() {
        return msg;
    }

    public String getBody() {
        return body;
    }

    public static class Builder{
        Response response;
        public Builder code(String code){
            response.code= code;
            return this;
        }
        public Builder msg(String msg){
            response.msg= msg;
            return this;
        }
        public Builder body(String body){
            response.body= body;
            return this;
        }
        public Response builder(){
            return response;
        }

    }

}
