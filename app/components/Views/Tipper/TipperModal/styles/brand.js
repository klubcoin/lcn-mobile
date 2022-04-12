import { StyleSheet } from 'react-native';
import { colors } from '../../../../../styles/common';

const styles = StyleSheet.create({
	// overwrite theme for brand here
	root: {
		backgroundColor: colors.lightPurple
	},
	transactionHeaderTitle: {
		color: colors.white
	},
	transactionHeaderIcon: {
		color: colors.white
	},
	transactionHeaderName: {
		color: colors.white
	},
	message: {
		color: colors.white
	},
	address: {
		color: colors.white
	},
	amountInput: {
		backgroundColor: colors.purple,
		marginHorizontal: 36,
		borderRadius: 10,
		paddingVertical: 8
	},
	input: {
		color: colors.white,
		fontWeight: 'bold'
	},
	eth: {
		color: colors.white,
		fontWeight: 'bold'
	},
	enterAmount: {
		color: colors.white,
		alignSelf: 'center',
		marginTop: 20
	}
});

export default styles;
