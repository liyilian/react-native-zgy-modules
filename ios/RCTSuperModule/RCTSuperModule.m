//
//  RCTSuperModule.m
//  RCTSuperModule
//
//  Created by 爱拼机 on 2017/12/8.
//  Copyright © 2017年 爱拼机. All rights reserved.
//
#define kDefaultScope  @""
#define kDefaultRedirectUrl @"https://api.weibo.com/oauth2/default.html"
#import "RCTSuperModule.h"

static RCTResponseSenderBlock authCallback;
static RCTResponseSenderBlock shareCallback;
static RCTResponseSenderBlock payCallback;
static NSString *authStateString;
@implementation RCTSuperModule
@synthesize bridge = _bridge;
+ (BOOL)handleOpenURL:(NSURL *)url {
    if ([url.host isEqualToString:@"safepay"]) {
        //跳转支付宝钱包进行支付，处理支付结果
        [[AlipaySDK defaultService] processOrderWithPaymentResult:url standbyCallback:^(NSDictionary *resultDic) {
            NSLog(@"result = %@",resultDic);
            NSString *status = resultDic[@"resultStatus"];
            if ([status integerValue] == 9000) {
                NSDictionary *result = [self getResultWithCode:@"0" msg:@"支付成功" body:@"支付成功"];
                payCallback(@[ result ]);
            } else if([status integerValue] == 6001) {
                NSDictionary *result = [self getResultWithCode:@"-1" msg:@"用户取消" body:@"用户取消"];
                payCallback(@[ result ]);
            } else {
                NSDictionary *result = [self getResultWithCode:@"-1" msg:@"支付失败" body:@"支付失败"];
                payCallback(@[ result ]);
            }
        }];
    }
    RCTSuperModule *module = [[RCTSuperModule alloc] init];
    return [WXApi handleOpenURL:url delegate:module] || [TencentOAuth HandleOpenURL:url] || [QQApiInterface handleOpenURL:url delegate:module] || [WeiboSDK handleOpenURL:url delegate:module];
}

RCT_EXPORT_MODULE();
#pragma mark  判断是否安装微信
RCT_EXPORT_METHOD(isWeXinAppInstalled:(RCTResponseSenderBlock)callback)
{
    callback(@[[NSNull null], @([WXApi isWXAppInstalled])]);
}
#pragma mark  判断是否安装QQ
RCT_EXPORT_METHOD(isQQAppInstalled:(RCTResponseSenderBlock)callback)
{
    callback(@[[NSNull null], @([QQApiInterface isQQInstalled])]);
}

