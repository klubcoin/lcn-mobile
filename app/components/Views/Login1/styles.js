import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../styles/common';
import Device from '../../../util/Device';

const deviceHeight = Device.getDeviceHeight();
const breakPoint = deviceHeight < 700;

const styles = StyleSheet.create({
	mainWrapper: {
		flex: 1,
		backgroundColor: colors.black
	},
	wrapper: {
		flex: 1,
		paddingHorizontal: 32
	},
	foxWrapper: {
		justifyContent: 'center',
		alignSelf: 'center',
		width: Device.isIos() ? 130 : 100,
		height: Device.isIos() ? 130 : 100,
		marginTop: 100
	},
	image: {
		alignSelf: 'center',
		width: Device.isIos() ? 200 : 100,
		height: Device.isIos() ? 200 : 100
	},
	title: {
		fontSize: Device.isAndroid() ? 30 : 35,
		marginTop: 20,
		marginBottom: 20,
		color: colors.white,
		justifyContent: 'center',
		textAlign: 'center',
		...fontStyles.bold,
		marginVertical: 35
	},
	field: {
		flex: 1,
		marginBottom: Device.isAndroid() ? 0 : 10,
		flexDirection: 'column'
	},
	label: {
		color: colors.white,
		fontSize: 16,
		marginBottom: 12,
		...fontStyles.bold
	},
	ctaWrapper: {
		marginTop: 20
	},
	footer: {
		marginVertical: 40
	},
	errorMsg: {
		color: colors.red,
		...fontStyles.normal,
		lineHeight: 20
	},
	goBack: {
		marginVertical: 14,
		color: colors.white,
		...fontStyles.bold
	},
	biometrics: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 20,
		marginBottom: 30
	},
	biometryLabel: {
		flex: 1,
		fontSize: 16,
		color: colors.white,
		...fontStyles.bold
	},
	biometrySwitch: {
		flex: 0,
		color: colors.white
	},
	input: {
		...fontStyles.normal,
		fontSize: 16,
		paddingTop: 2,
		color: colors.white
	},
	inputContainer: {
		color: colors.white,
		borderWidth: 2,
		paddingTop: 10,
		paddingLeft: 15,
		borderRadius: 50,
		borderColor: colors.white,
		backgroundColor: colors.grey,
		shadowColor: colors.white,
		shadowOpacity: 0.7,
		shadowRadius: 12,
		shadowOffset: {
			height: 1
		}
	},
	cant: {
		width: 280,
		alignSelf: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		...fontStyles.normal,
		fontSize: 16,
		lineHeight: 24,
		color: colors.white
	},
	areYouSure: {
		width: '100%',
		padding: breakPoint ? 16 : 24,
		justifyContent: 'center',
		alignSelf: 'center'
	},
	heading: {
		marginHorizontal: 6,
		color: colors.black,
		...fontStyles.bold,
		fontSize: 20,
		textAlign: 'center',
		lineHeight: breakPoint ? 24 : 26
	},
	red: {
		marginHorizontal: 24,
		color: colors.red
	},
	warningText: {
		...fontStyles.normal,
		textAlign: 'center',
		fontSize: 14,
		lineHeight: breakPoint ? 18 : 22,
		color: colors.black,
		marginTop: 20
	},
	warningIcon: {
		alignSelf: 'center',
		color: colors.red,
		marginVertical: 10
	},
	bold: {
		...fontStyles.bold
	},
	delete: {
		marginBottom: 20
	},
	deleteWarningMsg: {
		...fontStyles.normal,
		fontSize: 16,
		lineHeight: 20,
		marginTop: 10,
		color: colors.red
	},
	placeholder: {
		color: colors.white
	}
});

export { styles };
