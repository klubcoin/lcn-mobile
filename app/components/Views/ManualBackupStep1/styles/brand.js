import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.transparent
	},
	input: {
		color: colors.white
	},
	loader: {
		backgroundColor: colors.transparent
	},
	seedPhraseConcealer: {
		backgroundColor: colors.purple
	},
	seedPhraseWrapper: {
		backgroundColor: colors.purple,
		borderWidth: 0
	},
	word: {
		backgroundColor: colors.transparent
	},
	action: {
		fontSize: RFValue(28),
		fontWeight: 'bold'
	},
	info: {
		fontSize: RFValue(15),
		textAlign: 'justify'
	},
	onBoardingWrapper: {
		marginTop: 20
	}
});

export default brandStyles;
