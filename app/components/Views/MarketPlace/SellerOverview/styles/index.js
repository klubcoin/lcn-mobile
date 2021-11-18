import { Dimensions, StyleSheet } from 'react-native';
import { colors } from '../../../../../styles/common';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { isTablet } from 'react-native-device-info';

const screenWidth = Dimensions.get('window').width;
const photoWidth = (screenWidth - 40) / (isTablet() ? 4 : 2);
const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: '#748cfb'
	},
	navBar: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 15
	},
	titleNavBar: {
		textAlign: 'center',
		flex: 1,
		fontSize: RFValue(15),
		color: colors.white,
		marginVertical: 5
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
	logo: {
		width: 60,
		height: 60
	},
	searchBox: {
		marginHorizontal: 20
	},
	search: {
		borderRadius: 24,
		backgroundColor: colors.white
	},
	searchButton: {
		position: 'absolute',
		top: 18,
		right: 8,
		width: 52,
		height: 36,
		borderRadius: 18,
		overflow: 'hidden'
	},
	searchIcon: {
		position: 'absolute',
		alignSelf: 'center',
		marginVertical: 8,
		color: colors.white
	},
	body: {
		backgroundColor: colors.white,
		paddingVertical: 50
	},
	tabs: {
		flexDirection: 'row',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey200
	},
	tab: {
		marginTop: 10,
		marginHorizontal: 8
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
	category: {
		marginHorizontal: 10,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between'
	},
	product: {
		width: photoWidth,
		maxHeight: photoWidth,
		marginVertical: 10,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 10,
		marginBottom: 100
	},
	photo: {
		resizeMode: 'cover',
		width: '100%',
		height: '100%',
		borderRadius: 4
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
	notFoundWrapper: {
		alignItems: 'center',
		flex: 1
	},
	notFoundText: {
		fontSize: RFValue(15),
		color: colors.grey300,
		textAlign: 'center'
	},
	seeAllText: {
		fontSize: RFValue(15),
		color: colors.primaryFox,
		paddingVertical: 20
	},
	priceContainer: {
		flexDirection: 'row',
		maxWidth: photoWidth / 2,
		alignItems: 'center',
		justifyContent: 'center'
	},
	tokenLogo: {
		width: RFPercentage(3),
		height: RFPercentage(3),
		marginLeft: 2
	}
});

export default assignNestedObj(styles, brandStyles);
