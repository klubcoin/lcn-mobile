import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.grey
	},
	input: {
		color: colors.white,
		borderColor: colors.white
	}
});

export { brandStyles };