#pragma mark - 微信注册App
RCT_EXPORT_METHOD(registerWeChat
                  : (NSString *)appId
                  : (RCTResponseSenderBlock)callback) {
    BOOL appRegistered = NO;
    NSMutableDictionary *result = [NSMutableDictionary dictionaryWithCapacity:3];
    if (appId && appId.length > 0) {
        appRegistered = [WXApi registerApp:appId];
        [result setObject:[NSNumber numberWithBool:appRegistered]
                   forKey:@"appRegistered"];
        [result setObject:[NSNumber numberWithBool:[WXApi isWXAppInstalled]]
                   forKey:@"weixinAppInstalled"];
        [result setObject:[NSNumber numberWithBool:[WXApi isWXAppSupportApi]]
                   forKey:@"apiSupported"];
        callback(@[ result ]);
    }
}
+ (NSMutableDictionary *)getResultWithCode:(NSString *)code msg:(NSString *)msg body:(id)body {
    NSMutableDictionary *result = [NSMutableDictionary dictionaryWithCapacity:0];
    [result setObject:code forKey:@"code"];
    [result setObject:msg forKey:@"msg"];
    NSString *str = body;
    [result setObject:str forKey:@"body"];
    return result;
}
#pragma mark - 微信分享 分享好友
RCT_EXPORT_METHOD(shareToSession
                  :(NSDictionary *)config
                  : (RCTResponseSenderBlock)callback) {
    if(![WXApi isWXAppInstalled]) {
        NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"未安装微信" body:@"未安装微信"];
        callback(@[ result ]);
        return;
    }
    if (config != nil) {
        shareCallback = callback;
        if ([[config objectForKey:@"type"] isEqualToString:@"news"]) {
            if([[config objectForKey:@"title"] length] == 0 || ![config objectForKey:@"title"]) {
                NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 缺少title"];
                shareCallback(@[ result ]);
                return;
            }
            if([[config objectForKey:@"webpageUrl"] length] == 0 || ![config objectForKey:@"webpageUrl"]) {
                NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 缺少webpageUrl"];
                shareCallback(@[ result ]);
                return;
            }
            WXMediaMessage *message = [WXMediaMessage message];
            message.title = [config objectForKey:@"title"];
            if([config objectForKey:@"description"]) {
                message.description = [config objectForKey:@"description"];
            }
            NSString *thumbImage = [config objectForKey:@"imageUrl"];
            if (thumbImage && thumbImage.length > 0) {
                UIImage *image = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:thumbImage]]];
                [message setThumbImage:image];
            }
            WXWebpageObject *webpageObject = [WXWebpageObject object];
            NSString *webpageUrl = [config objectForKey:@"webpageUrl"];
            webpageObject.webpageUrl = webpageUrl;
            message.mediaObject = webpageObject;
            SendMessageToWXReq *req = [[SendMessageToWXReq alloc] init];
            req.bText = NO;
            req.message = message;
            req.scene = WXSceneSession;
            [WXApi sendReq:req];
        } else if ([[config objectForKey:@"type"] isEqualToString:@"imageFile"]) {
            if([[config objectForKey:@"imageUrl"] length] == 0 || ![config objectForKey:@"imageUrl"]) {
                NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 缺少imageUrl"];
                shareCallback(@[ result ]);
                return;
            }
            if([[NSData dataWithContentsOfURL:[NSURL URLWithString:[config objectForKey:@"imageUrl"]]] length]==0) {
                NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 imageUrl格式有误"];
                shareCallback(@[ result ]);
                return;
            }
            WXMediaMessage *message = [WXMediaMessage message];
            NSString *thumbImage = [config objectForKey:@"imageUrl"];
            if (thumbImage && thumbImage.length > 0) {
                UIImage *image = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:thumbImage]]];
                [message setThumbImage:image];
            }
            WXImageObject *imageObject = [WXImageObject object];
            imageObject.imageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:thumbImage]];
            message.mediaObject = imageObject;
            SendMessageToWXReq *req = [[SendMessageToWXReq alloc] init];
            req.bText = NO;
            req.message = message;
            req.scene = WXSceneSession;
            [WXApi sendReq:req];
        } else {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"type 参数有误" body:@"type 参数有误"];
            shareCallback(@[ result ]);
        }
        
    }
}
#pragma mark  微信分享 分享朋友圈
RCT_EXPORT_METHOD(shareToTimeline
                  :(NSDictionary *)config
                  : (RCTResponseSenderBlock)callback) {
    if(![WXApi isWXAppInstalled]) {
        NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"未安装微信" body:@"未安装微信"];
        callback(@[ result ]);
        return;
    }
    if (config != nil) {
        shareCallback = callback;
        if ([[config objectForKey:@"type"] isEqualToString:@"news"]) {
            if([[config objectForKey:@"title"] length] == 0 || ![config objectForKey:@"title"]) {
                NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 缺少title"];
                shareCallback(@[ result ]);
                return;
            }
            if([[config objectForKey:@"webpageUrl"] length] == 0 || ![config objectForKey:@"webpageUrl"]) {
                NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 缺少webpageUrl"];
                shareCallback(@[ result ]);
                return;
            }
            WXMediaMessage *message = [WXMediaMessage message];
            if([config objectForKey:@"title"]) {
                message.title = [config objectForKey:@"title"];
            }
            if([config objectForKey:@"description"]) {
                message.description = [config objectForKey:@"description"];
            }
            NSString *thumbImage = [config objectForKey:@"imageUrl"];
            if (thumbImage && thumbImage.length > 0) {
                UIImage *image = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:thumbImage]]];
                [message setThumbImage:image];
            }
            WXWebpageObject *webpageObject = [WXWebpageObject object];
            NSString *webpageUrl = [config objectForKey:@"webpageUrl"];
            if(webpageUrl && webpageUrl.length > 0){
                webpageObject.webpageUrl = webpageUrl;
                message.mediaObject = webpageObject;
            }
            SendMessageToWXReq *req = [[SendMessageToWXReq alloc] init];
            req.bText = NO;
            req.message = message;
            req.scene = WXSceneTimeline;
            [WXApi sendReq:req];
        } else if ([[config objectForKey:@"type"] isEqualToString:@"imageFile"]) {
            if([[config objectForKey:@"imageUrl"] length] == 0 || ![config objectForKey:@"imageUrl"]) {
                NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 缺少imageUrl"];
                shareCallback(@[ result ]);
                return;
            }
            if([[NSData dataWithContentsOfURL:[NSURL URLWithString:[config objectForKey:@"imageUrl"]]] length]==0) {
                NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 imageUrl格式有误"];
                shareCallback(@[ result ]);
                return;
            }
            WXMediaMessage *message = [WXMediaMessage message];
            NSString *thumbImage = [config objectForKey:@"imageUrl"];
            if (thumbImage && thumbImage.length > 0) {
                UIImage *image = [UIImage imageWithData:[NSData dataWithContentsOfURL:[NSURL URLWithString:thumbImage]]];
                [message setThumbImage:image];
            }
            WXImageObject *imageObject = [WXImageObject object];
            imageObject.imageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:thumbImage]];
            message.mediaObject = imageObject;
            SendMessageToWXReq *req = [[SendMessageToWXReq alloc] init];
            req.bText = NO;
            req.message = message;
            req.scene = WXSceneTimeline;
            [WXApi sendReq:req];
        } else {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"type 参数有误" body:@"type 参数有误"];
            shareCallback(@[ result ]);
        }
    }
}
#pragma mark - 微信授权登陆
RCT_EXPORT_METHOD(weChatLogin
                  : (RCTResponseSenderBlock)callback) {
    if(![WXApi isWXAppInstalled]) {
        NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"未安装微信" body:@"未安装微信"];
        callback(@[ result ]);
        return;
    }
    authCallback = callback;
    authStateString = [[NSUUID UUID] UUIDString];
    SendAuthReq *req = [[SendAuthReq alloc] init];
    req.scope = @"snsapi_userinfo";
    req.state = authStateString;
    [WXApi sendReq:req];
}
#pragma mark - 微信支付
RCT_EXPORT_METHOD(weChatPay
                  : (NSDictionary *)config
                  : (RCTResponseSenderBlock)callback) {
    if(![WXApi isWXAppInstalled]) {
        NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"未安装微信" body:@"未安装微信"];
        callback(@[ result ]);
        return;
    }
    payCallback = callback;
    if (config) {
        //调起微信支付
        PayReq *req = [[PayReq alloc] init];
        req.partnerId = [config objectForKey:@"partnerId"];
        req.prepayId = [config objectForKey:@"prepayId"];
        req.nonceStr = [config objectForKey:@"nonceStr"];
        req.timeStamp = [config objectForKey:@"timeStamp"];
        req.package = [config objectForKey:@"packageValue"];
        req.sign = [config objectForKey:@"sign"];
        [WXApi sendReq:req];
    }
}

