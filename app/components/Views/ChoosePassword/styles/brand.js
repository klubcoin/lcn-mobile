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
		color: colors.white,
		...fontStyles.bold
	},
	label: {
		color: colors.white
	},
	input: {
		color: colors.white,
		borderWidth: 0,
		backgroundColor: colors.purple
	},
	colorText: {
		color: colors.white
	},
	passwordStrengthLabel: {
		color: colors.grey300
	},
	subTextColor: {
		color: colors.grey300
	},
	newPwdTitle: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	}
});

export default brandStyles;
