import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
    container: {
        backgroundColor: colors.primaryFox
    },
    title: {
        color: colors.white,
    },
    subtitle: {
        color: colors.white100
    },
    error: {
        color: colors.red
    },
    button: {
        borderRadius: 10,
        backgroundColor: colors.blue,
        borderWidth: 0,
    },
    buttonText: {
        color: colors.black,
    },
    text: {
        color: colors.white,
    }
});

export default brandStyles;
