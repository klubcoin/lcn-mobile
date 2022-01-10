import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.transparent
	},
	wrapper: {
		marginTop: 20
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
