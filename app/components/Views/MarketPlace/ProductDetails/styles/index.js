import { StyleSheet } from 'react-native';
import { isTablet } from 'react-native-device-info';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { colors } from '../../../../../styles/common';
import Device from '../../../../../util/Device';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	root: {
		flex: 1
	},
	navBar: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10
	},
	navButton: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center'
	},
	backIcon: {
		color: colors.blue
	},
	image: {
		height: isTablet() ? 240 : 200,
		width: '100%',
		resizeMode: 'cover'
	},
	header: {
		marginTop: 20,
		marginHorizontal: 10
	},
	badge: {
		backgroundColor: colors.green600,
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		left: -8,
		bottom: -5
	},
	counter: {
		color: colors.white,
		fontSize: 14
	},
	about: {
		flex: 1,
		marginTop: isTablet() ? 0 : 20,
		marginLeft: isTablet() ? 20 : 10
	},
	category: {
		fontSize: RFValue(12)
	},
	infoTitle: {
		fontWeight: '600',
		fontSize: RFValue(12)
	},
	infoDesc: {
		fontSize: RFValue(12)
	},
	columns: {
		width: '100%',
		flexDirection: 'row',
		paddingVertical: 10
	},
	spacing: {
		marginLeft: 40
	},
	pricing: {
		marginTop: 10
	},
	actions: {
		flexDirection: 'row',
		marginVertical: 10
	},
	quantityView: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	quantity: {
		fontSize: RFValue(12),
		fontWeight: '600',
		textAlign: 'center',
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey600,
		width: RFPercentage(3),
		height: RFPercentage(3)
	},
	adjustQuantity: {
		padding: 8
	},
	quantityIcon: {
		color: colors.grey600
	},
	purchase: {
		width: RFPercentage(15),
		height: RFPercentage(4),
		marginLeft: 10,
		alignItems: 'center',
		justifyContent: 'center',
		borderRadius: 8,
		backgroundColor: colors.green500
	},
	addFavorite: {
		marginTop: 10,
		marginLeft: 20
	},
	favorite: {
		color: colors.red
	},
	addToCart: {
		color: colors.white,
		fontSize: RFValue(12),
		fontWeight: '600'
	},
	body: {
		marginTop: 15,
		marginHorizontal: 15,
		marginBottom: 50
	},
	tags: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginTop: 10
	},
	tagLabel: {
		fontWeight: '600',
		fontSize: RFValue(12)
	},
	tag: {
		fontSize: RFValue(12)
	},
	desc: {
		fontSize: RFValue(12),
		fontWeight: '400'
	},
	more: {
		color: colors.green400,
		fontWeight: '600',
		marginVertical: 10
	},
	heading: {
		fontSize: RFValue(14),
		fontWeight: '600',
		marginTop: 15
	},
	user: {
		marginTop: 10,
		fontWeight: '600'
	},
	rating: {
		fontWeight: 'normal'
	},
	comment: {
		marginTop: 3,
		marginBottom: 8
	},
	info: {
		marginTop: 10,
		flex: 1,
		flexDirection: 'row',
		flexWrap: 'wrap'
	},
	infoColumn: {
		marginTop: 5,
		width: '50%'
	},
	chat: {
		backgroundColor: colors.green400,
		width: 45,
		height: 45,
		borderRadius: 25,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		bottom: 40,
		right: 20
	},
	chatBubble: {
		color: colors.white
	},
	slide: {
		paddingVertical: 10,
		flexDirection: 'row',
		justifyContent: 'space-between'
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