#pragma mark - delegate

-(void) onReq:(id)req {
    if ([req isKindOfClass:[BaseReq class]])  {
        if([req isKindOfClass:[GetMessageFromWXReq class]]) {
            // 微信请求App提供内容， 需要app提供内容后使用sendRsp返回
            NSString *strTitle = [NSString stringWithFormat:@"微信请求App提供内容"];
            NSString *strMsg = @"微信请求App提供内容，App要调用sendResp:GetMessageFromWXResp返回给微信";
            
            UIAlertView *alert = [[UIAlertView alloc] initWithTitle:strTitle message:strMsg delegate:self cancelButtonTitle:@"OK" otherButtonTitles:nil, nil];
            alert.tag = 1000;
            [alert show];
        } else if([req isKindOfClass:[ShowMessageFromWXReq class]]) {
            ShowMessageFromWXReq* temp = (ShowMessageFromWXReq*)req;
            WXMediaMessage *msg = temp.message;
            
            //显示微信传过来的内容
            WXAppExtendObject *obj = msg.mediaObject;
            
            NSString *strTitle = [NSString stringWithFormat:@"微信请求App显示内容"];
            NSString *strMsg = [NSString stringWithFormat:@"标题：%@ \n内容：%@ \n附带信息：%@ \n缩略图:%lu bytes\n\n", msg.title, msg.description, obj.extInfo, (unsigned long)msg.thumbData.length];
            
            UIAlertView *alert = [[UIAlertView alloc] initWithTitle:strTitle message:strMsg delegate:self cancelButtonTitle:@"OK" otherButtonTitles:nil, nil];
            [alert show];
        } else if([req isKindOfClass:[LaunchFromWXReq class]]) {
            //从微信启动App
            NSString *strTitle = [NSString stringWithFormat:@"从微信启动"];
            NSString *strMsg = @"这是从微信启动的消息";
            
            UIAlertView *alert = [[UIAlertView alloc] initWithTitle:strTitle message:strMsg delegate:self cancelButtonTitle:@"OK" otherButtonTitles:nil, nil];
            [alert show];
        }
    } else if ([req isKindOfClass:[QQBaseReq class]]) {
        NSLog(@"%s",__FUNCTION__);
        NSLog(@"%@",@"接受req");
    }
    
}

