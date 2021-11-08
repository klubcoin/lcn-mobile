import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.transparent
	},
	card: {
		backgroundColor: colors.grey
	},
	whySecureTitle: {
		color: colors.black
	},
	whySecureText: {
		color: colors.black
	}
});

export default brandStyles;
