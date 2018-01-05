import React, { Component } from 'react';
import PropTypes from 'prop-types';

import Swiper from 'react-native-swiper';

class MySwiper extends Component {
    constructor(props) {
        super(props);
    }

    render() {
        const {
            activeDotStyle,
            autoplay,
            autoplayTimeout,
            children,
            dotStyle,
            onIndexChanged,
            width,
            showsPagination,
            paginationStyle
            } = this.props
        return (
            <Swiper
                activeDotStyle={activeDotStyle}
                autoplay={autoplay}
                autoplayTimeout={autoplayTimeout}
                dotStyle={dotStyle}
                onIndexChanged={onIndexChanged}
                paginationStyle={paginationStyle}
                showsPagination={showsPagination}
                width={width}
            >
                {children}
            </Swiper>
        )
    }
}

MySwiper.propTypes = {
    autoplay: PropTypes.bool,
    autoplayTimeout:PropTypes.number,
    showsPagination: PropTypes.bool,
    width: PropTypes.number,
    paginationStyle: PropTypes.object,
};


export default MySwiper;