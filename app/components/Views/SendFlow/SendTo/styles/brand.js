import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import Device from '../../../../../util/Device';

const deviceHeight = Device.getDeviceHeight();
const breakPoint = deviceHeight < 700;

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.black
	},
	inputWrapper: {
		paddingVertical: 20
	}
});

export { brandStyles };
