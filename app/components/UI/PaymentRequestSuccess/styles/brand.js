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
	},
	blueButtonText: {
		color: colors.black
	},
	blueIcon: {
		color: colors.black
	},
	buttonTextWrapper: {
		color: colors.black
	},
	buttonText: {
		color: colors.black
	},
	titleText: {
		color: colors.white
	}
});

export default brandStyles;
