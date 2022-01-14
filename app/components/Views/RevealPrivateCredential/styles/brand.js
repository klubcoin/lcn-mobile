import { StyleSheet } from 'react-native';
import Device from '../../../../util/Device';
import { colors, fontStyles } from '../../../../styles/common';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.transparent
	},
	input: {
		color: colors.white
	},
	enterPassword: {
		color: colors.white
	},
	seedPhraseView: {
		backgroundColor: colors.grey
	},
	seedPhrase: {
		backgroundColor: colors.transparent,
		color: colors.white
	},
	label: {
		color: colors.white
	}
});

export default brandStyles;