import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from "./brand";

const styles = StyleSheet.create({
    wrapper: {
        backgroundColor: colors.transparent,
        flex: 1,
        paddingHorizontal: 15,
        zIndex: 99999999999999
    },
    loading: {
        position: 'absolute',
        left: 0,
        right: 0,
        top: 0,
        bottom: 0,
        alignItems: 'center',
        justifyContent: 'center'
    }
});

export default assignNestedObj(styles, brandStyles);