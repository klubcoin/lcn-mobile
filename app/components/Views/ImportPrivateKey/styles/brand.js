import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.grey,
		flex: 1
	},
	bottom: {
		backgroundColor: colors.black
	},
	textColor: {
		color: colors.fontPrimary
	},
	input: {
		backgroundColor: colors.grey,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.white,
		...fontStyles.normal,
		color: colors.white
	},
	buttonWrapper: {
		backgroundColor: colors.black
	}
});

export { brandStyles };
