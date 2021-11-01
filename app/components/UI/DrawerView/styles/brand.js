import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/brand';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.black
	},
	accountName: {
		color: colors.grey,
		...fontStyles.bold
	},
	caretDown: {
		color: colors.black
	},
	accountAddress: {
		color: colors.grey,
		...fontStyles.bold
	},
	buttonText: {
		color: colors.white,
		...fontStyles.bold
	},
	menuItemName: {
		color: colors.fontPrimary
	},
	identiconBorder: {
		borderColor: colors.blue
	}
});

export { brandStyles };
