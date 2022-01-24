import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import Device from '../../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		flexDirection: 'column'
	},
	label: {},
	labelText: {
		...fontStyles.bold,
		color: colors.white
	},
	textInput: {
		color: colors.white
	},
	textAddress: {
		color: colors.white
	},
	textBalance: {
		color: colors.white
	},
	inputWrapper: {
		flex: 0,
		borderWidth: 0,
		backgroundColor: colors.purple,
		paddingVertical: 14,
		paddingHorizontal: 12
	},
	selectWrapper: {
		flex: 0,
		borderWidth: 0,
		backgroundColor: colors.purple,
		paddingVertical: 14,
		paddingHorizontal: 12
	},
	borderHighlighted: {},
	borderOpaque: {},
	address: {
		alignItems: 'center'
	},
	textAddress: {
		...fontStyles.bold,
		color: colors.white,
		fontSize: 20
	},
	iconOpaque: {
		color: colors.white
	},
});

export default brandStyles;
