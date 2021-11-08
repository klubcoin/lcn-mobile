import { StyleSheet } from 'react-native';
import Device from '../../../../util/Device';
import { colors, fontStyles } from '../../../../styles/common';

const brandStyles = StyleSheet.create({
	title: {
		color: colors.fontPrimary
	},
	createWrapper: {
		justifyContent: 'center'
	},
	image: {
		alignSelf: 'center',
		width: 200
	},
	buttonDescription: {
		color: colors.fontPrimary
	}
});

export default brandStyles;