-(void) onResp:(id)resp {
    if ([resp isKindOfClass:[BaseResp class]])  {
        BaseResp *wxResp = (BaseResp *)resp;
        //分享回调
        if ([resp isKindOfClass:[SendMessageToWXResp class]]) {
            if (wxResp.errCode == WXSuccess) {
                NSDictionary *result = [RCTSuperModule getResultWithCode:[NSString stringWithFormat:@"%d", wxResp.errCode] msg:@"分享成功" body:@"分享成功"];
                shareCallback(@[ result ]);
            } else if (wxResp.errCode == WXErrCodeUserCancel) {
                NSDictionary *result = [RCTSuperModule getResultWithCode:[NSString stringWithFormat:@"%d", wxResp.errCode] msg:@"用户取消" body:@"用户取消"];
                shareCallback(@[ result ]);
            } else {
                NSDictionary *result = [RCTSuperModule getResultWithCode:[NSString stringWithFormat:@"%d", wxResp.errCode] msg:@"分享失败" body:@"分享失败"];
                shareCallback(@[ result ]);
            }
        }
        //登录回调
        else if([resp isKindOfClass:[SendAuthResp class]]) {
            if (wxResp.errCode == WXSuccess) {
                SendAuthResp *authResp = (SendAuthResp *)resp;
                NSString *state = authResp.state;
                NSMutableDictionary *backResult =
                [[NSMutableDictionary alloc] initWithCapacity:0];
                if (authStateString != nil && [authStateString isEqualToString:state]) {
                    [backResult setValue:authResp.code forKey:@"code"];
                    [backResult setValue:state forKey:@"state"];
                    [backResult setValue:authResp.country forKey:@"country"];
                    [backResult setValue:authResp.lang forKey:@"lang"];
                }
                NSDictionary *result = [RCTSuperModule getResultWithCode:@"0" msg:@"登录成功" body:backResult];
                authCallback(@[ result ]);
            } else if (wxResp.errCode == WXErrCodeUserCancel) {
                NSDictionary *result = [RCTSuperModule getResultWithCode:[NSString stringWithFormat:@"%d", wxResp.errCode] msg:@"用户取消" body:@"用户取消"];
                authCallback(@[ result ]);
            } else {
                NSDictionary *result = [RCTSuperModule getResultWithCode:[NSString stringWithFormat:@"%d", wxResp.errCode] msg:@"登录失败" body:@"登录失败"];
                authCallback(@[ result ]);
            }
        }
        //支付回调
        else if ([resp isKindOfClass:[PayResp class]]) {
            if (wxResp.errCode == WXSuccess) {
                NSMutableDictionary *backResult =
                [[NSMutableDictionary alloc] initWithCapacity:0];
                PayResp *payResp = (PayResp *)resp;
                NSString *returnKey = payResp.returnKey;
                [backResult setValue:returnKey forKey:@"returnKey"];
                NSDictionary *result = [RCTSuperModule getResultWithCode:[NSString stringWithFormat:@"%d", wxResp.errCode] msg:@"支付成功" body:backResult];
                payCallback(@[ result ]);
            } else if (wxResp.errCode == WXErrCodeUserCancel) {
                NSDictionary *result = [RCTSuperModule getResultWithCode:[NSString stringWithFormat:@"%d", wxResp.errCode] msg:@"用户取消" body:@"用户取消"];
                payCallback(@[ result ]);
            } else {
                NSDictionary *result = [RCTSuperModule getResultWithCode:[NSString stringWithFormat:@"%d", wxResp.errCode] msg:@"支付失败" body:@"支付失败"];
                payCallback(@[ result ]);
            }
        }
    } else if ([resp isKindOfClass:[QQBaseResp class]]) {
        QQBaseResp * QQResp = (QQBaseResp *)resp;
        NSMutableDictionary *result = [NSMutableDictionary dictionaryWithCapacity:0];
        NSString *resultString = QQResp.result;
        if ([resultString isEqualToString:@"0"]) {
            result = [RCTSuperModule getResultWithCode:@"0" msg:@"分享成功" body:@"分享成功"];
        } else if ([resultString isEqualToString:@"-4"]) {
            result = [RCTSuperModule getResultWithCode:resultString msg:@"用户取消" body:@"用户取消"];
        } else {
            result = [RCTSuperModule getResultWithCode:resultString msg:@"分享失败" body:@"分享失败"];
        }
        shareCallback(@[result]);
    }
}


