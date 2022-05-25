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
	},
	container: {
		backgroundColor: colors.lightPurple,
		borderWidth: 0,
		borderRadius: 12
	},
	input: {
		backgroundColor: colors.lightPurple,
		color: colors.white,
		flex: 1
	},
	amounts: {
		flex: 1,
		maxWidth: '100%'
	},
	ethContainer: {},
	eth: {
		color: colors.white
	}
});

export default styles;
