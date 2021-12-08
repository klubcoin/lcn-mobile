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
	customer: {
		marginVertical: 10,
	},
	images: {
		flexDirection: 'row',
	},
	image: {
		width: 50,
		height: 50,
		marginTop: 10,
		marginRight: 10,
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
		alignSelf: 'flex-end'
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
	quantityWrapper: {
		alignItems: 'flex-end',
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
		alignItems: 'center',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderBottomColor: colors.grey400,
		paddingBottom: 10
	},
	storeNameAndIcon: {
		flexDirection: 'row'
	},
	orderId: {
		fontSize: RFValue(12),
		fontWeight: '600',
		borderBottomWidth: 1,
		borderBottomColor: colors.grey300
	},
	orderStatus: {
		fontSize: RFValue(12),
		color: '#f84880',
	},
	storeTotalAmount: {
		flexDirection: 'row',
		alignItems: 'flex-start',
		justifyContent: 'space-between',
		borderTopWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey400,
		paddingVertical: 10
	},
	productAmount: {
		fontSize: RFValue(12),
		color: colors.grey500,
	},
	amount: {
		flexDirection: 'row',
		flex: 5,
		overflow: 'visible',
		justifyContent: 'flex-end',
	},
	footer: {
		height: 60,
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		backgroundColor: colors.white,
		borderTopWidth: StyleSheet.hairlineWidth,
		borderTopColor: colors.green400
	},
	selectAll: {
		flexDirection: 'row',
		alignItems: 'center',
		marginLeft: 15,
	},
	textAll: {
		marginLeft: 10
	},
	actionBtn: {
		backgroundColor: colors.lightPurple,
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center',
	},
	refundBtn: {
		backgroundColor: colors.red,
		borderRightWidth: StyleSheet.hairlineWidth,
	},
	textActionBtn: {
		color: colors.white,
		fontSize: 16,
		fontWeight: '600',
		paddingHorizontal: 15,
	},
	tickIcon: {
		alignSelf: 'center'
	},
	tabUnderlineStyle: {
		height: 2,
		backgroundColor: colors.blue
	},
	tabStyle: {
		paddingBottom: 0,
	},
	textStyle: {
		fontSize: RFValue(12),
		letterSpacing: 0.5,
	},
	bottomModal: {
		backgroundColor: 'transparent',
		alignItems: 'center',
		justifyContent: 'center',
	},
	filterHeaderWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderBottomWidth: 1,
		borderBottomColor: colors.grey050,
		paddingHorizontal: 16,
		paddingVertical: 8
	},
	filterBodyWrapper: {
		paddingHorizontal: 16,
		paddingVertical: 10
	},
	sectionHeader: {
		fontSize: RFValue(14),
		fontWeight: '600'
	},
	statusItem: {
		flexDirection: 'row',
		justifyContent: "space-between",
		marginVertical: 5
	},
	sortOptionsWrapper: {
		marginTop: 10,
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	sortOption: {
		alignItems: 'center',
		flex: 1,
		paddingVertical: 8
	},
	middleOption: {
		borderRightWidth: 1,
		borderLeftWidth: 1,
		borderColor: colors.grey050
	},
	selectedOption: {
		backgroundColor: colors.grey050,
		borderRadius: 5
	},
	resetBtnText: {
		color: colors.red
	},
	disabled: {
		backgroundColor: colors.grey200
	}
});

export default assignNestedObj(styles, brandStyles);
