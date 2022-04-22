import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';

const brandStyles = StyleSheet.create({
	container: {
		flexGrow: 1,
		paddingHorizontal: 20,
		paddingBottom: 12,
		paddingTop: 36
	},
	description: {
		color: colors.grey100,
		fontSize: 18
	},
	itemWrapper: {
		backgroundColor: colors.lightPurple,
		padding: 20,
		marginTop: 12,
		borderRadius: 12
	},
	itemHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 12
	},
	iconWrapper: {
		backgroundColor: colors.purple500,
		borderRadius: 100,
		marginRight: 20,
		padding: 12
	},
	icon: {
		width: 32,
		height: 32
	},
	itemHeaderText: {
		color: colors.white,
		fontSize: 28,
		fontWeight: 'bold'
	},
	itemDescription: {
		color: colors.grey100,
		fontSize: 18
	},
	tradeButton: {
		backgroundColor: colors.white,
		borderRadius: 12,
		marginTop: 16,
		alignItems: 'center'
	},
	tradeButtonText: {
		color: colors.purple,
		fontSize: 18,
		fontWeight: 'bold',
		padding: 12
	}
});

export default brandStyles;
