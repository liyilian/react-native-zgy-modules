package xyz.soyouarehere.superlibrary;
import android.app.Activity;
import android.os.Bundle;
import android.os.Handler;
import android.os.Message;
import android.os.Parcelable;
import android.text.TextUtils;
import android.util.Log;
import android.widget.Toast;
import android.content.Context;
import android.content.Intent;
import android.graphics.Bitmap;
import android.net.Uri;
import android.support.annotation.Nullable;

import com.alipay.sdk.app.PayTask;
import com.facebook.common.executors.UiThreadImmediateExecutorService;
import com.facebook.common.references.CloseableReference;
import com.facebook.common.util.UriUtil;
import com.facebook.datasource.DataSource;
import com.facebook.drawee.backends.pipeline.Fresco;
import com.facebook.imagepipeline.common.ResizeOptions;
import com.facebook.imagepipeline.core.ImagePipeline;
import com.facebook.imagepipeline.datasource.BaseBitmapDataSubscriber;
import com.facebook.imagepipeline.image.CloseableImage;
import com.facebook.imagepipeline.request.ImageRequest;
import com.facebook.imagepipeline.request.ImageRequestBuilder;
import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.Callback;
import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.facebook.react.bridge.ReadableMap;
import com.facebook.react.bridge.WritableMap;
import com.facebook.react.modules.core.DeviceEventManagerModule;
import com.tencent.connect.UserInfo;
import com.tencent.mm.sdk.modelbase.BaseReq;
import com.tencent.mm.sdk.modelbase.BaseResp;
import com.tencent.mm.sdk.modelmsg.SendAuth;
import com.tencent.mm.sdk.modelmsg.SendMessageToWX;
import com.tencent.mm.sdk.modelmsg.WXFileObject;
import com.tencent.mm.sdk.modelmsg.WXImageObject;
import com.tencent.mm.sdk.modelmsg.WXMediaMessage;
import com.tencent.mm.sdk.modelmsg.WXMusicObject;
import com.tencent.mm.sdk.modelmsg.WXTextObject;
import com.tencent.mm.sdk.modelmsg.WXVideoObject;
import com.tencent.mm.sdk.modelmsg.WXWebpageObject;
import com.tencent.mm.sdk.modelpay.PayReq;
import com.tencent.mm.sdk.modelpay.PayResp;
import com.tencent.mm.sdk.openapi.IWXAPI;
import com.tencent.mm.sdk.openapi.IWXAPIEventHandler;
import com.tencent.mm.sdk.openapi.WXAPIFactory;
import com.tencent.tauth.IUiListener;
import com.tencent.tauth.Tencent;
import com.tencent.tauth.UiError;

import org.json.JSONObject;
import java.util.ArrayList;
import java.util.HashMap;
import java.util.Map;
import java.util.UUID;
/**
 * Created by Administrator on 2017/11/29.
 */

public class SuperModule extends ReactContextBaseJavaModule implements IWXAPIEventHandler {
    private String appId;
    private IWXAPI api = null;
    private final static String NOT_REGISTERED = "registerApp required.";
    private final static String INVOKE_FAILED = "WeChat API invoke returns false.";
    private final static String INVALID_ARGUMENT = "invalid argument.";
    public static SuperModule superModule ;
    public SuperModule(ReactApplicationContext reactContext) {
        super(reactContext);
        superModule = this;
    }

    @Override
    public String getName() {
        return "SuperModule";
    }

    @ReactMethod
    public void showDialog(String str){
        Toast.makeText(this.getReactApplicationContext().getCurrentActivity(),""+str,Toast.LENGTH_LONG).show();
    }

   /**
       * fix Native module SuperModule tried to override SuperModule for module name RCTWeChat.
       * If this was your intention, return true from SuperModule#canOverrideExistingModule() bug
       * @return
       */
      public boolean canOverrideExistingModule(){
          return true;
      }

      private static ArrayList<SuperModule> modules = new ArrayList<>();

      @Override
      public void initialize() {
          super.initialize();
          modules.add(this);
      }

      @Override
      public void onCatalystInstanceDestroy() {
          super.onCatalystInstanceDestroy();
          if (api != null) {
              api = null;
          }
          modules.remove(this);
      }