// QQSDK要求必须在主线程调用授权方法

- (dispatch_queue_t)methodQueue {
    return dispatch_get_main_queue();
}

#pragma mark - QQ注册
RCT_EXPORT_METHOD(registerQQ : (NSString *)appId : (RCTResponseSenderBlock)callback) {
    
    NSMutableDictionary *result = [NSMutableDictionary dictionaryWithCapacity:5];
    if (appId && appId.length > 0) {
        self.tencentOAuth = [[TencentOAuth alloc] initWithAppId:appId andDelegate:self];
        [result setValue:[NSNumber numberWithBool:[TencentOAuth iphoneQQInstalled]] forKey: @"iphoneQQInstalled"];
        [result setValue:[NSNumber numberWithBool:[TencentOAuth iphoneQZoneInstalled]] forKey: @"iphoneQZoneInstalled"];
        [result setValue:[NSNumber numberWithBool:[TencentOAuth iphoneQQSupportSSOLogin]] forKey: @"iphoneQQSupportSSOLogin"];
        [result setValue:[NSNumber numberWithBool:[TencentOAuth iphoneQZoneSupportSSOLogin]] forKey: @"iphoneQZoneSupportSSOLogin"];
        callback(@[result]);
    }
}

#pragma mark - QQ分享 分享好友或空间
RCT_EXPORT_METHOD(qqShare
                  :(NSDictionary *)config
                  : (RCTResponseSenderBlock)callback) {
    if(![QQApiInterface isQQInstalled]) {
        NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"未安装QQ" body:@"未安装QQ"];
        callback(@[ result ]);
        return;
    }
    shareCallback = callback;
    if ([[config objectForKey:@"type"] isEqualToString:@"news"]) {
        if([[config objectForKey:@"title"] length] == 0 || ![config objectForKey:@"title"]) {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 缺少title"];
            shareCallback(@[ result ]);
            return;
        }
        if([[config objectForKey:@"webpageUrl"] length] == 0 || ![config objectForKey:@"webpageUrl"]) {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 缺少webpageUrl"];
            shareCallback(@[ result ]);
            return;
        }
        NSString *utf8String = @"";
        NSString *title = @"";
        NSString *description = @"";
        NSString *previewImageURL = @"";
        if([config objectForKey:@"title"]) {
            title = [config objectForKey:@"title"];
        }
        if([config objectForKey:@"description"]) {
            description = [config objectForKey:@"description"];
        }
        NSString *thumbImage = [config objectForKey:@"imageUrl"];
        if (thumbImage && thumbImage.length > 0) {
            previewImageURL = thumbImage;
        }
        NSString *webpageUrl = [config objectForKey:@"webpageUrl"];
        if(webpageUrl && webpageUrl.length > 0){
            utf8String = webpageUrl;
        }
        QQApiNewsObject *newsObj = [QQApiNewsObject
                                    objectWithURL:[NSURL URLWithString:utf8String]
                                    title:title
                                    description:description
                                    previewImageURL:[NSURL URLWithString:previewImageURL]];
        SendMessageToQQReq *req = [SendMessageToQQReq reqWithContent:newsObj];
        //将内容分享到qq
        [QQApiInterface sendReq:req];
    } else if ([[config objectForKey:@"type"] isEqualToString:@"imageFile"]) {
        if([[config objectForKey:@"imageUrl"] length] == 0 || ![config objectForKey:@"imageUrl"]) {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 缺少imageUrl"];
            shareCallback(@[ result ]);
            return;
        }
        if([[NSData dataWithContentsOfURL:[NSURL URLWithString:[config objectForKey:@"imageUrl"]]] length]==0) {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 imageUrl格式有误"];
            shareCallback(@[ result ]);
            return;
        }
        NSString *title = [config objectForKey:@"title"];
        NSString *description = [config objectForKey:@"description"];
        
        NSString *thumbImage = [config objectForKey:@"imageUrl"];
        if (thumbImage && thumbImage.length > 0) {
            NSData *imgData = [NSData dataWithContentsOfURL:[NSURL URLWithString:thumbImage]];
            QQApiImageObject *imgObj = [QQApiImageObject objectWithData:imgData
                                                       previewImageData:imgData
                                                                  title:title
                                                            description:description];
            SendMessageToQQReq *req = [SendMessageToQQReq reqWithContent:imgObj];
            //将内容分享到qq
            [QQApiInterface sendReq:req];
        }
    } else {
        NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"type 参数有误" body:@"type 参数有误"];
        shareCallback(@[ result ]);
    }
}
#pragma mark  QQ授权登录
RCT_EXPORT_METHOD(qqLogin: (RCTResponseSenderBlock)callback) {
    if(![QQApiInterface isQQInstalled]) {
        NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"未安装QQ" body:@"未安装QQ"];
        callback(@[ result ]);
        return;
    }
    authCallback = callback;
    NSMutableArray *permissions = [NSMutableArray arrayWithCapacity:0];
    NSArray *defaultPermissions =
    [NSArray arrayWithObjects:kOPEN_PERMISSION_GET_USER_INFO, kOPEN_PERMISSION_GET_SIMPLE_USER_INFO, kOPEN_PERMISSION_ADD_SHARE, nil];
    [permissions addObjectsFromArray:defaultPermissions];
    NSLog(@"kOPEN_PERMISSION_GET_USER_INFO = %@",kOPEN_PERMISSION_GET_USER_INFO);
    [self.tencentOAuth authorize:permissions];
}

