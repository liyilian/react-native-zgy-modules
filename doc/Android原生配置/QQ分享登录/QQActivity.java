package com.android.apin;

import android.app.Activity;
import android.content.Intent;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.text.TextUtils;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.tencent.connect.UserInfo;
import com.tencent.connect.share.QQShare;
import com.tencent.tauth.IUiListener;
import com.tencent.tauth.Tencent;
import com.tencent.tauth.UiError;

import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

import xyz.soyouarehere.superlibrary.ShareBean;
import xyz.soyouarehere.superlibrary.Utils;

import static xyz.soyouarehere.superlibrary.SuperModule.superModule;

public class QQActivity extends Activity implements IUiListener {

    public static final String Scope = "all";//授权类型
    String APP_ID = "1105694910";//ID
    QQActivity activity;
    Tencent mTencent;
    ShareBean bean;
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        mTencent = Tencent.createInstance(APP_ID, this.getApplicationContext());
        activity = this;
        if (getIntent().getStringExtra("QQType").equals("login")){//QQShare
            mTencent.login(this, Scope, this);
        }else {
            bean = (ShareBean) getIntent().getSerializableExtra("ShareBean");
            _qqShare();
        }
    }

    public void  _qqShare(){
//        这条分享消息被好友点击后的跳转URL。
//        bundle.putString(QQConstants.PARAM_TARGET_URL, "http://connect.qq.com/");
//        分享的标题。注：PARAM_TITLE、PARAM_IMAGE_URL、PARAM_	SUMMARY不能全为空，最少必须有一个是有值的。
        if (bean.getType().equals("news")){
            final Bundle bundle = new Bundle();
            bundle.putString(QQShare.SHARE_TO_QQ_TITLE, bean.getTitle());
            bundle.putString(QQShare.SHARE_TO_QQ_SUMMARY, bean.getDescription());
            bundle.putString(QQShare.SHARE_TO_QQ_TARGET_URL, bean.getWebpageUrl());
            bundle.putString(QQShare.SHARE_TO_QQ_IMAGE_URL, bean.getImageUrl());
            runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mTencent.shareToQQ(activity, bundle, new IUiListener() {
                        @Override
                        public void onCancel() {
                            WritableMap map = Arguments.createMap();
                            map.putString("type", "QQShare.Resp");
                            map.putString("code","-1");
                            map.putString("msg","用户取消");
                            map.putString("body","用户取消");
                            superModule.nativeSendToJs("SuperModel_Resp",map);
                            finish();
                        }
                        @Override
                        public void onComplete(Object response) {
                            WritableMap map = Arguments.createMap();
                            map.putString("type", "QQShare.Resp");
                            map.putString("code","1");
                            map.putString("msg","分享成功");
                            map.putString("body",""+response);
                            superModule.nativeSendToJs("SuperModel_Resp",map);
                            finish();
                        }

                        @Override
                        public void onError(UiError e) {
                            WritableMap map = Arguments.createMap();
                            map.putString("type", "QQShare.Resp");
                            map.putString("code","-1");
                            map.putString("msg","分享失败");
                            map.putString("body",""+e.errorMessage);
                            superModule.nativeSendToJs("SuperModel_Resp",map);
                            finish();
                        }
                    });
                }
            });
        }else{
            qqShareImg(bean.getImageUrl());
        }

    }

    public void qqGetUserInfor() {
        mTencent.setOpenId(mTencent.getOpenId());
        UserInfo mInfo = new UserInfo(this, mTencent.getQQToken());
        mInfo.getUserInfo(new IUiListener() {
            @Override
            public void onComplete(Object o) {
                WritableMap map = Arguments.createMap();
                map.putString("type", "QQLogin.Resp");
                map.putString("code","1");
                map.putString("msg","登录成功");
                map.putString("body",""+o);
                superModule.nativeSendToJs("SuperModel_Resp",map);
                finish();
            }

            @Override
            public void onError(UiError uiError) {
                WritableMap map = Arguments.createMap();
                map.putString("type", "QQLogin.Resp");
                map.putString("code","-1");
                map.putString("msg","登录错误"+uiError.errorMessage);
                map.putString("body","详细信息"+uiError.errorDetail);
                superModule.nativeSendToJs("SuperModel_Resp",map);
                finish();
            }

            @Override
            public void onCancel() {
                WritableMap map = Arguments.createMap();
                map.putString("type", "QQLogin.Resp");
                map.putString("code","-1");
                map.putString("msg","用户取消");
                map.putString("body","用户取消");
                superModule.nativeSendToJs("SuperModel_Resp",map);
                finish();
            }
        });
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        Tencent.onActivityResultData(requestCode, resultCode, data, this);
    }

    public void qqShareImg(String imgUrl) {
        final Bundle bundle = new Bundle();
        Utils.getNetworkImgUrlToSaveLocalFile(imgUrl, Utils.getSDCardPath() + "/ApinFile/DownLoadImg/", "2.jpg", new Handler(new Handler.Callback() {
            @Override
            public boolean handleMessage(Message msg) {
                Log.e("===", "选用默认的数值===下载成功");
                bundle.putInt(QQShare.SHARE_TO_QQ_KEY_TYPE, QQShare.SHARE_TO_QQ_TYPE_IMAGE);// 设置分享类型为纯图片分享
                bundle.putString(QQShare.SHARE_TO_QQ_IMAGE_LOCAL_URL, Utils.getSDCardPath() + "/ApinFile/DownLoadImg/" + "2.jpg");
                bundle.putString(QQShare.SHARE_TO_QQ_APP_NAME, "爱拼机");
                runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mTencent.shareToQQ(activity, bundle, new IUiListener() {
                            @Override
                            public void onCancel() {
                                WritableMap map = Arguments.createMap();
                                map.putString("type", "QQShareImg.Resp");
                                map.putString("code","-1");
                                map.putString("msg","用户取消");
                                map.putString("body","用户取消");
                                superModule.nativeSendToJs("SuperModel_Resp",map);
                                finish();
                            }

                            @Override
                            public void onComplete(Object response) {
                                WritableMap map = Arguments.createMap();
                                map.putString("type", "QQShareImg.Resp");
                                map.putString("code","1");
                                map.putString("msg","分享成功");
                                map.putString("body","分享成功");
                                superModule.nativeSendToJs("SuperModel_Resp",map);
                                finish();
                            }

                            @Override
                            public void onError(UiError e) {
                                WritableMap map = Arguments.createMap();
                                map.putString("type", "QQShareImg.Resp");
                                map.putString("code","-1");
                                map.putString("msg","分享失败");
                                map.putString("body","分享失败"+e.errorMessage);
                                superModule.nativeSendToJs("SuperModel_Resp",map);
                                finish();
                            }
                        });
                    }
                });

                return false;
            }
        }));
        return;

    }

    @Override
    public void onComplete(Object o) {
        initOpenidAndToken((JSONObject) o);
        qqGetUserInfor();
    }

    @Override
    public void onError(UiError uiError) {
        WritableMap map = Arguments.createMap();
        map.putString("type", "QQLogin.Resp");
        map.putString("code","-1");
        map.putString("msg","登录错误"+uiError.errorMessage);
        map.putString("body","详细信息"+uiError.errorDetail);
        superModule.nativeSendToJs("SuperModel_Resp",map);
        finish();
    }

    @Override
    public void onCancel() {
        WritableMap map = Arguments.createMap();
        map.putString("type", "QQLogin.Resp");
        map.putString("code","-1");
        map.putString("msg","用户取消");
        map.putString("body","用户取消");
        superModule.nativeSendToJs("SuperModel_Resp",map);
        finish();
    }

    public void initOpenidAndToken(JSONObject jsonObject) {
        try {
            String token = jsonObject.getString(com.tencent.connect.common.Constants.PARAM_ACCESS_TOKEN);
            String expires = jsonObject.getString(com.tencent.connect.common.Constants.PARAM_EXPIRES_IN);
            String openId = jsonObject.getString(com.tencent.connect.common.Constants.PARAM_OPEN_ID);
            if (!TextUtils.isEmpty(token) && !TextUtils.isEmpty(expires) && !TextUtils.isEmpty(openId)) {
                mTencent.setAccessToken(token, expires);
                mTencent.setOpenId(openId);
            }
        } catch (Exception e) {
        }
    }

    public String getTencent(Tencent mTencent) {
        JSONObject jsonObject = new JSONObject();
        String str = "";
        try {
            jsonObject.put("name", "QQ");
            jsonObject.put("AccessToken", mTencent.getAccessToken());
            jsonObject.put("OpenId", mTencent.getOpenId());
            str = jsonObject.toString();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return str;
    }
}
