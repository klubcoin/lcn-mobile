import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../../styles/common';
import Device from '../../../../../../util/Device';

const brandStyles = StyleSheet.create({
	card: {
		borderColor: colors.white,
		backgroundColor: colors.black,
		shadowColor: colors.white,
		shadowOpacity: 0.7,
		shadowRadius: 12,
		shadowOffset: {
			height: 1
		}
	},
	paypal: {
		...fontStyles.bold
	}
});

export default brandStyles;
