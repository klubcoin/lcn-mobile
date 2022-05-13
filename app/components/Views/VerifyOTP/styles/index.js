import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import brandStyles from './brand';
import { assignNestedObj } from '../../../../util/object';

const styles = StyleSheet.create({
	wrapper: {},
	title: {},
	resendButton: {},
	resendText: {},
	textWrapper: {},
	errorText: {},
	errorTextBold: {},
	errorText2: {},
	text: {},
	skipButton: {},
	loadingWrapper: {},
	loadingWrapper1: {}
});

export default assignNestedObj(styles, brandStyles);
