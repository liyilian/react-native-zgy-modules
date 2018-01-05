import React, {Component} from 'react';
import {View, ActivityIndicator, Text} from 'react-native';


class MyLoadingView extends Component {
    static defaultProps = {};

    render() {
        var {
            color,
            size,
        } = this.props;
        var style = null;
        if (size) {
            if ('small' == size || 'large' == size) {

            } else if ('big' == size) {
                size = 'large';
                var scale = 2;
                style = {
                    height: 36 * scale,
                    alignItems: 'center',
                    justifyContent: 'center',
                    backgroundColor: '#ff00ff',
                    transform: [{scale: scale}]
                };
            } else {
                if (typeof(size) == "number") {
                    scale = parseInt(size);
                    size = 'large';
                    style = {
                        height: 36 * scale,
                        alignItems: 'center',
                        justifyContetn: 'center',
                        transform: [{scale: scale}],
                    };
                } else {
                }
            }
        } else {
            size = 'small'
        }
        return (
            <View>
                <ActivityIndicator
                    size={size}
                    color={color}
                    style={style}
                />
            </View>
        );
    }


}
module.exports = MyLoadingView;