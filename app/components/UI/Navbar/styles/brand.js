import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	header: {
		color: colors.black
	},
	backIcon: {
		color: colors.black
	},
	closeButtonText: {
		color: colors.black
	},
	centeredTitle: {
		color: colors.black,
		...fontStyles.bold
	}
});

export default brandStyles;