      public static void handleIntent(Intent intent) {
          for (SuperModule mod : modules) {
              mod.api.handleIntent(intent, mod);
          }
      }

      @ReactMethod
      public void registerApp(String appid, Callback callback) {
          this.appId = appid;
          api = WXAPIFactory.createWXAPI(this.getReactApplicationContext().getBaseContext(), appid, true);
          callback.invoke(null, api.registerApp(appid));
      }

      @ReactMethod
      public void isWXAppInstalled(Callback callback) {
          if (api == null) {
              callback.invoke(NOT_REGISTERED);
              return;
          }
          callback.invoke(null, api.isWXAppInstalled());
      }

      @ReactMethod
      public void isWXAppSupportApi(Callback callback) {
          if (api == null) {
              callback.invoke(NOT_REGISTERED);
              return;
          }
          callback.invoke(null, api.isWXAppSupportAPI());
      }

      @ReactMethod
      public void getApiVersion(Callback callback) {
          if (api == null) {
              callback.invoke(NOT_REGISTERED);
              return;
          }
          callback.invoke(null, api.getWXAppSupportAPI());
      }

      @ReactMethod
      public void openWXApp(Callback callback) {
          if (api == null) {
              callback.invoke(NOT_REGISTERED);
              return;
          }
          callback.invoke(null, api.openWXApp());
      }

      @ReactMethod
      public void sendAuthRequest(String scope, String state, Callback callback) {
          if (api == null) {
              callback.invoke(NOT_REGISTERED);
              return;
          }
          SendAuth.Req req = new SendAuth.Req();
          req.scope = scope;
          req.state = state;
          callback.invoke(null, api.sendReq(req));
      }

      @ReactMethod
      public void shareToTimeline(ReadableMap data, Callback callback) {
          if (api == null) {
              callback.invoke(NOT_REGISTERED);
              return;
          }
          _share(SendMessageToWX.Req.WXSceneTimeline, data, callback);
      }

      @ReactMethod
      public void shareToSession(ReadableMap data, Callback callback) {
          if (api == null) {
              callback.invoke(NOT_REGISTERED);
              return;
          }
          _share(SendMessageToWX.Req.WXSceneSession, data, callback);
      }

      @ReactMethod
      public void pay(ReadableMap data, Callback callback){
          PayReq payReq = new PayReq();
          if (data.hasKey("partnerId")) {
              payReq.partnerId = data.getString("partnerId");
          }
          if (data.hasKey("prepayId")) {
              payReq.prepayId = data.getString("prepayId");
          }
          if (data.hasKey("nonceStr")) {
              payReq.nonceStr = data.getString("nonceStr");
          }
          if (data.hasKey("timeStamp")) {
              payReq.timeStamp = data.getString("timeStamp");
          }
          if (data.hasKey("sign")) {
              payReq.sign = data.getString("sign");
          }
          if (data.hasKey("package")) {
              payReq.packageValue = data.getString("package");
          }
          if (data.hasKey("extData")) {
              payReq.extData = data.getString("extData");
          }
          payReq.appId = appId;
          callback.invoke(api.sendReq(payReq) ? null : INVOKE_FAILED);
      }

      private void _share(final int scene, final ReadableMap data, final Callback callback) {
          Uri uri = null;
          if (data.hasKey("imageUrl")) {
              String imageUrl = data.getString("imageUrl");
              try {
                  uri = Uri.parse(imageUrl);
                  // Verify scheme is set, so that relative uri (used by static resources) are not handled.
                  if (uri.getScheme() == null) {
                      uri = getResourceDrawableUri(getReactApplicationContext(), imageUrl);
                  }
              } catch (Exception e) {
                  // ignore malformed uri, then attempt to extract resource ID.
              }
          }

          if (uri != null) {
              this._getImage(uri, new ResizeOptions(100, 100), new ImageCallback() {
                  @Override
                  public void invoke(@Nullable Bitmap bitmap) {
                      SuperModule.this._share(scene, data, bitmap, callback);
                  }
              });
          } else {
              this._share(scene, data, null, callback);
          }
      }

