import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.transparent
	},
	biometryLabel: {
		color: colors.white
	},
	or: {
		color: colors.white
	},
	hintLabel: {
		color: colors.white
	},
	label: {
		color: colors.white
	},
	input: {
		color: colors.white
	},
	colorText: {
		color: colors.white
	},
	passwordStrengthLabel: {
		color: colors.grey300
	},
	subTextColor: {
		color: colors.grey300
	}
});

export default brandStyles;
