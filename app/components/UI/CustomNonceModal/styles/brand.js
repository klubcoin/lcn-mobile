import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	modal: {
		backgroundColor: colors.grey
	},
	currentSuggested: {
		color: colors.grey300
	}
});

export { brandStyles };
