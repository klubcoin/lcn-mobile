import { StyleSheet } from 'react-native';
import { assignNestedObj } from '../../../../util/object';
import { colors, fontStyles } from '../../../../styles/common';
import brandStyles from "./brand";

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    content: {
        paddingHorizontal: 24,
        flex: 1
    },
    header: {
        alignItems: 'center'
    },
    errorImage: {
        width: 50,
        height: 50,
        marginTop: 24
    },
    title: {
        color: colors.black,
        fontSize: 24,
        lineHeight: 34,
        ...fontStyles.bold
    },
    subtitle: {
        fontSize: 14,
        lineHeight: 20,
        color: colors.grey500,
        marginTop: 8,
        textAlign: 'center',
        ...fontStyles.normal
    },
    errorContainer: {
        backgroundColor: colors.red000,
        borderRadius: 8,
        marginTop: 24
    },
    error: {
        color: colors.black,
        padding: 8,
        fontSize: 14,
        lineHeight: 20,
        ...fontStyles.normal
    },
    button: {
        marginTop: 24,
        borderColor: colors.blue,
        borderWidth: 1,
        borderRadius: 50,
        padding: 12,
        paddingHorizontal: 34
    },
    buttonText: {
        color: colors.blue,
        textAlign: 'center',
        ...fontStyles.normal,
        fontWeight: '500'
    },
    textContainer: {
        marginTop: 24
    },
    text: {
        color: colors.black,
        fontSize: 14,
        lineHeight: 20,
        ...fontStyles.normal
    },
    link: {
        color: colors.blue
    },
    reportTextContainer: {
        paddingLeft: 14,
        marginTop: 16,
        marginBottom: 24
    },
    reportStep: {
        marginTop: 14
    }
});

export default assignNestedObj(styles, brandStyles);
