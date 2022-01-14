import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import Device from '../../../../../util/Device';

const brandStyles = StyleSheet.create({
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
	}
});

export default brandStyles;