import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	scrollView: {
		backgroundColor: colors.transparent
	},
	label: {
		fontSize: 24,
		textAlign: 'center',
		color: colors.fontPrimary,
		...fontStyles.bold
	},
	addressWrapper: {
		borderRadius: 40,
		marginTop: 20,
		marginBottom: 20,
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
		paddingTop: 5,
		fontSize: 16,
		color: colors.fontPrimary,
		...fontStyles.normal
	},
	actions: {
		width: '100%',
		justifyContent: 'space-around',
		alignItems: 'flex-start',
		flex: 1,
		flexDirection: 'row'
	},
	identiconBorder: {
		borderRadius: 80,
		borderWidth: 2,
		padding: 2,
		borderColor: colors.blue,
		shadowColor: colors.blue,
		shadowOpacity: 0.7,
		shadowRadius: 10,
		shadowOffset: {
			height: 1
		}
	}
});

export { brandStyles };
