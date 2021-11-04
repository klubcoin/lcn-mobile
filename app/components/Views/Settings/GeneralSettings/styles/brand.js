import { StyleSheet } from 'react-native';
import Device from '../../../../../util/Device';
import { colors, fontStyles } from '../../../../../styles/common';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.transparent
	},
	title: {
		...fontStyles.bold
	},
	image: {
		alignSelf: 'center',
		width: 200
	},
	desc: {
		color: colors.grey300
	},
	identicon_type: {
		color: colors.grey300
	},
	selected_text: {
		color: colors.blue
	}
});

export { brandStyles };
