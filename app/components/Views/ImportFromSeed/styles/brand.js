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
		backgroundColor: colors.purple,
		borderWidth: 0,
		color: colors.white
	},
	passwordStrengthLabel: {
		color: colors.fontError,
		height: 'auto'
	},
	inputContainerStyle: {
		backgroundColor: colors.purple,
		borderRadius: 15,
		textAlign: 'center',
		borderTopLeftRadius: 15,
		borderTopRightRadius: 15
	},
	biometricTop: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 20
	},
	biometricBottom: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 10,
		marginBottom: 30
	},
	passwordValidateTitle: {
		color: colors.white,
		fontSize: 14,
	},
	passwordItemWrapper: {
		flexDirection: 'row',
		marginTop:2,
		alignItems:'center'
	},
	passwordItemText: {
		color: colors.white,
		fontSize:12,
		marginLeft:4,
	},
	passwordItemTextError: {
		color: colors.fontError,
		fontSize:12,
		marginLeft:4,
	},
	passwordItemIcon: {
		width:12,
		height:12,
		color:colors.success,
	}
});

export default brandStyles;
