import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../../styles/common';
import Device from '../../../../../../util/Device';

const styles = StyleSheet.create({
	wrapper: {
		flex: 1
	},
	scrollView: {
		flex: 1,
		paddingHorizontal: 30
	},
	card: {
		borderRadius: 12,
		borderColor: colors.blue,
		borderWidth: 1,
		padding: 10,
		backgroundColor: colors.blue
	},
	paypal: {
		color: colors.white,
		fontSize: 24
	},
	creditCard: {
		paddingTop: 10,
		paddingBottom: 10,
		fontWeight: 'bold',
		color: colors.white
	},
	fee: {
		color: colors.white,
		marginBottom: 20
	},
	paypalIc: {
		width: 20,
		height: 20,
		marginRight: 5
	}
});

export { styles };
