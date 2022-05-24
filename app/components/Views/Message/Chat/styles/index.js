import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors } from '../../../../../styles/common';
import Device from '../../../../../util/Device';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	flex: {
		flex: 1
	},
	navBar: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 5,
		borderBottomWidth: 1,
		borderBottomColor: colors.grey200
	},
	navBarContentWrapper: {
		alignItems: 'center',
		flex: 10,
		flexDirection: 'row',
		justifyContent: 'center'
	},
	navButton: {
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1
	},
	backIcon: {
		color: colors.primaryFox
	},
	name: {
		fontSize: RFValue(18),
		fontWeight: '500'
	},
	amountMember: {
		fontSize: RFValue(13),
		fontWeight: '300'
	},
	address: {
		fontSize: 16,
		fontWeight: '300',
		color: colors.grey,
		maxWidth: 180
	},
	typing: {
		fontStyle: 'italic',
		marginVertical: 3,
		marginLeft: 5,
		fontSize: 12,
		opacity: 0.5
	},
	bubble: {
		width: 35,
		height: 35,
		borderRadius: 18,
		overflow: 'hidden'
	},
	bigBubble: {
		width: 60,
		height: 60,
		borderRadius: 30
	},
	proImg: {
		width: 35,
		height: 35,
		borderRadius: 100
	},
	menuIcon: {
		width: 28,
		height: 28,
		marginRight: 8,
		color: colors.blue
	},
	isOnline: {
		width: 10,
		height: 10,
		borderRadius: 10,
		alignSelf: 'center',
		marginLeft: 10,
		backgroundColor: colors.green400
	},
	failure: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginBottom: 5
	},
	failedText: {
		color: colors.red,
	},
	retry: {
		color: colors.red,
		fontStyle: 'italic',
		fontWeight: '600'
	},
	productSummaryContainer: {
		flex: 1,
		maxHeight: 150,
		flexDirection: 'row',
		padding: 16,
	},
	productInfo: {
		flex: 3,
		marginLeft: 5,
		backgroundColor: colors.grey000,
		borderRadius: 5,
		padding: 15
	},
	productImg: {
		width: 80,
		height: '100%',
		resizeMode: 'contain'
	},
	cart: {
		flex: 1
	},
	productName: {
		flex: 10,
		fontSize: RFValue(13),
		fontWeight: '500'
	},
	productContent: {
		fontSize: RFValue(12),
		fontWeight: '400'
	},
	requestModalWrapper: {
		backgroundColor: colors.white,
		padding: 20,
		borderRadius: 10,
		alignItems: 'center'
	},
	requestModalHeader: {
		flexDirection: 'row',
		alignItems: 'center',
		marginTop: 10
	},
	requestModalSubContent: {
		fontSize: RFValue(13),
		color: colors.grey500,
	},
	actionsWrapper: {
		flexDirection: 'row',
		paddingVertical: 10
	},
	disableWrapper: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		borderTopWidth: 1,
		borderColor: colors.grey050
	},
	disableText: {
		fontSize: RFValue(13),
		color: colors.grey200,
		fontWeight: '500'
	},
	productNameWrapper: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.white,
		minHeight: Device.getDeviceHeight() / 2
	},
	loader: {
		alignSelf: 'center'
	},
	bold: {
		fontWeight: 'bold'
	},
	joinSender: {
		maxWidth: 100,
		fontWeight: 'bold'
	},
	qrView: {
		maxHeight: 130,
		padding: 15,
		backgroundColor: colors.white,
	}
});


export default assignNestedObj(styles, brandStyles);