      private void _getImage(Uri uri, ResizeOptions resizeOptions, final ImageCallback imageCallback) {
          BaseBitmapDataSubscriber dataSubscriber = new BaseBitmapDataSubscriber() {
              @Override
              protected void onNewResultImpl(Bitmap bitmap) {
                  bitmap = bitmap.copy(bitmap.getConfig(), true);
                  imageCallback.invoke(bitmap);
              }

              @Override
              protected void onFailureImpl(DataSource<CloseableReference<CloseableImage>> dataSource) {
                  imageCallback.invoke(null);
              }
          };

          ImageRequestBuilder builder = ImageRequestBuilder.newBuilderWithSource(uri);
          if (resizeOptions != null) {
              builder = builder.setResizeOptions(resizeOptions);
          }
          ImageRequest imageRequest = builder.build();

          ImagePipeline imagePipeline = Fresco.getImagePipeline();
          DataSource<CloseableReference<CloseableImage>> dataSource = imagePipeline.fetchDecodedImage(imageRequest, null);
          dataSource.subscribe(dataSubscriber, UiThreadImmediateExecutorService.getInstance());
      }

      private static Uri getResourceDrawableUri(Context context, String name) {
          if (name == null || name.isEmpty()) {
              return null;
          }
          name = name.toLowerCase().replace("-", "_");
          int resId = context.getResources().getIdentifier(
                  name,
                  "drawable",
                  context.getPackageName());

          if (resId == 0) {
              return null;
          } else {
              return new Uri.Builder()
                      .scheme(UriUtil.LOCAL_RESOURCE_SCHEME)
                      .path(String.valueOf(resId))
                      .build();
          }
      }

      private void _share(final int scene, final ReadableMap data, final Bitmap thumbImage, final Callback callback) {
          if (!data.hasKey("type")) {
              callback.invoke(INVALID_ARGUMENT);
              return;
          }
          String type = data.getString("type");

          WXMediaMessage.IMediaObject mediaObject = null;
          if (type.equals("news")) {
              mediaObject = _jsonToWebpageMedia(data);
          } else if (type.equals("text")) {
              mediaObject = _jsonToTextMedia(data);
          } else if (type.equals("imageUrl") || type.equals("imageResource")) {
              __jsonToImageUrlMedia(data, new MediaObjectCallback() {
                  @Override
                  public void invoke(@Nullable WXMediaMessage.IMediaObject mediaObject) {
                      if (mediaObject == null) {
                          callback.invoke(INVALID_ARGUMENT);
                      } else {
                          SuperModule.this._share(scene, data, thumbImage, mediaObject, callback);
                      }
                  }
              });
              return;
          } else if (type.equals("imageFile")) {
              final WXMediaMessage.IMediaObject finalMediaObject = mediaObject;
              Utils.getNetworkImgUrlToSaveLocalFile(data.getString("imageUrl"),Utils.getSDCardPath() + "/ApinFile/DownLoadImg/", "2.jpg",new Handler(new Handler.Callback() {
                  @Override
                  public boolean handleMessage(Message msg) {
                      String path = Utils.getSDCardPath() + "/ApinFile/DownLoadImg/2.jpg";
                      Bitmap bitmap1 = Utils.decodeImage(path);
                      SuperModule.this._share(scene, data, thumbImage, new WXImageObject(bitmap1), callback);
                      return false;
                  }
              }));
              return;
          } else if (type.equals("video")) {
              mediaObject = __jsonToVideoMedia(data);
          } else if (type.equals("audio")) {
              mediaObject = __jsonToMusicMedia(data);
          } else if (type.equals("file")) {
              mediaObject = __jsonToFileMedia(data);
          }

          if (mediaObject == null) {
              callback.invoke(INVALID_ARGUMENT);
          } else {
              _share(scene, data, thumbImage, mediaObject, callback);
          }
      }

