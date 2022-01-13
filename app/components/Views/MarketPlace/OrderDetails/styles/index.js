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
		fontSize: RFValue(13),
		color: colors.white,
		marginVertical: 5
	},
	body: {
		flex: 1,
		backgroundColor: colors.grey100,
	},
	statusWrapper: {
		paddingVertical: 10,
		backgroundColor: colors.white,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center'
	},
	statusText: {
		fontSize: RFValue(12),
		fontWeight: '500',
		color: colors.grey
	},
	sectionsWrapper: {
		padding: 10
	},
	section: {
		backgroundColor: colors.white,
		borderRadius: 5,
		paddingVertical: 10,
		paddingHorizontal: 15,
		marginBottom: 10
	},
	titleInfoText: {
		fontSize: RFValue(13),
		fontWeight: '500'
	},
	orderDate: {
		color: colors.grey400,
		fontWeight: '500'
	},
	image: {
		width: 50,
		height: 50,
		marginHorizontal: 10
	},
	titleWrapper: {
		justifyContent: 'space-between',
		alignItems: 'center',
		overflow: 'hidden'
	},
	infoSection: {
		flexDirection: 'row',
		marginVertical: 5,
	},
	infoText: {
		fontSize: RFValue(12),
		color: colors.grey400
	},
	icon: {
		marginRight: 10
	},
	imageWrapper: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center'
	},
	quantityWrapper: {
		flex: 1,
		alignItems: 'flex-end',
	},
	quantity: {
		fontWeight: '500',
	},
	buttonsWrapper: {
		flexDirection: 'row',
		backgroundColor: colors.white,
		paddingVertical: 15
	},
	actionButton: {
		flex: 1,
		margin: 10
	},
	
	buttonNext: {
		width: 100,
		borderRadius: 5,
		alignSelf: 'flex-end'
	},
	bottomModal: {
		margin: 0,
		justifyContent: 'flex-end',
	},
	modalWrapper: {
		height: 500,
		alignItems: 'center',
		backgroundColor: 'white',
		paddingVertical: 15
	},
	modalItem: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12,
		marginHorizontal: 20,
		borderBottomWidth: StyleSheet.hairlineWidth
	},
	remain: {
		fontWeight: '500',
		color: colors.red,
	},
	subPaymentSection: {
		flexDirection: 'row',
		flex: 2, 
		justifyContent: 'flex-end'
	}
});

export default assignNestedObj(styles, brandStyles);
