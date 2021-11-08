import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const deviceHeight = Device.getDeviceHeight();
const breakPoint = deviceHeight < 700;

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.black
	},
	tabUnderlineStyle: {
		height: 4,
		backgroundColor: colors.blue
	},
	textStyle: {
		fontSize: 14
	},
	imgBackground: {
		backgroundColor: colors.black,
		flex: 1
	}
});

export default brandStyles;
