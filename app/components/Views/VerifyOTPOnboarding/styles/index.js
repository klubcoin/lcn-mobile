import { StyleSheet } from 'react-native';
import brandStyles from './brand';
import { assignNestedObj } from '../../../../util/object';

const styles = StyleSheet.create({
	emailWrapper: {},
	title: {},
	resendButton: {},
	resendText: {},
	textWrapper: {},
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
	skipButton: {},
	loadingWrapper: {},
	loadingWrapper1: {}
});

export default assignNestedObj(styles, brandStyles);
