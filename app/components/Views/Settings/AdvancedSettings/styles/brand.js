import { StyleSheet } from 'react-native';
import Device from '../../../../../util/Device';
import { colors, fontStyles } from '../../../../../styles/common';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.transparent,
		paddingHorizontal: 20,
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
	},
	setting: {
		backgroundColor: colors.purple,
		padding: 20,
		marginTop: 20,
		borderRadius: 10,
	}
});

export default brandStyles;
