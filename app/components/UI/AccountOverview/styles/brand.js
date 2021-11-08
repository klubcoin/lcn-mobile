import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	scrollView: {
		backgroundColor: colors.transparent
	},
	label: {
		color: colors.fontPrimary,
		...fontStyles.bold
	},
	addressWrapper: {
		backgroundColor: colors.grey,
		paddingVertical: 10,
		paddingHorizontal: 50,
		borderColor: colors.blue,
		borderWidth: 2
	},
	address: {
		paddingTop: 5,
		fontSize: 16,
		color: colors.blue,
		...fontStyles.bold
	},
	amountFiat: {
		fontSize: 16,
		color: colors.fontPrimary
	},
	actions: {
		width: '100%',
		justifyContent: 'space-around'
	},
	identiconBorder: {
		shadowColor: colors.blue,
		shadowOpacity: 0.7,
		shadowRadius: 10,
		shadowOffset: {
			height: 1
		}
	}
});

export default brandStyles;
