import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.transparent
	},
	word: {
		color: colors.white
	},
	loader: {
		backgroundColor: colors.transparent
	},
	seedPhraseWrapper: {
		backgroundColor: colors.grey
	},
	wordWrapper: {
		backgroundColor: colors.transparent
	},
	wordText: {
		color: colors.white
	}
});

export default brandStyles;
