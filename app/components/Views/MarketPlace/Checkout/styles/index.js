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
	shippingInfo: {
		paddingTop: 20,
		paddingBottom: 10,
		backgroundColor: colors.white,
	},
	shipping: {
		marginTop: 10,
		marginHorizontal: 10,
		padding: 10,
		borderWidth: 1,
		borderStyle: 'dashed',
	},
	editShipping: {
		position: 'absolute',
		top: 20,
		right: 0
	},
	shippingTitle: {
		paddingHorizontal: 10,
		fontSize: 15,
		fontStyle: 'italic',
		fontWeight: '600',
		color: colors.blue
	},
	name: {
		fontSize: 16,
		fontWeight: '600',
		color: colors.black,
	},
	phone: {
		fontSize: 14,
		fontStyle: 'italic'
	},
	address: {
		fontSize: 14,
		fontStyle: 'italic'
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
	footer: {
		height: 60,
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		backgroundColor: colors.white,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: colors.green400,
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
	},
	itemWrapper: {
		marginBottom: 20
	},
	storeNameContainer: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		borderBottomColor: colors.grey300,
		paddingBottom: 10
	},
	storeName: {
		fontSize: RFValue(15),
		fontWeight: '600',
		marginLeft: 10,
		borderBottomWidth: 1,
		borderBottomColor: colors.grey300
	}
});

export default assignNestedObj(styles, brandStyles);
