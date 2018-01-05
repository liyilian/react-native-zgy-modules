'use strict';

import { DeviceEventEmitter, NativeModules } from 'react-native';
import { EventEmitter } from 'events';
const SuperModule= NativeModules.SuperModule;
const emitter = new EventEmitter();
let isAppRegistered = false;

DeviceEventEmitter.addListener('SuperModel_Resp', resp => {
    emitter.emit(resp.type, resp);
});
/*-----------------------------新浪相关-----------------------------------*/
export function sinaShare(data) {
    return new Promise((resolve, reject) => {
        SuperModule.sinaShare(data, (res)=>{reject(res)});
        emitter.once('SinaShare.Resp', resp => {
            if (resp.code == 1) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });
    });
}
export function sinaLogin() {
    return new Promise((resolve, reject) => {
        SuperModule.sinaLogin((res)=>{reject(res)});
        emitter.once('SinaLogin.Resp', resp => {
            if (resp.code == 1) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });
    });
}
/*-----------------------------QQ相关-----------------------------------*/
export function qqShare(data) {
    return new Promise((resolve, reject) => {
        SuperModule.qqShare(data, (res)=>{reject(res)});
        emitter.once('QQShare.Resp', resp => {
            if (resp.code == 1) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });
    });
}
export function qqLogin() {
    return new Promise((resolve, reject) => {
        SuperModule.qqLogin((res)=>{reject(res)});
        emitter.once('QQLogin.Resp', resp => {
            if (resp.code == 1) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });
    });
}
/*-----------------------------------微信相关方法----------------------------------------------------*/

function wrapRegisterApp(nativeFunc) {
    if (!nativeFunc) {
        return undefined;
    }
    return (...args) => {
        if (isAppRegistered) {
            // FIXME(Yorkie): we ignore this error if AppRegistered is true.
            return Promise.resolve(true);
        }
        isAppRegistered = true;
        return new Promise((resolve, reject) => {
            nativeFunc.apply(null, [
                ...args,
                (error, result) => {
                    if (!error) {
                        return resolve(result);
                    }
                    if (typeof error === 'string') {
                        return reject(new Error(error));
                    }
                    reject(error);
                },
            ]);
        });
    };
}

function wrapApi(nativeFunc) {
    if (!nativeFunc) {
        return undefined;
    }
    return (...args) => {
        if (!isAppRegistered) {
            return Promise.reject(new Error('registerApp required.'));
        }
        return new Promise((resolve, reject) => {
            nativeFunc.apply(null, [
                ...args,
                (error, result) => {
                    if (!error) {
                        return resolve(result);
                    }
                    if (typeof error === 'string') {
                        return reject(new Error(error));
                    }
                    reject(error);
                },
            ]);
        });
    };
}

/**
 * `addListener` inherits from `events` module
 * @method addListener
 * @param {String} eventName - the event name
 * @param {Function} trigger - the function when event is fired
 */
export const addListener = emitter.addListener.bind(emitter);

/**
 * `once` inherits from `events` module
 * @method once
 * @param {String} eventName - the event name
 * @param {Function} trigger - the function when event is fired
 */
export const once = emitter.once.bind(emitter);

/**
 * `removeAllListeners` inherits from `events` module
 * @method removeAllListeners
 * @param {String} eventName - the event name
 */
export const removeAllListeners = emitter.removeAllListeners.bind(emitter);

/**
 * @method registerApp
 * @param {String} appid - the app id
 * @return {Promise}
 */
export const registerWeChat = wrapRegisterApp(SuperModule.registerApp);

/**
 * @method registerAppWithDescription
 * @param {String} appid - the app id
 * @param {String} appdesc - the app description
 * @return {Promise}
 */
export const registerAppWithDescription = wrapRegisterApp(
    SuperModule.registerAppWithDescription,
);

/**
 * Return if the SuperModule app is installed in the device.
 * @method isWXAppInstalled
 * @return {Promise}
 */
export const isWXAppInstalled = wrapApi(SuperModule.isWXAppInstalled);

/**
 * Return if the SuperModule application supports the api
 * @method isWXAppSupportApi
 * @return {Promise}
 */
export const isWXAppSupportApi = wrapApi(SuperModule.isWXAppSupportApi);

/**
 * Get the SuperModule app installed url
 * @method getWXAppInstallUrl
 * @return {String} the SuperModule app installed url
 */
export const getWXAppInstallUrl = wrapApi(SuperModule.getWXAppInstallUrl);

/**
 * Get the SuperModule api version
 * @method getApiVersion
 * @return {String} the api version string
 */
export const getApiVersion = wrapApi(SuperModule.getApiVersion);

/**
 * Open SuperModule app
 * @method openWXApp
 * @return {Promise}
 */
export const openWXApp = wrapApi(SuperModule.openWXApp);

// wrap the APIs
const nativeShareToTimeline = wrapApi(SuperModule.shareToTimeline);
const nativeShareToSession = wrapApi(SuperModule.shareToSession);
const nativeSendAuthRequest = wrapApi(SuperModule.sendAuthRequest);

/**
 * @method sendAuthRequest
 * @param {Array} scopes - the scopes for authentication.
 * @return {Promise}
 */
