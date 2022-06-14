import { StyleSheet, Dimensions, Platform } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors } from '../../../../../styles/common';
import Device from '../../../../../util/Device';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const { width } = Dimensions.get('screen');
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
	headerText: {
		fontSize: 22,
		fontWeight: 'bold'
	},
	profile: {
		flexDirection: 'row',
		marginHorizontal: 20,
		paddingVertical: 20,
		borderBottomColor: colors.blue,
		borderBottomWidth: 2
	},
	avatar: {
		width: 60,
		height: 60,
		borderRadius: 100,
		marginRight: 12
	},
	name: {
		color: colors.white,
		fontSize: 28,
		fontWeight: '700'
	},
	amountMember: {
		fontSize: RFValue(13),
		fontWeight: '300'
	},
	address: {
		color: colors.blue,
		fontSize: 16,
		maxWidth: 160
	},
	body: {
		flex: 1,
		backgroundColor: '#110E21'
	},
	chatBubble: {
		backgroundColor: colors.lightPurple,
		borderRadius: 10,
		overflow: 'hidden',
		maxWidth: width * 0.8
	},
	quoteBubble: {},
	paymentRequestWrapper: {
		width: width * 0.8,
		flexDirection: 'row',
		padding: 10
	},
	textMessage: {
		backgroundColor: colors.lightPurple,
		// backgroundColor: 'yellow',
		padding: 10,
		paddingTop: 5
	},
	text: {
		color: colors.white,
		flexGrow: 1
	},
	typing: {
		color: colors.white,
		fontStyle: 'italic',
		marginBottom: 10,
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
		color: colors.red
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
		padding: 16
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
		color: colors.grey500
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
		backgroundColor: colors.transparent,
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
		maxHeight: 110,
		padding: 5,
		backgroundColor: colors.white
	},
	chatWrapper: {
		flex: 1,
		paddingHorizontal: 10,
		backgroundColor: '#110E21',
		flexDirection: 'row',
		paddingVertical: Platform.OS === 'android' ? 6 : 0
	},
	cameraButton: {
		marginVertical: 5,
		padding: 8,
		borderRadius: 20,
		backgroundColor: colors.lightPurple,
		alignItems: 'center',
		justifyContent: 'center',
		height: 40,
		alignSelf: 'flex-end'
	},
	cameraIcon: {
		fontSize: 24,
		color: colors.white
	},
	chatInputWrapper: {
		flex: 1,
		borderRadius: 12,
		backgroundColor: colors.lightPurple,
		marginLeft: 8,
		marginVertical: 5,
		paddingVertical: 4
	},
	chatInputRow: {
		flexDirection: 'row'
	},
	chatInput: {
		flex: 1,
		color: colors.white,
		paddingHorizontal: 8,
		maxHeight: 110,
		paddingVertical: 8
	},
	sendButton: {
		padding: 8,
		paddingVertical: 12,
		alignSelf: 'flex-end',
		marginLeft: 4
	},
	closeButton: {
		padding: 8,
		marginLeft: 4,
		borderRadius: 40,
		backgroundColor: colors.lightPurple,
		alignSelf: 'center'
	},
	sendIcon: {
		fontSize: 24,
		color: colors.white
	},
	noAvatarWrapper: {
		width: 60,
		height: 60,
		borderRadius: 100,
		backgroundColor: colors.white,
		marginRight: 12,
		alignItems: 'center',
		justifyContent: 'center'
	},
	noAvatarName: {
		fontWeight: '600',
		fontSize: 24,
		color: colors.black
	},
	readMore: {
		fontWeight: 'bold',
		color: colors.grey200
	},
	backdropModal: {
		backgroundColor: colors.transparent,
		width: '100%',
		height: '100%',
		alignItems: 'center',
		justifyContent: 'center'
	},
	modalContent: {
		alignSelf: 'center',
		backgroundColor: colors.white,
		padding: 12,
		borderRadius: 8,
		width: '60%'
	},
	modalActionItem: {
		paddingVertical: 12
	},
	modalActionItemTitle: {
		color: colors.black,
		fontSize: 14
	},
	quoteWrapper: {
		paddingHorizontal: 12,
		flexDirection: 'row',
		marginBottom: 6
	},
	quoteContent: {
		flexDirection: 'row',
		flex: 1,
		borderBottomWidth: 1,
		borderBottomColor: colors.white
	},
	quoteIconWrapper: {
		padding: 4,
		fontSize: 14
	},
	quoteIcon: {
		color: colors.white,
		transform: [{ rotate: '180deg' }],
		fontSize: 16
	},
	quoteMessageWrapper: {
		flex: 1
	},
	quoteMessage: {
		color: colors.white,
		marginTop: 20
	},
	quoteSender: {
		color: colors.grey400,
		fontSize: 14,
		marginTop: 4,
		marginBottom: 6
	},
	quoteCloseButton: {
		padding: 4
	},
	quoteCloseIcon: {
		fontSize: 16,
		color: colors.white
	},
	quoteBubbleWrapper: {
		maxWidth: '100%',
		paddingHorizontal: 0,
		flexDirection: 'row',
		marginBottom: 6
	},
	quoteBubbleContent: {
		flexDirection: 'row',
		borderBottomWidth: 1,
		flexGrow: 1,
		borderBottomColor: colors.white
	},
	quoteBubbleMessageWrapper: {
		maxWidth: width * 0.8 - 44
	},
	editedIcon: {
		color: colors.grey450,
		fontSize: 16,
		alignSelf: 'center'
	},
	editPencilIcon: {
		color: colors.grey450,
		fontSize: 16,
		alignSelf: 'center',
		marginRight: 6
	},
	warningDeleteWrapper: {
		padding: 20,
		justifyContent: 'center'
	},
	warningDeleteText: {
		color: colors.black,
		fontSize: 20,
		textAlign: 'center'
	},
	removeMessage: {
		color: colors.grey450
	},
	messageBubble: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	sendingIcon: {
		color: colors.grey450,
		marginHorizontal: 6,
		fontSize: 16
	},
	receivedIcon: {
		color: colors.grey450,
		marginHorizontal: 6,
		fontSize: 16
	},
	seenIcon: {
		color: colors.blue700,
		marginHorizontal: 6,
		fontSize: 16
	}
});

export default assignNestedObj(styles, brandStyles);
