
import React from 'react'
import CreateReactClass from "create-react-class";
import PropTypes from 'prop-types';
import {
    ViewPropTypes,
    StyleSheet,
    Text,
    View,
    Animated,
    TouchableWithoutFeedback,
} from 'react-native';
import { colors } from '../../../styles/common';

const CustomTabBar = CreateReactClass({
    propTypes: {
        goToPage: PropTypes.func,
        activeTab: PropTypes.number,
        tabs: PropTypes.array,
        backgroundColor: PropTypes.string,
        activeTextColor: PropTypes.string,
        inactiveTextColor: PropTypes.string,
        textStyle: Text.propTypes.style,
        tabStyle: ViewPropTypes.style,
        renderTab: PropTypes.func,
        underlineStyle: ViewPropTypes.style,
    },

    getDefaultProps: function () {
        return {
            activeTextColor: colors.navy,
            inactiveTextColor: colors.black,
            backgroundColor: null,
        };
    },

    renderTab(name, page, isTabActive, onPressHandler) {
        const { activeTextColor, inactiveTextColor, textStyle, } = this.props;
        const textColor = isTabActive ? activeTextColor : inactiveTextColor;
        const fontWeight = isTabActive ? 'bold' : 'normal';
        const backgroundColor = isTabActive ? colors.purple : colors.purple500;
        
        return <TouchableWithoutFeedback
            style={{ flex: 1, }}
            key={name}
            accessible={true}
            onPress={() => onPressHandler(page)}
        >
            <View style={[styles.tab, this.props.tabStyle, {backgroundColor}]}>
                <Text style={[{ color: textColor, fontWeight, }, textStyle,]}>
                    {name}
                </Text>
            </View>
        </TouchableWithoutFeedback>;
    },

    render() {
        const containerWidth = this.props.containerWidth;
        const numberOfTabs = this.props.tabs.length;
        const tabUnderlineStyle = {
            position: 'absolute',
            width: containerWidth / numberOfTabs,
            height: 4,
            backgroundColor: 'navy',
            bottom: 0,
        };

        const translateX = this.props.scrollValue.interpolate({
            inputRange: [0, 1],
            outputRange: [0, containerWidth / numberOfTabs],
        });
        return (
            <View style={[styles.tabs, { backgroundColor: this.props.backgroundColor, }, this.props.style,]}>
                {this.props.tabs.map((name, page) => {
                    const isTabActive = this.props.activeTab === page;
                    const renderTab = this.props.renderTab || this.renderTab;
                    return renderTab(name, page, isTabActive, this.props.goToPage);
                })}
                <Animated.View
                    style={[
                        tabUnderlineStyle,
                        {
                            transform: [
                                { translateX },
                            ]
                        },
                        this.props.underlineStyle,
                    ]}
                />
            </View>
        );
    },
});

const styles = StyleSheet.create({
    tab: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        paddingBottom: 10,
    },
    tabs: {
        height: 42,
        flexDirection: 'row',
        justifyContent: 'space-around',
    },
});

export default CustomTabBar;
