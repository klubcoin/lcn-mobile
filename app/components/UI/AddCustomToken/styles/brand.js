import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.transparent,
		flex: 1
	},
	textInput: {
		borderWidth: 1,
		borderRadius: 4,
		borderColor: colors.grey100,
		padding: 16,
		color: colors.white,
		...fontStyles.normal
	},
	tokenAddress: {
		color: colors.white
	}
});

export { brandStyles };
