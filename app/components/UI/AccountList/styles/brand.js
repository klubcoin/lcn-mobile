import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.grey
	},
	footer: {
		paddingHorizontal: 30,
		alignItems: 'center',
		justifyContent: 'flex-start',
		paddingBottom: 0,
		paddingTop: 10,
	},
	footerButton: {
		backgroundColor: colors.blue,
		borderRadius: 10,
		margin: 4
	},
	btnText: {
		color: colors.black,
		...fontStyles.bold,
		fontSize: 14,
	}
});

export default brandStyles;
