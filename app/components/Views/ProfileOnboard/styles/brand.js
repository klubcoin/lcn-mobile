import { colors, fontStyles } from '../../../../styles/common';
import { StyleSheet } from 'react-native';

const brandStyles = StyleSheet.create({
	textInput: {
		color: colors.white,
		borderColor: colors.white,
		borderWidth: 1,
		backgroundColor: colors.grey,
		shadowColor: colors.white,
		shadowOpacity: 0.7,
		shadowRadius: 10,
		shadowOffset: {
			height: 1
		}
	},
	shadowStyle: {
		shadowColor: colors.blue,
		shadowOpacity: 0.7,
		shadowRadius: 10,
		shadowOffset: {
			height: 1
		}
	}
});

export { brandStyles };
