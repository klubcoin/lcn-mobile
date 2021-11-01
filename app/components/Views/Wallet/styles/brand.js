import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/brand';
import Device from '../../../../util/Device';

const deviceHeight = Device.getDeviceHeight();
const breakPoint = deviceHeight < 700;

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.transparent
	},
	tabUnderlineStyle: {
		height: 4,
		backgroundColor: colors.blue
	},
	textStyle: {
		fontSize: 14
	},
	imgBackground: {
		width: Device.getDeviceWidth(),
		height: Device.getDeviceHeight(),
		backgroundColor: colors.black
	}
});

export { brandStyles };
