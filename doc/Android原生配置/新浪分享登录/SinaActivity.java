package com.android.apin;

import android.app.Activity;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.support.annotation.Nullable;
import android.util.Log;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;
import com.sina.weibo.sdk.WbSdk;
import com.sina.weibo.sdk.api.ImageObject;
import com.sina.weibo.sdk.api.TextObject;
import com.sina.weibo.sdk.api.WebpageObject;
import com.sina.weibo.sdk.api.WeiboMultiMessage;
import com.sina.weibo.sdk.auth.AccessTokenKeeper;
import com.sina.weibo.sdk.auth.AuthInfo;
import com.sina.weibo.sdk.auth.Oauth2AccessToken;
import com.sina.weibo.sdk.auth.WbAuthListener;
import com.sina.weibo.sdk.auth.WbConnectErrorMessage;
import com.sina.weibo.sdk.auth.sso.SsoHandler;
import com.sina.weibo.sdk.share.WbShareCallback;
import com.sina.weibo.sdk.share.WbShareHandler;
import com.sina.weibo.sdk.utils.Utility;


import org.json.JSONException;
import org.json.JSONObject;

import java.util.Map;

import xyz.soyouarehere.superlibrary.ShareBean;
import xyz.soyouarehere.superlibrary.Utils;

import static xyz.soyouarehere.superlibrary.SuperModule.superModule;

/**
 * Created by Administrator on 2017/12/7.
 */

public class SinaActivity extends Activity implements WbShareCallback {
    private WbShareHandler shareHandler;
    SinaActivity context;

    //微博登录
    SsoHandler mSsoHandler;
    /**
     * 新浪请求接口
     *
     * @author Administrator
     */
    private Oauth2AccessToken mAccessToken;
    public static final String APP_KEY = "3448287776";        // 应用的APP_KEY
    public static final String REDIRECT_URL = "https://api.weibo.com/oauth2/default.html";// 应用的回调页
    public static final String SCOPE =                            // 应用申请的高级权限
            "email,direct_messages_read,direct_messages_write,"
                    + "friendships_groups_read,friendships_groups_write,statuses_to_me_read,"
                    + "follow_app_official_microblog," + "invitation_write";
    ShareBean bean;
    @Override
    protected void onCreate(@Nullable Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        context = this;
        WbSdk.install(this, new AuthInfo(this, APP_KEY, REDIRECT_URL, SCOPE));
        shareHandler = new WbShareHandler(this);
        shareHandler.registerApp();
        mSsoHandler = new SsoHandler(this);
        if (getIntent().getStringExtra("SinaType").equals("login")) {
            sinaLogin();
        } else {
            bean = (ShareBean) getIntent().getSerializableExtra("ShareBean");
            Oauth2AccessToken mAccessTokens = AccessTokenKeeper.readAccessToken(this);
            if (mAccessTokens.isSessionValid()) {
                _sinaShare();
            } else {
                sinaLoginThenShare();
            }
        }

    }

    @Override
    protected void onNewIntent(Intent intent) {
        super.onNewIntent(intent);
        shareHandler.doResultIntent(intent, this);
    }

    @Override
    protected void onActivityResult(int requestCode, int resultCode, Intent data) {
        super.onActivityResult(requestCode, resultCode, data);
        if (mSsoHandler != null) {
            mSsoHandler.authorizeCallBack(requestCode, resultCode, data);
        }
    }


    public void _sinaShare() {
            final WeiboMultiMessage weiboMessage = new WeiboMultiMessage();
            weiboMessage.textObject = getTextObj(bean);
            weiboMessage.mediaObject = getWebpageObj(bean);
            if (bean.getImageUrl() != "" || bean.getImageUrl() != null) {
                Utils.getNetworkImgUrlToSaveLocalFile(bean.getImageUrl(), Utils.getSDCardPath() + "/ApinFile/DownLoadImg/", "2.jpg", new Handler(new Handler.Callback() {
                    @Override
                    public boolean handleMessage(Message msg) {
                        runOnUiThread(new Runnable() {
                            @Override
                            public void run() {
                                weiboMessage.imageObject = getSinaShareImageObj(Utils.getSDCardPath() + "/ApinFile/DownLoadImg/" + "2.jpg");
                                shareHandler.shareMessage(weiboMessage, false);
                            }
                        });
                        return false;
                    }
                }));
            }else {
                shareHandler.shareMessage(weiboMessage, false);
            }
    }

