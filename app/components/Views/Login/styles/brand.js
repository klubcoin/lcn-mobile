import { StyleSheet } from 'react-native';
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
		color: colors.white
	},
	inputContainer: {
		color: colors.white,
		paddingTop: 10,
		paddingLeft: 15,
		borderRadius: 10,
		backgroundColor: colors.purple
	},
	cant: {
		color: colors.white
	},
	placeholder: {
		color: colors.white
	}
});

export default brandStyles;
