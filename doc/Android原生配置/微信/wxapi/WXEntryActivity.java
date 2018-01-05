package com.android.apin.wxapi;

import android.app.Activity;
import android.os.Bundle;

import xyz.soyouarehere.superlibrary.SuperModule;

/**
 * Created by Administrator on 2017/12/6.
 */

public class WXEntryActivity extends Activity{
    @Override
    protected void onCreate(Bundle savedInstanceState) {
        super.onCreate(savedInstanceState);
        SuperModule.handleIntent(getIntent());
        finish();
    }

}
