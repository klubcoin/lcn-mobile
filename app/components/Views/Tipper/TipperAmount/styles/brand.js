import { StyleSheet } from 'react-native';
import { colors } from '../../../../../styles/common';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.purple,
		flex: 1
	},
	title: {
		color: colors.white
	},
	currencySymbol: {
		color: colors.white
	},
	currencySymbolSmall: {
		color: colors.white
	},
	assetsTitle: {
		color: colors.white
	},
	errorWrapper: {
		padding: 16,
		justifyContent: 'flex-start',
		borderColor: colors.red,
		borderWidth: 1
	},
	errorText: {
		alignSelf: 'flex-start',
		color: colors.red
	}
});

export default styles;
