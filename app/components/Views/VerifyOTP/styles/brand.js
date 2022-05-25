import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';

const brandStyles = StyleSheet.create({
	wrapper: {
		paddingHorizontal: 12,
		marginTop: 80
	},
	title: {
		color: colors.white,
		fontSize: 20,
		fontWeight: '700'
	},
	resendButton: {},
	textWrapper: {
		fontSize: 16,
		color: colors.white,
		marginTop: 15
	},
	text: {},
	resendText: {
		textDecorationLine: 'underline'
	},
	errorText: {
		fontSize: 16,
		color: colors.fontError,
		marginTop: 10
	},
	errorText2: {
		fontSize: 16,
		color: colors.blue,
		marginTop: 10
	},
	errorTextBold: {
		fontSize: 16,
		color: colors.fontError,
		marginTop: 10,
		fontWeight: 'bold'
	},
	skipButton: {
		marginBottom: 24
	},
	loadingWrapper: {
		paddingHorizontal: 20,
		height: '100%'
	},
	loadingWrapper1: {
		marginTop: 12
	}
});

export default brandStyles;
