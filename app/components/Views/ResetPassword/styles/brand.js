import { StyleSheet } from 'react-native';
import Device from '../../../../util/Device';
import { colors, fontStyles } from '../../../../styles/common';

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.transparent
	},
	confirm_input: {
		color: colors.white,
		backgroundColor: colors.purple,
		borderWidth: 0,
		borderRadius: 12
	},
	button: {
		borderRadius: 12,
		width: '100%'
	},
	buttonWrapper: {
		flex: 1,
		marginTop: 20,
		justifyContent: 'flex-end',
		width: '100%'
	},
	label: {
		...fontStyles.normal,
		fontSize: 14,
		color: colors.white,
		paddingHorizontal: 10,
		lineHeight: 18
	},
	input: {
		borderWidth: 0,
		padding: 10,
		fontSize: 14,
		height: 50,
		backgroundColor: colors.purple,
		borderRadius: 12,
		color: colors.white,
		...fontStyles.normal
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
	passwordValidateTitle: {
		color: colors.white,
		fontSize: 14,
		marginTop: 6
	},
	passwordStrengthLabel: {
		color: colors.fontError,
		height: 'auto'
	}
});

export default brandStyles;
