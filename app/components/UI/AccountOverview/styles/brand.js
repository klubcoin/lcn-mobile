import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { RFValue } from 'react-native-responsive-fontsize';

const brandStyles = StyleSheet.create({
	scrollView: {
		backgroundColor: colors.transparent,
	},
	wrapper: {
		alignItems: 'stretch'
	},
	label: {
		color: colors.fontPrimary,
		...fontStyles.bold
	},
	addressWrapper: {
		// paddingVertical: 10,
		// paddingHorizontal: 50,
		borderColor: colors.blue,
		borderWidth: 0,
		borderRadius: 10,
		backgroundColor: colors.primaryFox,
		marginBottom: 0,
		alignItems: 'center',
		justifyContent: 'center',
		paddingVertical: 8,
		paddingHorizontal: 0,
	},
	address: {
		fontSize: 16,
		color: colors.blue,
		...fontStyles.bold
	},
	amountFiat: {
		fontSize: 16,
		color: colors.fontPrimary
	},
	actions: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'space-around',
		marginBottom: 20,
	},
	identiconBorder: {
		borderWidth: 0,
		marginTop: 8,
		marginRight: 6,
	},
	accountWrapper: {
		backgroundColor: colors.purple,
		padding: 20,
		paddingTop: 12,
		borderRadius: 10,
		marginBottom: 20,
		margin: 0
	},
	row: {
		flexDirection: 'row'
	},
	info: {
		alignItems: 'stretch',
	},
	avatar: {
		width: 56,
		height: 56,
		backgroundColor: colors.primaryFox,
		borderRadius: 1000,
	},
	balance: {
		fontSize: RFValue(20),
		textAlign: 'center',
		...fontStyles.normal,
		color: colors.white,
		marginLeft: 6,
	},
	label: {
		fontSize: RFValue(24),
		color: colors.white
	},
	data: {
		paddingTop: 0,
		flex: 1,
		alignItems: 'flex-start',
		justifyContent: 'flex-start'
	}
});

export default brandStyles;
