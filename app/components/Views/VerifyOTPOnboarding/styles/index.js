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
	text: {},
	mainWrapper: {},
	wrapper: {},
	emoji: {},
	congratulations: {},
	congratulationsText: {},
	learnMore: {},
	footer: {}
});

export default assignNestedObj(styles, brandStyles);
