import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.transparent
	},
	biometryLabel: {
		color: colors.white,
		fontWeight: 'bold'
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
		backgroundColor: colors.purple,
		height: 45
	},
	colorText: {
		color: colors.white
	},
	passwordStrengthLabel: {
		color: colors.fontError,
		height:'auto'
	},
	subTextColor: {
		color: colors.grey300
	},
	newPwdTitle: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	field: {
		marginVertical: 0,
	},
	usernameField: {
		marginTop: 30
	},
	biometricsContainer: {
		flexDirection: 'row',
		paddingVertical: 10,
		paddingHorizontal: 5,
		alignItems: 'center',
		justifyContent: 'space-between'
	},
	biometrySwitch: {
		position: 'relative'
	}
});

export default brandStyles;
