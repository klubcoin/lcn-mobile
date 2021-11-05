import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	container: {
		backgroundColor: colors.transparent
	},
	standaloneRowFront: {
		backgroundColor: colors.black
	},
	title: {
		color: colors.white
	}
});

export default brandStyles;
