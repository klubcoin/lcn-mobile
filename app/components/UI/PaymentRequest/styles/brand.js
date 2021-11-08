import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.transparent
	},
	title: {
		color: colors.fontPrimary,
		...fontStyles.bold
	},
	assetsTitle: {
		color: colors.white
	},
	container: {
		backgroundColor: colors.grey
	},
	input: {
		backgroundColor: colors.grey,
		color: colors.white
	},
	eth: {
		color: colors.white
	}
});

export default brandStyles;
