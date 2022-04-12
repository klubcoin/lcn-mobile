import { StyleSheet } from 'react-native';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { colors, fontStyles } from '../../../../../styles/common';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';
import Device from '../../../../../util/Device';

const styles = StyleSheet.create({
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0
	},
	root: {
		backgroundColor: colors.white,
		paddingTop: 24,
		minHeight: '90%',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingBottom: Device.isIphoneX() ? 20 : 0
	},
	heading: {
		alignItems: 'center',
		marginVertical: 24,
		paddingHorizontal: 16
	},
	message: {
		...fontStyles.bold,
		fontSize: 20,
		textAlign: 'center'
	},
	profile: {
		alignItems: 'center'
	},
	avatarView: {
		borderRadius: 60,
		borderWidth: 2,
		padding: 2,
		borderColor: colors.blue
	},
	avatar: {
		width: 60,
		height: 60,
		borderRadius: 30,
		overflow: 'hidden',
		alignSelf: 'center'
	},
	address: {
		marginTop: 10,
		paddingHorizontal: 16,
		fontSize: RFValue(12),
		fontWeight: '600',
		color: colors.black,
		textAlign: 'center'
	},
	email: {
		fontSize: 16,
		fontWeight: '600',
		textAlign: 'center'
	},
	buttons: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginVertical: 20
	},
	accept: {
		width: 160
	},
	reject: {
		marginLeft: 20,
		width: 160
	},
	amountInput: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'flex-start',
		paddingHorizontal: 16,
		marginTop: 16
	},
	input: {
		...fontStyles.normal,
		fontSize: RFValue(20),
		textAlign: 'center',
		paddingTop: 0,
		flexShrink: 1
	},
	eth: {
		...fontStyles.normal,
		fontSize: RFValue(20),
		paddingLeft: 5,
		textTransform: 'uppercase',
		textAlign: 'center'
	},
	errorWrapper: {
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 5,
		borderColor: 'red',
		padding: 16,
		width: '70%',
		alignSelf: 'center',
		marginTop: 10
	},
	errorHeader: {
		...fontStyles.bold,
		fontSize: RFValue(15),
		color: colors.red
	},
	errorMessage: {
		...fontStyles.normal,
		fontSize: RFValue(12),
		color: colors.red,
		textAlign: 'center'
	},
	transactionHeaderTitle: {},
	transactionHeaderIcon: {},
	transactionHeaderName: {},
	enterAmount: {}
});

export default assignNestedObj(styles, brandStyles);
