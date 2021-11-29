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
	name: {
		fontSize: 16,
		fontWeight: '600',
		color: colors.black,
	},
	product: {
		flex: 1,
		flexDirection: 'row',
		marginTop: 10,
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
		alignSelf: 'flex-end',
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
	quantityWrapper:{
		alignItems:'flex-end',
	},
	quantity: {
		fontWeight: '500',
	},
	itemWrapper: {
		marginBottom: 20,
		borderWidth: 1,
		padding: 10,
		borderRadius: 5,
		borderColor: colors.grey400,
	},
	storeNameContainer: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems:'center',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: colors.grey400,
		paddingBottom: 10
	},
	storeNameAndIcon: {
		flexDirection: 'row'
	},
	storeName: {
		fontSize: RFValue(15),
		fontWeight: '600',
		marginLeft: 10,
		borderBottomWidth: 1,
		borderBottomColor: colors.grey300
	},
	orderStatus: {
		fontSize: RFValue(12),
		color: '#f84880',
	},
	storeTotalAmount: {
		flexDirection: 'row',
		alignItems:'center',
		justifyContent: 'space-between',
		borderTopWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey400,
		paddingVertical: 10,
	}, 
	productAmount: {
		fontSize: RFValue(12),
		color: colors.grey500,
	},
	amount: {
		flexDirection: 'row'
	}
});

export default assignNestedObj(styles, brandStyles);
