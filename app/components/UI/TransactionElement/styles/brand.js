import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';

const brandStyles = StyleSheet.create({
	row: {
		backgroundColor: colors.purple,
		margin: 15,
		marginBottom: 0,
		borderRadius: 10,
	},
	speedupActionContainerStyle: {
		backgroundColor: colors.blue
	},
	importRowBody: {
		backgroundColor: colors.white000,
		borderBottomRightRadius: 10,
		borderBottomLeftRadius: 10,
		paddingVertical: 0,
	},
	importText: {
		color: colors.white
	}
});

export default brandStyles;
