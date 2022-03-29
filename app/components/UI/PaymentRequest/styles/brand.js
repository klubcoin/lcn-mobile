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
		color: colors.white,
		marginBottom: 10
	},
	container: {
		backgroundColor: colors.purple,
		borderWidth: 0,
		borderRadius:12
	},
	input: {
		backgroundColor: colors.grey,
		color: colors.white
	},
	eth: {
		color: colors.white
	},
	button: {
		paddingVertical: 12
	},
	fiatValue: {
		color: colors.white
	},
	currencySymbolSmall: {
		color: colors.white
	}
});

export default brandStyles;