- (void)tencentDidLogin {
    NSLog(@"授权登录");
    if([self.tencentOAuth getUserInfo]) {
        if (self.tencentOAuth.accessToken && self.tencentOAuth.accessToken.length != 0) {
            NSString *openId = self.tencentOAuth.openId;
            NSString *accessToken = self.tencentOAuth.accessToken;
            NSInteger expiresInSecond = [self.tencentOAuth.expirationDate timeIntervalSinceNow];
            
            NSMutableDictionary *results = [[NSMutableDictionary alloc] initWithCapacity:0];
            [results setValue:openId forKey:@"openId"];
            [results setValue:accessToken forKey:@"accessToken"];
            [results setValue:[NSNumber numberWithInteger:expiresInSecond] forKey:@"expiresInSecond"];
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"0" msg:@"登录成功" body:results];
            authCallback(@[ result ]);
        }
    }
}
- (void)getUserInfoResponse:(APIResponse *)response {
    NSLog(@"获取用户信息");
    NSLog(@"%@", response.jsonResponse);
}

- (void)tencentDidNotLogin:(BOOL)cancelled {
    NSMutableDictionary *error = [[NSMutableDictionary alloc] init];
    if (cancelled) {
        [error setValue:[NSNumber numberWithBool:YES] forKey:@"cancel"];
        NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"用户取消" body:@"用户取消"];
        authCallback(@[ result ]);
    } else {
        NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"登陆失败" body:@"登陆失败"];
        authCallback(@[ result ]);
    }
}

- (void)tencentDidNotNetWork {
    NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"当前网络不可用,请设置网络" body:@"当前网络不可用,请设置网络"];
    authCallback(@[ result ]);
    authCallback = nil;
}
#pragma mark  注册微博
RCT_EXPORT_METHOD(registerWeibo : (NSString *)appKey : (RCTResponseSenderBlock)callback) {
    NSLog(@"%@", @"注册微博");
    BOOL appRegistered = NO;
    NSMutableDictionary *result = [NSMutableDictionary dictionaryWithCapacity:3];
    if (appKey !=nil && appKey.length > 0) {
        appRegistered = [WeiboSDK registerApp:appKey];
        [result setObject:[NSNumber numberWithBool:appRegistered] forKey:@"appRegistered"];
        [result setObject:[NSNumber numberWithBool:[WeiboSDK isWeiboAppInstalled]] forKey:@"weiboAppInstalled"];
        [result setObject:[NSNumber numberWithBool:[WeiboSDK isCanShareInWeiboAPP]] forKey:@"weiboAppCanShare"];
        [result setObject:[NSNumber numberWithBool:[WeiboSDK isCanSSOInWeiboApp]] forKey:@"weiboAppCanSSO"];
    }
    callback(@[result]);
}
#pragma mark  微博授权登录
RCT_EXPORT_METHOD(sinaLogin: (RCTResponseSenderBlock)callback) {
    [WeiboSDK enableDebugMode:YES];
    authCallback = callback;
    WBAuthorizeRequest *request = [WBAuthorizeRequest request];
    NSString *scope  = kDefaultScope;
    NSString *redirectURI = kDefaultRedirectUrl;
    request.redirectURI = redirectURI;
    request.scope = scope;
    [WeiboSDK sendRequest:request];
}

