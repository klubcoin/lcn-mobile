import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
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
	},
	onBoardingWrapper: {
		marginTop: 20
	},
	wrapper: {
		marginTop: 20
	},
	action: {
		fontSize: RFValue(28)
	},
	info: {
		fontSize: RFValue(16)
	},
	successText: {
		color: colors.blue
	},
	seedPhraseWrapperComplete: {
		borderColor: colors.blue,
		backgroundColor: colors.purple
	}
});

export default brandStyles;
