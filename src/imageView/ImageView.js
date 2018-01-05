import React, {Component} from 'react';
import {
    AppRegistry,
    StyleSheet,
    Text,
    TouchableOpacity,
    CameraRoll,
    View,
    Modal,
    Dimensions,
    Platform,
    Alert,
    NativeModules,
    DeviceEventEmitter
} from 'react-native';

import ImageViewer from 'react-native-image-zoom-viewer';

export default class ImageView extends React.Component {
    constructor(props) {
        super(props);
        this.state = {
            modalVisible: false,
            images: this.props.images,
            index: 0,
        };
    }

    componentDidMount() {
    }

    componentWillUnmount() {
        this.timer && clearTimeout(this.timer);
    }

    render() {
        return (
            <Modal visible={this.state.modalVisible}
                   onRequestClose={() => this.hide()}
                   transparent={true}>
                <ImageViewer imageUrls={this.props.images || []}
                             ref={ImageViewer => this.imageViewer = ImageViewer}
                             onChange={(index) => this.setState({index: index})}
                             saveToLocalByLongPress={false}
                             onSave={(url) => {
                                 this.save(url)
                             }}
                             index={this.state.index}
                             onClick={() => this.onClick()}
                             onDoubleClick={
                                 () => {
                                     this.onDoubleClick()
                                 }
                             }
                />
            </Modal>
        )
    }

    onDoubleClick() {
        this.timer && clearTimeout(this.timer);
        this.timer = undefined;
    }

    onClick() {
        this.timer && clearTimeout(this.timer);
        this.timer = undefined;
        //0.3秒内关闭
        this.timer = setTimeout(() => {
                this.clickNumber = 0;
                this.setState({
                    modalVisible: false
                })
            }, 300
        );
    }

    /**
     * 显示
     */
    show(index) {
        let n = index || 0;
        this.setState({
            modalVisible: true,
            index: n
        })
    }

    /**
     * 隐藏
     */
    hide() {
        this.setState({
            modalVisible: false,
        })
    }

}