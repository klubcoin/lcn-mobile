import { RFValue } from 'react-native-responsive-fontsize';
import { colors, fontStyles } from '../../../../../styles/common';
import { StyleSheet } from 'react-native';
import brandStyles from './brand';
import { assignNestedObj } from '../../../../../util/object';

const styles = StyleSheet.create({
    wrapper: {
        padding: 15,
    },
    question: {
        fontSize: RFValue(24),
        ...fontStyles.bold,
        color: colors.white,
        marginBottom: 15,
    },
    answer: {
        fontSize: RFValue(14),
        color: colors.white,
        ...fontStyles.normal,
        lineHeight: 24
    }
});

export default assignNestedObj(styles, brandStyles);