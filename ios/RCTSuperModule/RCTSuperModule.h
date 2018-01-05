//
//  RCTSuperModule.h
//  RCTSuperModule
//
//  Created by 爱拼机 on 2017/12/8.
//  Copyright © 2017年 爱拼机. All rights reserved.
//

#import <Foundation/Foundation.h>

#if __has_include(<React/RCTBridgeModule.h>)
#import <React/RCTBridgeModule.h>
#elif __has_include("RCTBridgeModule.h")
#import "RCTBridgeModule.h"
#elif __has_include("React/RCTBridgeModule.h")
#import "React/RCTBridgeModule.h"
#endif

#if __has_include(<React/RCTBridge.h>)
#import <React/RCTBridge.h>
#elif __has_include("RCTBridge.h")
#import "RCTBridge.h"
#elif __has_include("React/RCTBridge.h")
#import "React/RCTBridge.h"
#endif

#import <UIKit/UIKit.h>
//微信
#import "WXApi.h"
//QQ
#import "TencentOAuth.h"
#import "QQApiInterface.h"
//微博
#import "WeiboSDK.h"
//支付宝
#import "AlipaySDK.h"

@interface RCTSuperModule : NSObject <RCTBridgeModule, WXApiDelegate,TencentSessionDelegate, WeiboSDKDelegate>
@property (nonatomic, strong) TencentOAuth *tencentOAuth;
+ (BOOL)handleOpenURL:(NSURL *)url;

@end

