import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import Device from '../../../../../util/Device';

const brandStyles = StyleSheet.create({
	text: {
		color: colors.white
	},
	textSymbol: {
		color: colors.white,
		...fontStyles.bold
	},
	item: {
		backgroundColor: colors.purple,
		borderRadius: 10,
		borderWidth: 0,
	}
});

export default brandStyles;
