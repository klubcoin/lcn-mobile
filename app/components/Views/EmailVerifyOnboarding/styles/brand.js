import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const deviceHeight = Device.getDeviceHeight();
const breakPoint = deviceHeight < 700;

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.transparent,
		marginTop: 30
	},
	wrapper: {
		marginTop: 20
	},
	title: {
		marginBottom: 10,
		marginTop: 30,
		fontSize: RFValue(30)
	},
	label: {
		fontSize: RFValue(16)
	},
	remindLaterText: {
		fontSize: RFValue(15),
		fontWeight: 'bold'
	},
	remindLaterSubText: {
		color: colors.white,
		fontWeight: '500',
		fontSize: RFValue(13)
	},
	startSubText: {
		color: colors.white,
		fontWeight: '500',
		fontSize: RFValue(13)
	},
	text: {
		marginTop: 0
	},
	blue: {
		fontWeight: 'bold'
	},
	remindLaterContainer: {
		backgroundColor: colors.purple,
		paddingVertical: 25,
		borderRadius: 10,
		marginBottom: 5
	},
	areYouSure: {
		width: '100%',
		padding: breakPoint ? 16 : 24,
		justifyContent: 'center',
		alignSelf: 'center',
		alignItems: 'center'
	},
	warningIcon: {
		alignSelf: 'center',
		color: colors.red,
		marginVertical: 10
	},
	emailBlockedTitle: {
		color: colors.red,
		fontWeight: 'bold',
		fontSize: 24,
		textAlign: 'center'
	},
	emailBlockedContent: {
		color: colors.grey300,
		fontWeight: '600',
		marginTop: 8,
		textAlign: 'center'
	},
	emailBlockedCoundown: {
		color: colors.red,
		fontWeight: 'bold',
		fontSize: 24,
		textAlign: 'center',
		marginTop: 16
	},
	emailBlockedRemaining: {
		color: colors.grey300,
		fontWeight: '600',
		marginTop: 8,
		textAlign: 'center'
	},
	closeModalButton: {
		position: 'absolute',
		top: 10,
		right: 10,
		padding: 12
	},
	closeModalIcon: {
		color: colors.grey400,
		fontSize: 24
	}
});

export default brandStyles;
