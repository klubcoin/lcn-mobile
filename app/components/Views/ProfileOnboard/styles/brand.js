import { colors, fontStyles } from '../../../../styles/common';
import { StyleSheet } from 'react-native';

const brandStyles = StyleSheet.create({
	container: {
		marginTop: 20
	},
	textInput: {
		color: colors.white,
		backgroundColor: colors.purple,
		borderRadius: 10,
		textAlign: 'left'
	},
	hintLabel: {
		marginBottom: 10,
		color: colors.white,
		...fontStyles.bold
	},
	form: {
		paddingHorizontal: 0,
		marginTop: 10
	}
});

export default brandStyles;
