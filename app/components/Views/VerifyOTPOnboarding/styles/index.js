import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import brandStyles from './brand';
import { assignNestedObj } from '../../../../util/object';

const styles = StyleSheet.create({
	emailWrapper: {},
	title: {},
	resendButton: {},
	resendText: {},
	textWrapper: {},
	resendText: {},
	errorText: {},
	errorTextBold: {},
	errorText2: {},
	text: {},
	mainWrapper: {},
	wrapper: {},
	emoji: {},
	congratulations: {},
	congratulationsText: {},
	learnMore: {},
	footer: {},
	skipButton: {}
});

export default assignNestedObj(styles, brandStyles);
