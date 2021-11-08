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
	label: {
		color: colors.white
	},
	input: {
		color: colors.white
	},
	seedPhrase: {
		backgroundColor: colors.grey,
		borderColor: colors.white,
		color: colors.white
	},
	passwordStrengthLabel: {
		color: colors.white
	}
});

export default brandStyles;
