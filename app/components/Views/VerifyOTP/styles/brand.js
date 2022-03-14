import { collectStoredAnnotations } from 'mobx/dist/internal';
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
	resendText: {
		color: colors.white,
		fontSize: 20,
		fontWeight: 'bold'
	},
	textWrapper: {
		fontSize: 16,
		color: colors.white,
		marginTop:10
	},
	text: {
	},
	resendText: {
		textDecorationLine: 'underline'
	},
	errorText: {
		fontSize: 16,
		color: colors.fontError,
		marginTop:10
	}
});

export default brandStyles;
