import { Dimensions, StyleSheet } from 'react-native';
import { isTablet } from 'react-native-device-info';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors } from '../../../../styles/common';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const screenWidth = Dimensions.get('window').width;
const photoWidth = (screenWidth - 40) / (isTablet() ? 4 : 2);
const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: '#748cfb'
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
	searchBox: {
		height: 80
	},
	categorySelector: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginBottom: 10
	},
	labelCategory: {
		fontSize: RFValue(14),
		color: colors.white,
		fontWeight: '600'
	},
	category: {
		width: 240,
		backgroundColor: colors.white,
		flexDirection: 'row',
		marginHorizontal: 10,
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: 20,
		borderColor: colors.grey300,
		alignItems: 'center'
	},
	option: {
		flex: 1,
		padding: 10,
		fontSize: 14
	},
	dropdownIcon: {
		marginHorizontal: 10,
		alignSelf: 'center'
	},
	body: {
		backgroundColor: colors.white,
		paddingTop: 10,
		paddingHorizontal: 10
	},
	tabs: {
		flexDirection: 'row',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey200
	},
	tab: {
		marginRight: 8
	},
	tabTitle: {
		fontSize: 14,
		paddingVertical: 5,
		color: colors.grey700
	},
	activeTab: {
		color: colors.blue,
		fontWeight: '600'
	},
	tabActive: {
		height: 2,
		backgroundColor: colors.blue
	},
	vendorView: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20
	},
	headerLogo: {
		width: 50,
		height: 20
	},
	vendorLogo: {
		width: 50,
		height: 50
	},
	vendorInfo: {
		flex: 1,
		flexDirection: 'row',
		paddingHorizontal: 10
	},
	vendor: {
		fontSize: 14,
		fontWeight: '600',
		flex: 3
	},
	distance: {
		width: 60,
		textAlign: 'center',
		fontSize: 12,
		color: colors.grey700
	},
	rating: {
		fontSize: 12
	},
	score: {
		width: 80,
		textAlign: 'center',
		fontSize: 12
	},
	priceRange: {
		flex: 1,
		minWidth: 20,
		textAlign: 'center',
		fontSize: 12,
		color: '#f84880'
	},
	tags: {
		fontSize: 12,
		color: colors.grey600
	},
	sectionHead: {
		flexDirection: 'row',
		marginVertical: 15
	},
	sectionTitle: {
		color: colors.blue,
		fontWeight: '600',
		fontSize: RFValue(12)
	},
	desc: {
		marginTop: 5,
		fontSize: 12,
		color: colors.grey500
	},
	more: {
		width: 28,
		height: 28,
		alignItems: 'center',
		justifyContent: 'center'
	},
	section: {
		marginBottom: 20
	},
	slide: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	image: {
		width: photoWidth,
		height: photoWidth
	},
	title: {
		marginTop: 10,
		textAlign: 'center',
		color: colors.blue,
		fontSize: RFValue(12)
	},
	finalPrice: {
		marginTop: 5,
		textAlign: 'center',
		color: '#f84880',
		fontWeight: 'bold',
		fontSize: RFValue(10)
	},
	price: {
		textAlign: 'center',
		textDecorationLine: 'line-through',
		color: colors.grey500,
		fontSize: RFValue(10)
	},
	nullDataDesc: {
		color: colors.grey300,
		fontSize: RFValue(12)
	},
	storeName: {
		marginTop: 5,
		fontWeight: '600',
		fontSize: RFValue(10),
		color: colors.blue,
	},
	products: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between',
		marginTop: 30,
	},
	product: {
		width: photoWidth,
		maxHeight: photoWidth,
		marginVertical: 10,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 10,
		marginBottom: 60
	},
	photo: {
		resizeMode: 'cover',
		width: '100%',
		height: '100%',
		borderRadius: 4,
	},
	title: {
		marginTop: 5,
		fontSize: RFValue(12),
		color: colors.blue,
		fontWeight: '600'
	},
	desc: {
		marginTop: 5,
		fontSize: RFValue(10),
		color: colors.grey500
	},
	price: {
		textAlign: 'center',
		marginTop: 5,
		color: '#f84880',
		fontWeight: 'bold',
		fontSize: RFValue(10)
	},
});

export default assignNestedObj(styles, brandStyles);
