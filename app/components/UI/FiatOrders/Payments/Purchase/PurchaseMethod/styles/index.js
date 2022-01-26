import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../../../styles/common';
import { assignNestedObj } from '../../../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
    card: {
        borderRadius: 12,
        borderColor: colors.blue,
        borderWidth: 1,
        padding: 10,
        backgroundColor: colors.blue
    },
    title: {
        flexDirection: 'row',
        alignItems: 'center'
    },
    paypal: {
        color: colors.white,
        fontSize: 24
    },
    creditCard: {
        paddingTop: 10,
        paddingBottom: 10,
        fontWeight: 'bold',
        color: colors.white
    },
    fee: {
        color: colors.white,
        marginBottom: 20
    },
    paypalIc: {
        width: 20,
        height: 20,
    },
    imageContainer: {}
});

export default assignNestedObj(styles, brandStyles);
