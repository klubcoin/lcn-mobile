import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import brandStyles from './brand';
import { assignNestedObj } from '../../../../util/object';

const styles = StyleSheet.create({
	wrapper: {},
	title: {},
	resendButton: {},
	resendText: {}
});

export default assignNestedObj(styles, brandStyles);
