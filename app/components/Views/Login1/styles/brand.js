import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const deviceHeight = Device.getDeviceHeight();
const breakPoint = deviceHeight < 700;

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.transparent
	},
	image: {
		width: Device.isIos() ? 200 : 100,
		height: Device.isIos() ? 200 : 100
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
		color: colors.white,
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
		color: colors.white
	},
	placeholder: {
		color: colors.white
	}
});

export { brandStyles };
