import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	header: {
		color: colors.fontPrimary
	},
	backIcon: {
		color: colors.black
	},
	closeButtonText: {
		color: colors.blue
	},
	centeredTitle: {
		...fontStyles.bold
	}
});

export default brandStyles;
