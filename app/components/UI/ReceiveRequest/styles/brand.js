import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.purple500
	},
	copyButton: {
		color: colors.black
	},
	qrWrapper: {
		padding: 10,
		backgroundColor: colors.white
	}
});

export default brandStyles;
