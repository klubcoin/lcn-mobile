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
		color: colors.white,
		paddingHorizontal: 0
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
		height: 'auto'
	},
	subTextColor: {
		color: colors.grey300
	},
	newPwdTitle: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	field: {
		marginVertical: 0
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
	},
	passwordValidateTitle: {
		color: colors.white,
		fontSize: 14,
		marginTop: 6
	},
	passwordItemWrapper: {
		flexDirection: 'row',
		marginTop: 2,
		alignItems: 'center'
	},
	passwordItemText: {
		color: colors.white,
		fontSize: 12,
		marginLeft: 4
	},
	passwordItemTextError: {
		color: colors.fontError,
		fontSize: 12,
		marginLeft: 4
	},
	passwordItemIcon: {
		width: 12,
		height: 12,
		color: colors.success
	},
	iUnderstandWrapper: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		paddingHorizontal: 10
	}
});

export default brandStyles;
