import { colors, fontStyles } from '../../../../styles/branch';
import { StyleSheet } from 'react-native';

const branchStyles = StyleSheet.create({
	text: {
		color: colors.fontPrimary
	},
	link: {
		fontWeight: 'bold',
		textDecorationLine: 'none'
	}
});

export { branchStyles };
