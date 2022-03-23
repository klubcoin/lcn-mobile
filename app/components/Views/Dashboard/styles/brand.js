import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const deviceHeight = Device.getDeviceHeight();
const breakPoint = deviceHeight < 700;

const brandStyles = StyleSheet.create({
	comingSoon: {
		color: colors.white,
		fontWeight: 'bold',
		fontSize: 16
	},
	chartBox: {
		padding: 15,
		backgroundColor: colors.lightPurple,
		borderRadius: 10,
		marginBottom: 20,
		height: 250
	}
});

export default brandStyles;
