import { colors, fontStyles } from '../../../../styles/brand';
import { StyleSheet } from 'react-native';

const brandStyles = StyleSheet.create({
	text: {
		color: colors.fontPrimary
	},
	link: {
		fontWeight: 'bold',
		textDecorationLine: 'none'
	}
});

export { brandStyles };
