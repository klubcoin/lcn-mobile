import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';

const styles = StyleSheet.create({
	// overwrite theme for brand here
	buttonText: {
		...fontStyles.bold,
		color: colors.black,
		fontSize: 14,
		marginLeft: 8
	},
	colorBlue: {
		color: colors.blue,
	}
});

export default styles;
