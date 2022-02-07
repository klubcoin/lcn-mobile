import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.purple,
		flex: 1
	},
	bottom: {
		backgroundColor: colors.primaryFox
	},
	textColor: {
		color: colors.fontPrimary
	},
	subtitleText: {
		color: colors.fontPrimary
	},
	input: {
		backgroundColor: colors.purple,
		borderColor: colors.white,
		borderWidth: 0,
		borderRadius: 12,
		...fontStyles.normal,
		color: colors.white
	},
	buttonWrapper: {
		backgroundColor: colors.primaryFox
	}
});

export default brandStyles;
