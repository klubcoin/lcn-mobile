import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors } from '../../../../../styles/common';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: colors.storeBg
	},
	navBar: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	navButton: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center'
	},
	backIcon: {
		color: colors.white
	},
	titleNavBar: {
		flex: 1,
		textAlign: 'center',
		fontSize: RFValue(14),
		color: colors.white,
		marginVertical: 5
	},
	body: {
		flex: 1,
		backgroundColor: colors.white,
		paddingTop: 10,
		paddingHorizontal: 10
	},
	product: {
		flex: 1,
		flexDirection: 'row',
		marginVertical: 10,
		borderBottomWidth: StyleSheet.hairlineWidth,
		paddingBottom: 15,
	},
	productInfo: {
		flex: 1,
	},
	image: {
		width: 50,
		height: 50,
		marginHorizontal: 10
	},
	title: {
		color: colors.blue,
		fontSize: RFValue(14),
		fontWeight: '600'
	},
	price: {
		fontSize: RFValue(12),
		color: '#f84880',
		fontWeight: 'bold',
	},
	quantityView: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	quantity: {
		height: 24,
		width: 36,
		fontSize: RFValue(12),
		fontWeight: '600',
		textAlign: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey600,
	},
	adjustQuantity: {
		padding: 8
	},
	quantityIcon: {
		color: colors.grey600
	},
	remove: {
		padding: 10,
	},
	footer: {
		height: 60,
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.white,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: colors.green400,
	},
	selectAll: {
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 15,
	},
	textAll: {
		marginLeft: 10
	},
	summary: {
		flex: 1,
		alignItems: 'flex-end',
		paddingHorizontal: 10,
	},
	summaryTitle: {
		fontSize: 14,
		color: colors.black,
	},
	totalAmount: {
		fontSize: 18,
		fontWeight: 'bold',
		color: colors.red,
	},
	totalQuantity: {
		fontSize: 14,
		fontWeight: '600',
	},
	checkout: {
		backgroundColor: colors.lightPurple,
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	textCheckout: {
		color: colors.white,
		fontSize: 16,
		fontWeight: '600',
		paddingHorizontal: 15,
	}
});

export default assignNestedObj(styles, brandStyles);
