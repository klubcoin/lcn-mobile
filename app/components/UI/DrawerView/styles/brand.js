import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.primaryFox
	},
	account: {
		paddingTop: 40,
		backgroundColor: colors.primaryFox
	},
	accountName: {
		color: colors.white,
		fontSize: RFValue(20)
	},
	avatar: {
		width: 60,
		height: 60,
		borderRadius: 90,
		borderWidth: 5,
		borderColor: colors.purple
	},
	caretDown: {
		color: colors.white
	},
	accountNameWrapper: {
		flexDirection: 'column',
		marginLeft: 20
	},
	accountAddress: {
		color: colors.white,
		fontSize: RFValue(12),
		marginTop: 5
	},
	button: {
		borderRadius: 10
	},
	buttonText: {
		color: colors.black
	},
	menuItem: {
		alignItems: 'center'
	},
	menuItemName: {
		color: colors.fontPrimary
	},
	identiconBorder: {
		borderColor: colors.transparent
	},
	menuItemIconImage: {
		tintColor: colors.white,
		width: 20,
		height: 20
	},
	accountBalanceWrapper: {
		flexDirection: 'row',
		flex: 1,
		alignItems: 'center'
	},
	balance: {
		fontSize: RFValue(15),
		color: colors.white
	},
	accountBgOverlay: {
		borderBottomWidth: 0,
		paddingBottom: 0
	},
	buttons: {
		borderBottomWidth: 0,
		paddingBottom: 5
	},
	menuSection: {
		borderTopWidth: 0,
		paddingVertical: 0
	},
	selectedRoute: {
		backgroundColor: colors.purple100,
		borderTopRightRadius: 0,
		borderBottomRightRadius: 0,
		alignItems: 'center'
	},
	selectedName: {
		color: colors.white,
		...fontStyles.bold
	},
	iconWrapper: {
		backgroundColor: colors.purple,
		padding: 5,
		borderRadius: 8
	}
});

export default brandStyles;
