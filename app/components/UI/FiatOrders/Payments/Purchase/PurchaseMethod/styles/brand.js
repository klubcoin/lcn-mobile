import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../../../styles/common';

const brandStyles = StyleSheet.create({
    card: {
        backgroundColor: colors.purple,
        borderWidth: 0,
        padding: 15,
        marginBottom: 20,
    },
    paypal: {
        ...fontStyles.bold,
        fontSize: 22
    },
    imageContainer: {
        width: 50,
        height: 50,
        backgroundColor: colors.primaryFox,
        alignItems: 'center',
        justifyContent: 'center',
        marginRight: 10,
        borderRadius: 100
    }
});

export default brandStyles;
