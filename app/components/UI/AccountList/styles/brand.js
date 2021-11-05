import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.grey,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		minHeight: 450
	}
});

export { brandStyles };
