import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: colors.transparent
	},
	textInput: {
		borderWidth: 1,
		borderRadius: 4,
		borderColor: colors.grey100,
		padding: 16,
		...fontStyles.normal,
		color: colors.white
	}
});

export { brandStyles };
