import { StyleSheet } from 'react-native';
import Device from '../../../../util/Device';
import { colors, fontStyles } from '../../../../styles/common';

const brandStyles = StyleSheet.create({
	text: {
		color: colors.fontPrimary
	},
	createWrapper: {
		justifyContent: 'center'
	},
	image: {
		alignSelf: 'center',
		width: 200
	}
});

export { brandStyles };