#pragma mark  新浪微博分享 新浪微博分享 分享图文介绍连接
RCT_EXPORT_METHOD(sinaShare
                  :(NSDictionary*)config
                  : (RCTResponseSenderBlock)callback)  {
    shareCallback = callback;
    if ([[config objectForKey:@"type"] isEqualToString:@"news"]) {
        if([[config objectForKey:@"title"] length] == 0 || ![config objectForKey:@"title"]) {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 缺少title"];
            shareCallback(@[ result ]);
            return;
        }
        if([[config objectForKey:@"webpageUrl"] length] == 0 || ![config objectForKey:@"webpageUrl"]) {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 缺少webpageUrl"];
            shareCallback(@[ result ]);
            return;
        }
        WBMessageObject *message = [WBMessageObject message];
        NSString *scope  = kDefaultScope;
        NSString *redirectURI = kDefaultRedirectUrl;
        WBAuthorizeRequest *shareRequest = [WBAuthorizeRequest request];
        shareRequest.scope = scope;
        shareRequest.redirectURI = redirectURI;
        
        WBWebpageObject *webpage = [WBWebpageObject object];
        NSString *objectID = [[NSUUID UUID] UUIDString];
        objectID = @"identifier1";
        webpage.objectID = objectID;
        if([config objectForKey:@"title"]) {
            webpage.title = [config objectForKey:@"title"];
        }
        if([config objectForKey:@"description"]) {
            webpage.description = [config objectForKey:@"description"];
        }
        NSString *imageUrl = [config objectForKey:@"imageUrl"];
        if(imageUrl&&imageUrl.length>0) {
            NSData *imageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:imageUrl]];
            UIImage *resultImage = [UIImage imageWithData:imageData];
            if (imageData.length > 32000) {
                imageData = [self dataWithImage:resultImage scale:CGSizeMake(100, 100)];
            }
            webpage.thumbnailData = imageData;
        }
        if ([config objectForKey:@"webpageUrl"]) {
            webpage.webpageUrl = [config objectForKey:@"webpageUrl"];
        }
        message.mediaObject = webpage;
        WBSendMessageToWeiboRequest *request =
        [WBSendMessageToWeiboRequest requestWithMessage:message authInfo:shareRequest access_token:nil];
        [WeiboSDK sendRequest:request];
    } else if ([[config objectForKey:@"type"] isEqualToString:@"imageFile"]) {
        if([[config objectForKey:@"imageUrl"] length] == 0 || ![config objectForKey:@"imageUrl"]) {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 缺少imageUrl"];
            shareCallback(@[ result ]);
            return;
        }
        if([[NSData dataWithContentsOfURL:[NSURL URLWithString:[config objectForKey:@"imageUrl"]]] length]==0) {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"参数不合法 imageUrl格式有误"];
            shareCallback(@[ result ]);
            return;
        }
        WBMessageObject *message = [WBMessageObject message];
        WBAuthorizeRequest *shareRequest = [WBAuthorizeRequest request];
        shareRequest.scope = kDefaultScope;
        shareRequest.redirectURI = kDefaultRedirectUrl;
        WBImageObject *imageObject = [WBImageObject object];
        NSString *imageUrl = [config objectForKey:@"imageUrl"];
        if([config objectForKey:@"imageUrl"]) {
            NSData *imageData = [NSData dataWithContentsOfURL:[NSURL URLWithString:imageUrl]];
            imageObject.imageData = imageData;
        }
        message.imageObject = imageObject;
        WBSendMessageToWeiboRequest *request =
        [WBSendMessageToWeiboRequest requestWithMessage:message authInfo:shareRequest access_token:nil];
        [WeiboSDK sendRequest:request];
    } else {
        NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"type 参数有误" body:@"type 参数有误"];
        shareCallback(@[ result ]);
    }
    
}

- (NSData *)dataWithImage:(UIImage *)image scale:(CGSize)size {
    UIGraphicsBeginImageContext(size);
    [image drawInRect:CGRectMake(0,0, size.width, size.height)];
    UIImage* scaledImage =UIGraphicsGetImageFromCurrentImageContext();
    UIGraphicsEndImageContext();
    return UIImageJPEGRepresentation(scaledImage, 1);
}

- (void)didReceiveWeiboRequest:(WBBaseRequest *)request {
    NSLog(@"didReceiveWeiboRequest...");
}

