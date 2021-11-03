import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	standaloneRowFront: {
		backgroundColor: colors.black
	},
	title: {
		color: colors.white
	},
	subTextColor: {
		color: colors.grey
	}
});

export { brandStyles };
