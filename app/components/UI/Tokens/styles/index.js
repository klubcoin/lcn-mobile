import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1,
		minHeight: 500
	},
	emptyView: {
		backgroundColor: colors.white,
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 50
	},
	tokensHome: {
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 35,
		marginHorizontal: 50
	},
	tokensHomeText: {
		...fontStyles.normal,
		marginBottom: 15,
		marginHorizontal: 15,
		fontSize: 18,
		color: colors.fontPrimary,
		textAlign: 'center'
	},
	tokensHomeButton: {
		width: '100%'
	},
	text: {
		fontSize: 20,
		color: colors.fontTertiary,
		...fontStyles.normal
	},
	add: {
		margin: 20,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center'
	},
	addText: {
		fontSize: 15,
		color: colors.blue,
		...fontStyles.normal
	},
	footer: {
		flex: 1,
		paddingBottom: 30
	},
	row: {
		flex: 1,
		flexDirection: 'row'
	},
	name: {
		fontSize: 16,
		color: colors.fontPrimary,
		...fontStyles.normal
	},
	desc: {
		fontSize: 12,
		color: colors.fontSecondary,
		...fontStyles.normal
	},
	balances: {
		flex: 1,
		justifyContent: 'center'
	},
	balance: {
		fontSize: 16,
		color: colors.fontPrimary,
		...fontStyles.normal,
		textTransform: 'uppercase'
	},
	balanceFiat: {
		fontSize: 12,
		color: colors.fontSecondary,
		...fontStyles.normal,
		textTransform: 'uppercase'
	},
	balanceFiatTokenError: {
		textTransform: 'capitalize'
	},
	ethLogo: {
		width: 50,
		height: 50,
		overflow: 'hidden',
		marginRight: 20
	}
});

export { styles };