    private void sinaLoginThenShare() {
        mSsoHandler.authorize(new WbAuthListener() {
            @Override
            public void onSuccess(final Oauth2AccessToken oauth2AccessToken) {
                Log.e("====", "===新浪微博授权成功");
                context.runOnUiThread(new Runnable() {
                    @Override
                    public void run() {
                        mAccessToken = oauth2AccessToken;
                        AccessTokenKeeper.writeAccessToken(context, mAccessToken);
                        _sinaShare();
                    }
                });
            }

            @Override
            public void cancel() {
                WritableMap map = Arguments.createMap();
                map.putString("type", "SinaShare.Resp");
                map.putString("code", "-1");
                map.putString("msg", "用户取消");
                map.putString("body", "用户取消");
                superModule.nativeSendToJs("SuperModel_Resp", map);
                finish();
            }

            @Override
            public void onFailure(WbConnectErrorMessage wbConnectErrorMessage) {
                WritableMap map = Arguments.createMap();
                map.putString("type", "SinaShare.Resp");
                map.putString("code", "-1");
                map.putString("msg", "分享失败");
                map.putString("body", "分享失败" + wbConnectErrorMessage.getErrorMessage());
                superModule.nativeSendToJs("SuperModel_Resp", map);
                finish();
            }
        });
    }

    /**
     * 创建图片消息对象。
     *
     * @return 图片消息对象。
     */
    public static ImageObject getSinaShareImageObj(String path) {
        ImageObject imageObject = new ImageObject();
        Bitmap bitmap1 = Utils.decodeImage(path);
        imageObject.setImageObject(bitmap1);
        return imageObject;
    }
    private void sinaLogin() {
        mSsoHandler.authorize(wbAuthListener);
    }

    WbAuthListener wbAuthListener = new WbAuthListener() {
        @Override
        public void onSuccess(final Oauth2AccessToken oauth2AccessToken) {
            Log.e("====", "===新浪微博授权成功");
            context.runOnUiThread(new Runnable() {
                @Override
                public void run() {
                    mAccessToken = oauth2AccessToken;
                    AccessTokenKeeper.writeAccessToken(context, mAccessToken);
                    WritableMap map = Arguments.createMap();
                    map.putString("type", "SinaLogin.Resp");
                    map.putString("code", "1");
                    map.putString("msg", "登录成功");
                    map.putString("body", getSinaTokenOpenId(mAccessToken));
                    superModule.nativeSendToJs("SuperModel_Resp", map);
                    finish();
                }
            });
        }

        @Override
        public void cancel() {
            WritableMap map = Arguments.createMap();
            map.putString("type", "SinaLogin.Resp");
            map.putString("code", "-1");
            map.putString("msg", "用户取消");
            map.putString("body", "用户取消");
            superModule.nativeSendToJs("SuperModel_Resp", map);
            finish();
        }

        @Override
        public void onFailure(WbConnectErrorMessage wbConnectErrorMessage) {
            WritableMap map = Arguments.createMap();
            map.putString("type", "SinaLogin.Resp");
            map.putString("code", "-1");
            map.putString("msg", "分享失败");
            map.putString("body", "分享失败" + wbConnectErrorMessage.getErrorMessage());
            superModule.nativeSendToJs("SuperModel_Resp", map);
            finish();
        }
    };

    @Override
    public void onWbShareSuccess() {
        WritableMap map = Arguments.createMap();
        map.putString("type", "SinaShare.Resp");
        map.putString("code", "1");
        map.putString("msg", "分享成功");
        map.putString("body", "分享成功");
        superModule.nativeSendToJs("SuperModel_Resp", map);
        finish();
    }

    @Override
    public void onWbShareCancel() {
        WritableMap map = Arguments.createMap();
        map.putString("type", "SinaShare.Resp");
        map.putString("code", "-1");
        map.putString("msg", "用户取消");
        map.putString("body", "用户取消");
        superModule.nativeSendToJs("SuperModel_Resp", map);
        finish();
    }

    @Override
    public void onWbShareFail() {
        WritableMap map = Arguments.createMap();
        map.putString("type", "SinaShare.Resp");
        map.putString("code", "-1");
        map.putString("msg", "分享失败");
        map.putString("body", "分享失败");
        superModule.nativeSendToJs("SuperModel_Resp", map);
        finish();
    }


    /**
     * 创建文本消息对象。
     *
     * @return 文本消息对象。
     */
    public static TextObject getTextObj(ShareBean bean) {
        TextObject textObject = new TextObject();
        textObject.text = bean.getDescription()+"   "+bean.getWebpageUrl();
        textObject.title = bean.getTitle();
        textObject.actionUrl = bean.getWebpageUrl();
        return textObject;
    }

    /**
     * 创建多媒体（网页）消息对象。
     *
     * @return 多媒体（网页）消息对象。
     */
    public static WebpageObject getWebpageObj(ShareBean bean) {
        WebpageObject mediaObject = new WebpageObject();
        mediaObject.identify = Utility.generateGUID();
        mediaObject.title = bean.getTitle();
        mediaObject.description = bean.getDescription()+"   "+bean.getWebpageUrl();
        mediaObject.actionUrl = bean.getWebpageUrl();
        mediaObject.defaultText = "爱拼机分享";
        return mediaObject;
    }

    public String getSinaTokenOpenId(Oauth2AccessToken mAccessToken) {
        JSONObject jsonObject = new JSONObject();
        String str = "";
        try {
            jsonObject.put("AccessToken", mAccessToken.getToken());
            jsonObject.put("OpenId", mAccessToken.getUid());
            str = jsonObject.toString();
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return str;
    }
}
