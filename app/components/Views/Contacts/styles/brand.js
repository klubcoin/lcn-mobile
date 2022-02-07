import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.transparent
	},
	scanQR: {
		backgroundColor: colors.grey
	},
	textInput: {
		flex: 1,
		height: 30,
		...fontStyles.normal,
		padding: 0
	},
});

export default brandStyles;
