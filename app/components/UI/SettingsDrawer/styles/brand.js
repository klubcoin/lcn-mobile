import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	root: {
		backgroundColor: colors.purple,
		borderBottomWidth: 0,
		flexDirection: 'row',
		paddingVertical: 15,
		alignItems: 'center',
		marginTop: 20,
		borderRadius: 15,
		paddingHorizontal: 15,
		minHeight: 0
	},
	description: {
		color: colors.white
	},
	icon: {
		bottom: 0,
		left: 0,
		position: 'relative'
	}
});

export default brandStyles;
