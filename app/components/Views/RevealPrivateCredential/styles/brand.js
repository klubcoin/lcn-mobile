import { StyleSheet } from 'react-native';
import Device from '../../../../util/Device';
import { colors, fontStyles } from '../../../../styles/common';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.transparent
	},
	textColor: {
		color: colors.white
	},
	seedPhraseView: {
		backgroundColor: colors.grey
	},
	seedPhrase: {
		backgroundColor: colors.transparent,
		color: colors.white
	}
});

export { brandStyles };
