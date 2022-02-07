import { StyleSheet } from 'react-native';
import Device from '../../../../util/Device';
import { colors, fontStyles } from '../../../../styles/common';

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.transparent
	},
	confirm_input: {
		color: colors.white,
		backgroundColor: colors.purple,
		borderWidth: 0,
		borderRadius: 12
	},
	button: {
		borderRadius: 12,
		width: "100%"
	},
	buttonWrapper: {
		flex: 1,
		marginTop: 20,
		justifyContent: 'flex-end',
		width: '100%'
	}
});

export default brandStyles;
