import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.purple,
		marginTop: 0,
		paddingTop: 16,
		borderBottomLeftRadius: 10,
		borderBottomRightRadius: 10
	},
	addText: {
		color: colors.blue
	},
	addIcon: {
		color: colors.blue
	}
});

export default brandStyles;
