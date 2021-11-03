import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const styles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.white,
		flex: 1
	},
	wrapper: {
		flex: 1,
		marginBottom: 10
	},
	scrollableWrapper: {
		flex: 1,
		paddingHorizontal: 32
	},
	keyboardScrollableWrapper: {
		flexGrow: 1
	},
	loadingWrapper: {
		paddingHorizontal: 40,
		paddingBottom: 30,
		alignItems: 'center',
		flex: 1
	},
	foxWrapper: {
		width: Device.isIos() ? 90 : 80,
		height: Device.isIos() ? 90 : 80,
		marginTop: 30,
		marginBottom: 30
	},
	image: {
		alignSelf: 'center',
		width: 80,
		height: 80
	},
	content: {
		textAlign: 'center',
		alignItems: 'center'
	},
	title: {
		fontSize: Device.isAndroid() ? 20 : 25,
		marginTop: 20,
		marginBottom: 20,
		color: colors.fontPrimary,
		justifyContent: 'center',
		textAlign: 'center',
		...fontStyles.bold
	},
	subtitle: {
		fontSize: 16,
		lineHeight: 23,
		color: colors.fontPrimary,
		textAlign: 'center',
		...fontStyles.normal
	},
	text: {
		marginBottom: 10,
		justifyContent: 'center',
		...fontStyles.normal
	},
	or: {
		marginVertical: 20,
		textAlign: 'center',
		fontWeight: '600'
	},
	checkboxContainer: {
		marginTop: 10,
		marginHorizontal: 10,
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row'
	},
	checkbox: {
		width: 18,
		height: 18,
		margin: 10,
		marginTop: -5
	},
	label: {
		...fontStyles.normal,
		fontSize: 14,
		color: colors.black,
		paddingHorizontal: 10,
		lineHeight: 18
	},
	learnMore: {
		color: colors.blue,
		textDecorationLine: 'underline',
		textDecorationColor: colors.blue
	},
	field: {
		marginVertical: 5,
		position: 'relative'
	},
	input: {
		borderWidth: 1,
		borderColor: colors.grey500,
		padding: 10,
		borderRadius: 6,
		fontSize: 14,
		height: 50,
		...fontStyles.normal
	},
	ctaWrapper: {
		flex: 1,
		marginTop: 20,
		paddingHorizontal: 10
	},
	errorMsg: {
		color: colors.red,
		...fontStyles.normal
	},
	biometrics: {
		position: 'relative',
		marginTop: 20,
		marginBottom: 30
	},
	biometryLabel: {
		flex: 1,
		fontSize: 16,
		color: colors.black,
		...fontStyles.normal
	},
	biometrySwitch: {
		position: 'absolute',
		top: 0,
		right: 0
	},
	hintLabel: {
		color: colors.black,
		fontSize: 16,
		marginBottom: 12,
		...fontStyles.normal
	},
	passwordStrengthLabel: {
		height: 20,
		marginTop: 10,
		fontSize: 15,
		color: colors.black,
		...fontStyles.normal
	},
	showPassword: {
		position: 'absolute',
		top: 0,
		right: 0
	},
	// eslint-disable-next-line react-native/no-unused-styles
	strength_weak: {
		color: colors.red
	},
	// eslint-disable-next-line react-native/no-unused-styles
	strength_good: {
		color: colors.blue
	},
	// eslint-disable-next-line react-native/no-unused-styles
	strength_strong: {
		color: colors.green300
	},
	showMatchingPasswords: {
		position: 'absolute',
		top: 52,
		right: 17,
		alignSelf: 'flex-end'
	}
});

export { styles };