export function sendAuthRequest(scopes, state) {
    return new Promise((resolve, reject) => {
        SuperModule.sendAuthRequest(scopes, state, () => {});
        emitter.once('SendAuth.Resp', resp => {
            if (resp.errCode === 0) {
                resolve(resp);
            } else {
                reject(new WechatError(resp));
            }
        });
    });
}
export function weChatLogin() {
    let scope = 'snsapi_userinfo';
    let state = 'wechat_sdk_demo';
    return this.sendAuthRequest(scope,state)
}
/**
 * Share something to timeline/moments/朋友圈
 * @method shareToTimeline
 * @param {Object} data
 * @param {String} data.thumbImage - Thumb image of the message, which can be a uri or a resource id.
 * @param {String} data.type - Type of this message. Could be {news|text|imageUrl|imageFile|imageResource|video|audio|file}
 * @param {String} data.webpageUrl - Required if type equals news. The webpage link to share.
 * @param {String} data.imageUrl - Provide a remote image if type equals image.
 * @param {String} data.videoUrl - Provide a remote video if type equals video.
 * @param {String} data.musicUrl - Provide a remote music if type equals audio.
 * @param {String} data.filePath - Provide a local file if type equals file.
 * @param {String} data.fileExtension - Provide the file type if type equals file.
 */
export function shareToTimeline(data) {
    return new Promise((resolve, reject) => {
        nativeShareToTimeline(data);
        emitter.once('SendMessageToWX.Resp', resp => {
            if (resp.errCode === 0) {
                resolve(resp);
            } else {
                reject(new WechatError(resp));
            }
        });
    });
}

/**
 * Share something to a friend or group
 * @method shareToSession
 * @param {Object} data
 * @param {String} data.thumbImage - Thumb image of the message, which can be a uri or a resource id.
 * @param {String} data.type - Type of this message. Could be {news|text|imageUrl|imageFile|imageResource|video|audio|file}
 * @param {String} data.webpageUrl - Required if type equals news. The webpage link to share.
 * @param {String} data.imageUrl - Provide a remote image if type equals image.
 * @param {String} data.videoUrl - Provide a remote video if type equals video.
 * @param {String} data.musicUrl - Provide a remote music if type equals audio.
 * @param {String} data.filePath - Provide a local file if type equals file.
 * @param {String} data.fileExtension - Provide the file type if type equals file.
 */
export function shareToSession(data) {
    return new Promise((resolve, reject) => {
        nativeShareToSession(data);
        emitter.once('SendMessageToWX.Resp', resp => {
            if (resp.errCode === 0) {
                resolve(resp);
            } else {
                reject(new WechatError(resp));
            }
        });
    });
}

/**
 * SuperModule pay
 * @param {Object} data
 * @param {String} data.partnerId
 * @param {String} data.prepayId
 * @param {String} data.nonceStr
 * @param {String} data.timeStamp
 * @param {String} data.package
 * @param {String} data.sign
 * @returns {Promise}
 */
export function weChatpay(data) {
    // FIXME(Yorkie): see https://github.com/yorkie/react-native-SuperModule/issues/203
    // Here the server-side returns params in lowercase, but here SDK requires timeStamp
    // for compatibility, we make this correction for users.
    function correct(actual, fixed) {
        if (!data[fixed] && data[actual]) {
            data[fixed] = data[actual];
            delete data[actual];
        }
    }
    correct('prepayid', 'prepayId');
    correct('noncestr', 'nonceStr');
    correct('partnerid', 'partnerId');
    correct('timestamp', 'timeStamp');

    return new Promise((resolve, reject) => {
        SuperModule.pay(data, result => {
            if (result) reject(result);
        });
        emitter.once('PayReq.Resp', resp => {
            if (resp.errCode === 0) {
                resolve(resp);
            } else {
                reject(new WechatError(resp));
            }
        });
    });
}
/**
 * promises will reject with this error when API call finish with an errCode other than zero.
 */
export class WechatError extends Error {
    constructor(resp) {
        const message = resp.errStr || resp.errCode.toString();
        super(message);
        this.name = 'WechatError';
        this.code = resp.errCode;

        // avoid babel's limition about extending Error class
        // https://github.com/babel/babel/issues/3083
        if (typeof Object.setPrototypeOf === 'function') {
            Object.setPrototypeOf(this, WechatError.prototype);
        } else {
            this.__proto__ = WechatError.prototype;
        }
    }
}
/*-----------------------------支付宝相关-----------------------------------*/
export function aliPay(data) {
    return new Promise((resolve, reject) => {
        SuperModule.aliPay(data.orderStr, result => {
            if (result.code == 1){
                resolve(result);
            }else {
                reject(result);
            }
        });
    });
}
/*--------------------------------迎合ios 安卓无需这些代码---------------------*/
export function registerQQ(data) {
    return new Promise((resolve, reject) => {
        resolve({code:'1',msg:'QQ注册成功',body:'Android can discard this method'})
    });
}
export function registerWeibo(data) {
    return new Promise((resolve, reject) => {
        resolve({code:'1',msg:'新浪注册成功',body:'Android can discard this method'})
    });
}

