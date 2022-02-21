import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.white,
		flex: 1
	},
	wrapper: {
		flex: 1,
		paddingHorizontal: 32
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
	field: {
		marginVertical: 5,
		position: 'relative'
	},
	fieldRow: {
		flexDirection: 'row',
		alignItems: 'flex-end'
	},
	fieldCol: {
		width: '70%'
	},
	fieldColRight: {
		flexDirection: 'row-reverse',
		width: '30%'
	},
	label: {
		color: colors.black,
		fontSize: 16,
		marginBottom: 12,
		...fontStyles.normal
	},
	ctaWrapper: {
		marginTop: 20
	},
	errorMsg: {
		color: colors.red,
		textAlign: 'center',
		...fontStyles.normal
	},
	seedPhrase: {
		marginBottom: 10,
		paddingTop: 20,
		paddingBottom: 20,
		paddingHorizontal: 20,
		fontSize: 20,
		borderRadius: 10,
		minHeight: 110,
		height: 'auto',
		borderWidth: 1,
		borderColor: colors.grey500,
		backgroundColor: colors.white,
		...fontStyles.normal
	},
	inputContainerStyle: {
		paddingRight: 46
	},
	biometricTop: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 20
	},
	biometricBottom: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 10,
		marginBottom: 30
	},
	biometrics: {
		alignItems: 'flex-start',
		marginTop: 10
	},
	biometryLabel: {
		flex: 1,
		fontSize: 16,
		color: colors.black,
		...fontStyles.normal
	},
	biometrySwitch: {
		marginTop: 10,
		flex: 0
	},
	termsAndConditions: {
		paddingVertical: 10
	},
	passwordStrengthLabel: {
		height: 20,
		fontSize: 15,
		color: colors.black,
		...fontStyles.normal
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
	},
	qrCode: {
		marginRight: 10,
		borderWidth: 1,
		borderRadius: 6,
		borderColor: colors.grey100,
		paddingVertical: 4,
		paddingHorizontal: 6,
		marginTop: -50,
		marginBottom: 30,
		alignSelf: 'flex-end'
	},
	inputFocused: {
		borderColor: colors.blue,
		borderWidth: 2
	},
	input: {
		...fontStyles.normal,
		fontSize: 16,
		paddingTop: 2
	},
	passwordValidateTitle:{},
	passwordItemWrapper:{},
	passwordItemText:{},
	passwordItemTextError:{},
	passwordItemIcon:{},
});

export default assignNestedObj(styles, brandStyles);
