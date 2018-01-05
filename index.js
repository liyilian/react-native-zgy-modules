// index.js
import {Platform} from 'react-native';
import * as iosSuperModule from './src/ios/iosSuperModule.js';
import * as androidSuperModule from './src/android/androidSuperModule.js';
import reactNativeNavigation from './src/reactNativeNavigation/App';
import ImageView from "./src/imageView/ImageView";
import MyAlert from "./src/alert/MyAlert";
import HttpTool from "./src/http/HttpTool";
import MyListView from "./src/list/MyListView";
import Modal from "./src/modal";
import MySwiper from './src/swiper'
import reactNavigation from './src/react-navigation/App';


export {reactNativeNavigation, ImageView, MyAlert, HttpTool, MyListView, Modal, reactNavigation};
export const SuperModule = Platform.OS == "android" ? androidSuperModule : iosSuperModule;

