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
	products: {
		marginHorizontal: 10,
		marginTop: 20,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between'
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
	product: {
		width: photoWidth,
		marginVertical: 10,
		alignItems: 'center',
		justifyContent: 'center'
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
	}
});

export default assignNestedObj(styles, brandStyles);
