import { StyleSheet } from 'react-native';
import Device from '../../../../../util/Device';
import { colors, fontStyles } from '../../../../../styles/common';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.transparent
	},
	title: {
		...fontStyles.bold
	},
	desc: {
		color: colors.grey300
	},
	seedPhrase: {
		backgroundColor: colors.transparent,
		color: colors.white
	}
});

export { brandStyles };