      private void _share(int scene, ReadableMap data, Bitmap thumbImage, WXMediaMessage.IMediaObject mediaObject, Callback callback) {

          WXMediaMessage message = new WXMediaMessage();
          message.mediaObject = mediaObject;

          if (thumbImage != null) {
              message.setThumbImage(thumbImage);
          }

          if (data.hasKey("title")) {
              message.title = data.getString("title");
          }
          if (data.hasKey("description")) {
              message.description = data.getString("description");
          }
          if (data.hasKey("mediaTagName")) {
              message.mediaTagName = data.getString("mediaTagName");
          }
          if (data.hasKey("messageAction")) {
              message.messageAction = data.getString("messageAction");
          }
          if (data.hasKey("messageExt")) {
              message.messageExt = data.getString("messageExt");
          }

          SendMessageToWX.Req req = new SendMessageToWX.Req();
          req.message = message;
          req.scene = scene;
          req.transaction = UUID.randomUUID().toString();
          callback.invoke(null, api.sendReq(req));
      }

      private WXTextObject _jsonToTextMedia(ReadableMap data) {
          if (!data.hasKey("description")) {
              return null;
          }

          WXTextObject ret = new WXTextObject();
          ret.text = data.getString("description");
          return ret;
      }

      private WXWebpageObject _jsonToWebpageMedia(ReadableMap data) {
          if (!data.hasKey("webpageUrl")) {
              return null;
          }

          WXWebpageObject ret = new WXWebpageObject();
          ret.webpageUrl = data.getString("webpageUrl");
          if (data.hasKey("extInfo")) {
              ret.extInfo = data.getString("extInfo");
          }
          return ret;
      }

      private void __jsonToImageMedia(String imageUrl, final MediaObjectCallback callback) {
          Uri imageUri;
          try {
              imageUri = Uri.parse(imageUrl);
              // Verify scheme is set, so that relative uri (used by static resources) are not handled.
              if (imageUri.getScheme() == null) {
                  imageUri = getResourceDrawableUri(getReactApplicationContext(), imageUrl);
              }
          } catch (Exception e) {
              imageUri = null;
          }

          if (imageUri == null) {
              callback.invoke(null);
              return;
          }

          this._getImage(imageUri, null, new ImageCallback() {
              @Override
              public void invoke(@Nullable Bitmap bitmap) {
                  callback.invoke(bitmap == null ? null : new WXImageObject(bitmap));
              }
          });
      }

      private void __jsonToImageUrlMedia(ReadableMap data, MediaObjectCallback callback) {
          if (!data.hasKey("imageUrl")) {
              callback.invoke(null);
              return;
          }
          String imageUrl = data.getString("imageUrl");
          __jsonToImageMedia(imageUrl, callback);
      }

      private void __jsonToImageFileMedia(ReadableMap data, MediaObjectCallback callback) {
          if (!data.hasKey("imageUrl")) {
              callback.invoke(null);
              return;
          }

          String imageUrl = data.getString("imageUrl");
          if (!imageUrl.toLowerCase().startsWith("file://")) {
              imageUrl = "file://" + imageUrl;
          }
          __jsonToImageMedia(imageUrl, callback);
      }

      private WXMusicObject __jsonToMusicMedia(ReadableMap data) {
          if (!data.hasKey("musicUrl")) {
              return null;
          }

          WXMusicObject ret = new WXMusicObject();
          ret.musicUrl = data.getString("musicUrl");
          return ret;
      }

      private WXVideoObject __jsonToVideoMedia(ReadableMap data) {
          if (!data.hasKey("videoUrl")) {
              return null;
          }

          WXVideoObject ret = new WXVideoObject();
          ret.videoUrl = data.getString("videoUrl");
          return ret;
      }

      private WXFileObject __jsonToFileMedia(ReadableMap data) {
          if (!data.hasKey("filePath")) {
              return null;
          }
          return new WXFileObject(data.getString("filePath"));
      }

      // TODO: ??sendRequest?sendSuccessResponse?sendErrorCommonResponse?sendErrorUserCancelResponse

      @Override
      public void onReq(BaseReq baseReq) {

      }

