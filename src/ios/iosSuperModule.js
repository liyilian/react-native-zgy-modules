'use strict';

import {NativeModules } from 'react-native';
const SuperMoudle= NativeModules.SuperModule;

//+++++++++++++++++++++微信+++++++++++++++++++++++++++

export function registerWeChat(data) {
    return new Promise((resolve, reject) => {
        SuperMoudle.registerWeChat(data, (resp)=>{
            if (resp.appRegistered) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });

    });
}

export function weChatLogin() {
    return new Promise((resolve, reject) => {
        SuperMoudle.weChatLogin((resp)=>{
            if (resp.code == 0) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });

    });
}

export function shareToSession(data) {
    return new Promise((resolve, reject) => {
        SuperMoudle.shareToSession(data, (resp)=>{
            if (resp.code == 0) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });

    });
}
export function shareToTimeline(data) {
    return new Promise((resolve, reject) => {
        SuperMoudle.shareToTimeline(data, (resp)=>{
            if (resp.code == 0) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });

    });
}
export function shareToSessionImg(data) {
    return new Promise((resolve, reject) => {
        SuperMoudle.shareToSessionImg(data, (resp)=>{
            if (resp.code == 0) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });

    });
}
export function shareToTimelineImg(data) {
    return new Promise((resolve, reject) => {
        SuperMoudle.shareToTimelineImg(data, (resp)=>{
            if (resp.code == 0) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });

    });
}
export function weChatPay(data) {
    return new Promise((resolve, reject) => {
        SuperMoudle.weChatPay(data, (resp)=>{
            if (resp.code == 0) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });

    });
}

//+++++++++++++++++++++QQ++++++++++++++++++++++++++++

export function registerQQ(str) {
    return new Promise((resolve, reject) => {
        SuperMoudle.registerQQ(str, (resp)=>{
            resolve(resp);
        });

    });
}
export function qqShare(data) {
    return new Promise((resolve, reject) => {
        SuperMoudle.qqShare(data, (resp)=>{
            if (resp.code == 0) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });

    });
}
export function qqLogin() {
    return new Promise((resolve, reject) => {
        SuperMoudle.qqLogin((resp)=>{
            if (resp.code == 0) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });
    });
}
//++++++++++++++++++++新浪微博+++++++++++++++++++++++++
export function registerWeibo(str) {
    return new Promise((resolve, reject) => {
        SuperMoudle.registerWeibo(str, (resp)=>{
            if (resp.appRegistered) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });

    });
}

export function sinaShare(data) {
    return new Promise((resolve, reject) => {
        SuperMoudle.sinaShare(data, (resp)=>{
            if (resp.code == 0) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });

    });
}

export function sinaLogin() {
    return new Promise((resolve, reject) => {
        SuperMoudle.sinaLogin((resp)=>{
            if (resp.code == 0) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });

    });
}
//+++++++++++++++++++++支付宝支付++++++++++++++++++++++++
export function aliPay(data) {
    return new Promise((resolve, reject) => {
        SuperMoudle.aliPay(data, (resp)=>{
            if (resp.code == 0) {
                resolve(resp);
            } else {
                reject(resp);
            }
        });

    });
}