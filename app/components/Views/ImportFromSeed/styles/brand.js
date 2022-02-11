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
		borderWidth:0,
		color: colors.white
	},
	passwordStrengthLabel: {
		color: colors.fontError,
		height:'auto'
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
	}
});

export default brandStyles;
