import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	header: {
		color: colors.black,
		alignSelf: 'flex-start',
		fontSize: RFValue(20)
	},
	backIcon: {
		color: colors.black
	},
	closeButtonText: {
		color: colors.black
	},
	centeredTitle: {
		color: colors.black,
		...fontStyles.bold
	}
});

export default brandStyles;
