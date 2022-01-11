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
		color: colors.white,
		fontWeight: 'bold'
	},
	input: {
		color: colors.white,
		alignSelf: 'center'
	},
	inputFocused: {
		borderColor: colors.transparent
	},
	seedPhrase: {
		backgroundColor: colors.grey,
		borderColor: colors.white,
		color: colors.white
	},
	passwordStrengthLabel: {
		color: colors.white
	},
	inputContainerStyle: {
		backgroundColor: colors.purple,
		borderRadius: 15,
		textAlign: 'center'
	}
});

export default brandStyles;
