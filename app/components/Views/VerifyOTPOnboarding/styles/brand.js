import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';

const brandStyles = StyleSheet.create({
	emailWrapper: {
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
	mainWrapper: {
		backgroundColor: colors.transparent,
		flex: 1
	},
	wrapper: {
		flex: 1,
		marginBottom: 10,
		marginTop: 30
	},
	emoji: {
		textAlign: 'center',
		fontSize: 65,
		marginBottom: 16
	},
	congratulations: {
		color: colors.white,
		fontSize: 30,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	congratulationsText: {
		color: colors.white,
		fontSize: 16,
		marginHorizontal: 20,
		marginTop: 30,
		textAlign: 'center',
		fontWeight: '600'
	},
	learnMore: {
		color: colors.blue,
		fontSize: 16,
		fontWeight: '700',
		textAlign: 'center',
		marginTop: 30,
		marginBottom: 20
	},
	footer: {
		flex: 1,
		width: '100%',
		justifyContent: 'flex-end',
		padding: 12
	},
	skipButton: {
		marginTop: 12
	},
	loadingWrapper: {
		paddingHorizontal: 20,
		height: '100%'
	},
	loadingWrapper1: {
		marginTop: 12
	},
	flexGrow: {
		flexGrow: 1
	},
	buttonWrapper: {
		flex: 1,
		width: '100%',
		justifyContent: 'flex-end',
		padding: 12
	}
});

export default brandStyles;