      @Override
      public void onResp(BaseResp baseResp) {
          WritableMap map = Arguments.createMap();
          map.putInt("errCode", baseResp.errCode);
          map.putString("errStr", baseResp.errStr);
          map.putString("openId", baseResp.openId);
          map.putString("transaction", baseResp.transaction);

          if (baseResp instanceof SendAuth.Resp) {
              SendAuth.Resp resp = (SendAuth.Resp) (baseResp);

              map.putString("type", "SendAuth.Resp");
              map.putString("code", resp.code);
              map.putString("state", resp.state);
              map.putString("url", resp.url);
              map.putString("lang", resp.lang);
              map.putString("country", resp.country);
          } else if (baseResp instanceof SendMessageToWX.Resp) {
              SendMessageToWX.Resp resp = (SendMessageToWX.Resp) (baseResp);
              map.putString("type", "SendMessageToWX.Resp");
          } else if (baseResp instanceof PayResp) {
              PayResp resp = (PayResp) (baseResp);
              map.putString("type", "PayReq.Resp");
              map.putString("returnKey", resp.returnKey);
          }

          this.getReactApplicationContext().getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class).emit("SuperModel_Resp", map);
      }



    private interface ImageCallback {
          void invoke(@Nullable Bitmap bitmap);
      }

      private interface MediaObjectCallback {
          void invoke(@Nullable WXMediaMessage.IMediaObject mediaObject);
      }

      /*-----------------------------支付宝支付-------------------------------*/

      @ReactMethod
      public void aliPay(final String signData, final Callback callback){
        payV2(signData,callback);
      }

    public void payV2(final String orderInfo, final Callback callback){
        //支付宝沙箱android测试需要调用
        Runnable payRunnable = new Runnable() {
            @Override
            public void run() {
                PayTask alipay = new PayTask(getCurrentActivity());
                Map<String, String> result = alipay.payV2(orderInfo, true);
                PayResult payResult = new PayResult(result);
                String resultInfo = payResult.getResult();
                String resultStatus = payResult.getResultStatus();
                WritableMap map = Arguments.createMap();
                if (TextUtils.equals(resultStatus, "9000")) {
                    // 该笔订单是否真实支付成功，需要依赖服务端的异步通知。
                    map.putInt("code", 1);
                    map.putString("msg","支付成功");
                    map.putString("body",payResult.toString());
                    callback.invoke(map);
                } else {
                    // 该笔订单真实的支付结果，需要依赖服务端的异步通知。
                    map.putInt("code", -1);
                    map.putString("msg","支付失败");
                    map.putString("body",payResult.toString()+"resultInfo: "+resultInfo);
                    callback.invoke(map);
                }
            }
        };
        Thread payThread = new Thread(payRunnable);
        payThread.start();
    }


    public class PayResult{

        private String resultStatus;
        private String result;
        private String memo;

        public PayResult(Map<String, String> rawResult) {
            if (rawResult == null) {
                return;
            }

            for (String key : rawResult.keySet()) {
                if (TextUtils.equals(key, "resultStatus")) {
                    resultStatus = rawResult.get(key);
                } else if (TextUtils.equals(key, "response")) {
                    result = rawResult.get(key);
                } else if (TextUtils.equals(key, "memo")) {
                    memo = rawResult.get(key);
                }
            }
        }
        @Override
        public String toString() {
            return "resultStatus={" + resultStatus + "};memo={" + memo
                    + "};response={" + result + "}";
        }

        /**
         * @return the resultStatus
         */
        public String getResultStatus() {
            return resultStatus;
        }

        /**
         * @return the memo
         */
        public String getMemo() {
            return memo;
        }

        /**
         * @return the response
         */
        public String getResult() {
            return result;
        }
    }

    /*---------------------------------------QQ----------------------------------*/
    @ReactMethod
    public void qqLogin(final Callback qqEventCallback){
        Class mClass = null;
        try {
             mClass = Class.forName(getCurrentActivity().getPackageName()+".QQActivity");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            qqEventCallback.invoke(Utils.returnResponse("-1","找不到QQActivity","请按照文档集成QQSDK"));
            return;
        }
        if (Utils.isQQClientAvailable(this.getReactApplicationContext())){
            Intent intent = new Intent(getCurrentActivity(),mClass);
            intent.putExtra("QQType","login");
            getCurrentActivity().startActivity(intent);
        }else {
            qqEventCallback.invoke(Utils.returnResponse("-1","请安装最新版QQ","请安装最新版QQ"));
        }
    }

    @ReactMethod
    public void qqShare(ReadableMap data , final Callback qqEventCallback){
        Class mClass = null;
        try {
            mClass = Class.forName(getCurrentActivity().getPackageName()+".QQActivity");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            qqEventCallback.invoke(Utils.returnResponse("-1","找不到QQActivity","请按照文档集成QQSDK"));
            return;
        }
        if (Utils.isQQClientAvailable(this.getReactApplicationContext())){
            if (!data.hasKey("type")) {
                qqEventCallback.invoke(Utils.returnResponse("-1","分享失败","参数不合法，缺少type"));
                return;
            }
            if (data.getString("type").equals("news")){
                if (!data.hasKey("title")) {
                    qqEventCallback.invoke(Utils.returnResponse("-1","分享失败","参数不合法，缺少title"));
                    return;
                }
                if (!data.hasKey("webpageUrl")) {
                    qqEventCallback.invoke(Utils.returnResponse("-1","分享失败","参数不合法，缺少webpageUrl"));
                    return;
                }
            }else if (data.getString("type").equals("imageFile")){
                if (!data.hasKey("imageUrl")) {
                    qqEventCallback.invoke(Utils.returnResponse("-1","分享失败","参数不合法，缺少imageUrl"));
                    return;
                }
            }else {
                qqEventCallback.invoke(Utils.returnResponse("-1","分享失败","type 参数有误"));
            }
            ShareBean bean = new ShareBean.Builder()
                    .type(data.getString("type"))
                    .title(data.hasKey("data")?data.getString("title"):"")
                    .description(data.hasKey("description")?data.getString("description"):"")
                    .webpageUrl(data.hasKey("webpageUrl")?data.getString("webpageUrl"):"")
                    .imageUrl(data.hasKey("imageUrl")?data.getString("imageUrl"):"")
                    .builder();
            Intent intent = new Intent(getCurrentActivity(),mClass);
            intent.putExtra("ShareBean", bean);
            intent.putExtra("QQType","QQShare");
            getCurrentActivity().startActivity(intent);
        }else {
            qqEventCallback.invoke(Utils.returnResponse("-1","请安装最新版QQ","请安装最新版QQ"));
        }
    }
    /*--------------------------------新浪----------------------------------------------------------------*/
    @ReactMethod
    public void sinaLogin(final Callback sinaLoginCallback){
        Class mClass = null;
        try {
            mClass = Class.forName(getCurrentActivity().getPackageName()+".SinaActivity");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            sinaLoginCallback.invoke(Utils.returnResponse("-1","找不到SinaActivity","请按照文档集成新浪SDK"));
            return;
        }
        Intent intent = new Intent(getCurrentActivity(),mClass);
        intent.putExtra("SinaType","login");
        getCurrentActivity().startActivity(intent);
    }

    @ReactMethod
    public void sinaShare(ReadableMap data , final Callback sinaShareCallback){
        Class mClass = null;
        try {
            mClass = Class.forName(getCurrentActivity().getPackageName()+".SinaActivity");
        } catch (ClassNotFoundException e) {
            e.printStackTrace();
            sinaShareCallback.invoke(Utils.returnResponse("-1","找不到SinaActivity","请按照文档集成新浪SDK"));
            return;
        }
        if (!data.hasKey("type")) {
            sinaShareCallback.invoke(Utils.returnResponse("-1","参数不合法，缺少type","参数不合法，缺少type"));
            return;
        }
        if (!data.hasKey("title")) {
            sinaShareCallback.invoke(Utils.returnResponse("-1","参数不合法，缺少title","参数不合法，缺少title"));
            return;
        }

        ShareBean bean = new ShareBean.Builder()
                .type(data.getString("type"))
                .title(data.getString("title"))
                .description(data.hasKey("description")?data.getString("description"):"")
                .webpageUrl(data.hasKey("webpageUrl")?data.getString("webpageUrl"):"")
                .imageUrl(data.hasKey("imageUrl")?data.getString("imageUrl"):"")
                .builder();
        Intent intent = new Intent(getCurrentActivity(),mClass);
        intent.putExtra("SinaType","share");
        intent.putExtra("ShareBean",bean);
        getCurrentActivity().startActivity(intent);
    }
    public void nativeSendToJs(String listenString,WritableMap map){
        this.getReactApplicationContext()
                .getJSModule(DeviceEventManagerModule.RCTDeviceEventEmitter.class)
                .emit(listenString, map);
    }

}