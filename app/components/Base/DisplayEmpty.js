import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import PropTypes from 'prop-types';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors } from '../../styles/common';

const styles = StyleSheet.create({
    wrapper: {
        height: '100%',
        justifyContent: 'center',
        alignItems: 'center',
    },
    content: {
        fontSize: RFValue(13),
        color: colors.white
    }
});

export default function DisplayEmpty({ content }) {
    return (
        <View style={styles.wrapper}>
            <Text style={styles.content}>{content}</Text>
        </View>
    );
}

DisplayEmpty.propTypes = {
    content: PropTypes.string
}