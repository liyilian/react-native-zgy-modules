package xyz.soyouarehere.superlibrary;

import android.content.Context;
import android.content.pm.ApplicationInfo;
import android.content.pm.PackageInfo;
import android.content.pm.PackageManager;
import android.graphics.Bitmap;
import android.graphics.BitmapFactory;
import android.os.Environment;
import android.os.Handler;
import android.os.Message;

import com.facebook.react.bridge.Arguments;
import com.facebook.react.bridge.WritableMap;

import org.json.JSONException;
import org.json.JSONObject;

import java.io.File;
import java.io.FileOutputStream;
import java.io.IOException;
import java.io.InputStream;
import java.net.HttpURLConnection;
import java.net.URL;
import java.util.HashMap;
import java.util.List;
import java.util.Map;

/**
 * Created by Administrator on 2017/7/3.
 *
 * 解析工具类
 */

public class Utils {

    public static boolean isWeixinAvilible(Context context) {
        final PackageManager packageManager = context.getPackageManager();// 获取packagemanager
        List<PackageInfo> pinfo = packageManager.getInstalledPackages(0);// 获取所有已安装程序的包信息
        if (pinfo != null) {
            for (int i = 0; i < pinfo.size(); i++) {
                String pn = pinfo.get(i).packageName;
                if (pn.equals("com.tencent.mm")) {
                    return true;
                }
            }
        }

        return false;
    }
    /**
     * 判断qq是否可用
     *
     * @param context
     * @return
     */
    public static boolean isQQClientAvailable(Context context) {
        final PackageManager packageManager = context.getPackageManager();
        List<PackageInfo> pinfo = packageManager.getInstalledPackages(0);
        if (pinfo != null) {
            for (int i = 0; i < pinfo.size(); i++) {
                String pn = pinfo.get(i).packageName;
                if (pn.equals("com.tencent.mobileqq")) {
                    return true;
                }
            }
        }
        return false;
    }

    public static boolean isWeiBoClientAvailable(Context context) {
        final PackageManager packageManager = context.getPackageManager();
        List<PackageInfo> pinfo = packageManager.getInstalledPackages(0);
        if (pinfo != null) {
            for (int i = 0; i < pinfo.size(); i++) {
                String pn = pinfo.get(i).packageName;
                if (pn.equals("com.sina.weibo")) {
                    return true;
                }
            }
        }
        return false;
    }
    /**
     * 判断当前应用是否是debug状态
     */

    public static boolean isApkInDebug(Context context) {
        try {
            ApplicationInfo info = context.getApplicationInfo();
            return (info.flags & ApplicationInfo.FLAG_DEBUGGABLE) != 0;
        } catch (Exception e) {
            return false;
        }
    }
    public static void getNetworkImgUrlToSaveLocalFile(final String imgUrl, final String imgFilePath, final String imgName, final Handler handler) {
        new Thread(new Runnable() {
            @Override
            public void run() {
                URL url = null;
                InputStream is = null;
                FileOutputStream fos = null;
                Bitmap bitmap = null;
                try {
                    url = new URL(imgUrl);
                    HttpURLConnection httpURLConnection = (HttpURLConnection) url.openConnection();
                    File file = new File(imgFilePath);
                    if (!file.exists()){
                        file.mkdirs();
                    }
                    File ImgFile = new File(file,imgName);
                    if (!ImgFile.exists()){
                        ImgFile.createNewFile();
                    }

                    File file1 = new File(imgFilePath+imgName);
                    if (!file1.exists()){
                        file1.getParentFile().mkdirs();
                        file1.createNewFile();
                    }
                    fos = new FileOutputStream(file1);
                    if (httpURLConnection.getResponseCode() == 200) {
                        is = httpURLConnection.getInputStream();
                        byte[] bytes = new byte[1024];
                        int len = 0;
                        while ((len = is.read(bytes)) != -1) {
                            fos.write(bytes, 0, len);
                        }
                        fos.flush();
                        Message message = new Message();
                        message.what=300;
                        handler.sendMessage(message);
                    }
                } catch (Exception e) {
                    e.printStackTrace();
                } finally {
                    try {
                        if (is!=null){
                            is.close();
                        }
                    } catch (IOException e) {
                        e.printStackTrace();
                    }
                }
            }
        }).start();
    }
    /**
     * 获取SDCard的目录路径功能
     *
     * @return
     */
    public static String getSDCardPath() {
        File sdcardDir = null;
        //判断SDCard是否存在
        boolean sdcardExist = Environment.getExternalStorageState().equals(Environment.MEDIA_MOUNTED);
        if (sdcardExist) {
            sdcardDir = Environment.getExternalStorageDirectory();
        }
        return sdcardDir.toString();
    }



    /** 获得与需要的比例最接近的比例 */
    static int calculateInSampleSize(BitmapFactory.Options bitmapOptions, int reqWidth, int reqHeight) {
        final int height = bitmapOptions.outHeight;
        final int width = bitmapOptions.outWidth;
        int sampleSize = 1;
        if (height > reqHeight || width > reqWidth) {
            final int heightRatio = Math.round((float) height / (float) reqHeight);
            final int widthRatio = Math.round((float) width / (float) reqWidth);
            sampleSize = heightRatio < widthRatio ? heightRatio : widthRatio;
        }
        return sampleSize;
    }

    public static Bitmap decodeImage(String filePath) {
        /** Decode image size */
        BitmapFactory.Options o = new BitmapFactory.Options();
        /** 只取宽高防止oom */
        o.inJustDecodeBounds = true;
        BitmapFactory.decodeFile(filePath, o);
//        int scale=calculateInSampleSize(o, displayStats.maxItemWidthHeight, displayStats.maxItemWidthHeight);
        BitmapFactory.Options options=new BitmapFactory.Options();
        /** Decode with inSampleSize，比直接算出options中的使用更少的内存*/
        options.inSampleSize=2;
        /** 内存不足的时候可被擦除 */
        options.inPurgeable = true;
        /** 深拷贝 */
        options.inInputShareable = true;
        Bitmap result = BitmapFactory.decodeFile(filePath, options);
        return result;
    }

    public static WritableMap returnResponse(String code, String msg, String body){
        WritableMap resp = Arguments.createMap();
        resp.putString("code",code);
        resp.putString("msg",msg);
        resp.putString("body",body);
        return resp;
    }

    public static Map<String,String> getShareData(String data){
        Map<String,String> shareMap = new HashMap<>();
        try {
            JSONObject jsonObject = new JSONObject(data);
            shareMap.put("TITLE",jsonObject.optString("title"));
            shareMap.put("SUMMARY",jsonObject.optString("description"));
            shareMap.put("TARGET_URL",jsonObject.optString("webpageUrl"));
            shareMap.put("IMAGE_URL",jsonObject.optString("imageUrl"));
            shareMap.put("type",jsonObject.optString("type"));
        } catch (JSONException e) {
            e.printStackTrace();
        }
        return shareMap;
    }

}
