import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.transparent
	},
	descriptionText: {
		color: colors.white
	},
	qrCode: {
		color: colors.red
	}
});

export default brandStyles;
