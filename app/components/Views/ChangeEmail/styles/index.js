import { StyleSheet } from 'react-native';
import Device from '../../../../util/Device';
import { colors, fontStyles } from '../../../../styles/common';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.white,
		flex: 1
	},
	scrollviewWrapper: {
		flexGrow: 1
	},
	confirm_title: {
		fontSize: 32,
		marginTop: 10,
		marginBottom: 10,
		color: colors.fontPrimary,
		justifyContent: 'center',
		textAlign: 'left',
		...fontStyles.normal
	},
	confirm_input: {
		borderWidth: 2,
		borderRadius: 5,
		width: '100%',
		borderColor: colors.grey000,
		padding: 10,
		height: 40
	},
	confirm_label: {
		fontSize: 16,
		lineHeight: 23,
		color: colors.fontPrimary,
		textAlign: 'left',
		...fontStyles.normal
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
	passwordRequiredContent: {
		marginBottom: 20
	},
	content: {
		alignItems: 'flex-start'
	},
	title: {
		fontSize: 24,
		marginTop: 20,
		marginBottom: 20,
		color: colors.fontPrimary,
		justifyContent: 'center',
		textAlign: 'center',
		width: '100%',
		...fontStyles.normal
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
		fontSize: 14,
		color: colors.fontPrimary,
		position: 'absolute',
		top: 0,
		left: 0
	},
	biometrySwitch: {
		position: 'absolute',
		top: 0,
		right: 0
	},
	hintLabel: {
		height: 20,
		marginTop: 14,
		fontSize: 12,
		color: colors.grey450,
		textAlign: 'left',
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
		top: 50,
		right: 17,
		alignSelf: 'flex-end'
	},
	confirmPasswordWrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 0
	},
	buttonWrapper: {
		flex: 1,
		marginTop: 20,
		justifyContent: 'flex-end'
	},
	warningMessageText: {
		paddingVertical: 10,
		color: colors.red,
		...fontStyles.normal
	},
	keyboardAvoidingView: {
		flex: 1,
		flexDirection: 'row',
		alignSelf: 'center'
	},
	textInputWrapperStyle: {},
	textContainerStyle: {},
	errorText: {}
});

export default assignNestedObj(styles, brandStyles);
