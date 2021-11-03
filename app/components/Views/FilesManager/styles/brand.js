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
	textColor: {
		color: colors.white
	}
});

export { brandStyles };
