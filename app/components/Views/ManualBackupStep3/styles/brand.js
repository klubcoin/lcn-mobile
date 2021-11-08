import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.transparent
	},
	textColor: {
		color: colors.white
	},
	loader: {
		backgroundColor: colors.transparent
	},
	seedPhraseWrapper: {
		backgroundColor: colors.grey
	},
	word: {
		backgroundColor: colors.transparent
	}
});

export default brandStyles;