- (void)didReceiveWeiboResponse:(WBBaseResponse *)response {
    NSLog(@"didReceiveWeiboResponse...%ld", (long)response.statusCode);
    if ([response isKindOfClass:WBAuthorizeResponse.class]) {
        if (response.statusCode == WeiboSDKResponseStatusCodeSuccess) {
            WBAuthorizeResponse *authorizeResponse = (WBAuthorizeResponse *)response;
            NSString *uid = authorizeResponse.userID;
            NSString *accessToken = authorizeResponse.accessToken;
            NSString *refreshToken = authorizeResponse.refreshToken;
            NSInteger expiresInSeconds = [authorizeResponse.expirationDate timeIntervalSinceNow];
            NSMutableDictionary *results = [NSMutableDictionary dictionaryWithCapacity:0];
            [results setValue:uid forKey:@"uid"];
            [results setValue:accessToken forKey:@"accessToken"];
            [results setValue:refreshToken forKey:@"refreshToken"];
            [results setValue:[NSNumber numberWithInteger:expiresInSeconds] forKey:@"expiresInSeconds"];
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"0" msg:@"登录成功" body:results];
            authCallback(@[ result ]);
        } else if (response.statusCode == WeiboSDKResponseStatusCodeUserCancel) {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"用户取消" body:@"用户取消"];
            authCallback(@[ result ]);
        }else {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"登录失败" body:@"登录失败"];
            authCallback(@[ result ]);
        }
        
    } else if ([response isKindOfClass:WBSendMessageToWeiboResponse.class]) {
        if (response.statusCode == WeiboSDKResponseStatusCodeSuccess) {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"0" msg:@"分享成功" body:@"分享成功"];
            shareCallback(@[ result ]);
        } else if (response.statusCode == WeiboSDKResponseStatusCodeUserCancel) {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"用户取消" body:@"用户取消"];
            shareCallback(@[ result ]);
        }else {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"分享失败" body:@"分享失败"];
            shareCallback(@[ result ]);
        }
    }
}

#pragma mark   ==============点击订单模拟支付行为==============
RCT_EXPORT_METHOD(isAliPayInstalled:(RCTResponseSenderBlock)callback)
{
    callback(@[[NSNull null], @( [[UIApplication sharedApplication] canOpenURL:[NSURL URLWithString:@"alipays://"]])]);
}
#pragma mark  支付宝支付(后端加签)
RCT_EXPORT_METHOD(aliPay
                  :(NSDictionary*)config
                  : (RCTResponseSenderBlock)callback) {
    payCallback = callback;
    NSString *appScheme = @"Apin";
    NSString *orderStr = @"";
    if ([config objectForKey:@"urlSchemes"]) {
        appScheme = [config objectForKey:@"urlSchemes"];
    };
    if ([config objectForKey:@"orderStr"]) {
        orderStr = [config objectForKey:@"orderStr"];
    };
    // NOTE: 调用支付结果开始支付
    [[AlipaySDK defaultService] payOrder:orderStr fromScheme:appScheme callback:^(NSDictionary *resultDic) {
        NSLog(@"支付宝支付结果：reslut = %@",resultDic);
        NSString *status = resultDic[@"resultStatus"];
        if ([status integerValue] == 9000) {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"0" msg:@"支付成功" body:@"支付成功"];
            payCallback(@[ result ]);
        } else if([status integerValue] == 6001) {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"用户取消" body:@"用户取消"];
            payCallback(@[ result ]);
        } else {
            NSDictionary *result = [RCTSuperModule getResultWithCode:@"-1" msg:@"支付失败" body:@"支付失败"];
            payCallback(@[ result ]);
        }
    }];
}
- (BOOL)isUrlWithString:(NSString *)str {
    if(self == nil)
        return NO;
    NSString *url;
    if (str.length>4 && [[str substringToIndex:4] isEqualToString:@"www."]) {
        url = [NSString stringWithFormat:@"http://%@",self];
    }else{
        url = str;
    }
    NSString *urlRegex = @"(https|http|ftp|rtsp|igmp|file|rtspt|rtspu)://((((25[0-5]|2[0-4]\\d|1?\\d?\\d)\\.){3}(25[0-5]|2[0-4]\\d|1?\\d?\\d))|([0-9a-z_!~*'()-]*\\.?))([0-9a-z][0-9a-z-]{0,61})?[0-9a-z]\\.([a-z]{2,6})(:[0-9]{1,4})?([a-zA-Z/?_=]*)\\.\\w{1,5}";
    NSPredicate* urlTest = [NSPredicate predicateWithFormat:@"SELF MATCHES %@", urlRegex];
    return [urlTest evaluateWithObject:url];
}
@end

