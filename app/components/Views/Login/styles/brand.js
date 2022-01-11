import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const deviceHeight = Device.getDeviceHeight();
const breakPoint = deviceHeight < 700;

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.transparent
	},
	foxWrapper: {
		marginTop: 50
	},
	title: {
		fontSize: 30,
		marginVertical: 35,
		color: colors.white
	},
	label: {
		color: colors.white,
		...fontStyles.bold
	},
	goBack: {
		...fontStyles.bold
	},
	biometryLabel: {
		color: colors.white,
		...fontStyles.bold
	},
	biometrySwitch: {
		color: colors.white
	},
	input: {
		color: colors.black,
		alignSelf: 'center',
		padding: 0
	},
	inputContainer: {
		color: colors.black,
		// paddingTop: 10,
		paddingLeft: 15,
		borderRadius: 15,
		backgroundColor: colors.lightPink,
		textAlign: 'center'
	},
	cant: {
		color: colors.white
	},
	placeholder: {
		color: colors.white
	},
	delete: {
		color: colors.red
	},
	inputContainerStyle: {
		backgroundColor: colors.transparent,
		borderRadius: 15,
		textAlign: 'center'
	}
});

export default brandStyles;
