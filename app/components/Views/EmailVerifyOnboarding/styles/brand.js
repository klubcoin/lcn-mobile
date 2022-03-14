import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.transparent,
		marginTop:30
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
	}
});

export default brandStyles;
