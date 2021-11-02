import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import Device from '../../../../../util/Device';

const deviceHeight = Device.getDeviceHeight();
const breakPoint = deviceHeight < 700;

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: colors.white
	},
	inputWrapper: {
		flex: 0,
		borderBottomWidth: 1,
		borderBottomColor: colors.grey050,
		paddingHorizontal: 8
	},
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0
	},
	myAccountsText: {
		...fontStyles.normal,
		color: colors.blue,
		fontSize: 16,
		alignSelf: 'center'
	},
	myAccountsTouchable: {
		padding: 28
	},
	addToAddressBookRoot: {
		flex: 1,
		padding: 24
	},
	addToAddressBookWrapper: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	addTextTitle: {
		...fontStyles.normal,
		fontSize: 24,
		color: colors.black,
		marginBottom: 24
	},
	addTextSubtitle: {
		...fontStyles.normal,
		fontSize: 16,
		color: colors.grey600,
		marginBottom: 24
	},
	addTextInput: {
		...fontStyles.normal,
		color: colors.black,
		fontSize: 20
	},
	addInputWrapper: {
		flexDirection: 'row',
		borderWidth: 1,
		borderRadius: 8,
		borderColor: colors.grey050,
		height: 50,
		width: '100%'
	},
	input: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: 6,
		width: '100%'
	},
	nextActionWrapper: {
		flex: 1,
		marginBottom: 16
	},
	buttonNextWrapper: {
		flexDirection: 'row',
		alignItems: 'flex-end'
	},
	buttonNext: {
		flex: 1,
		marginHorizontal: 24
	},
	addressErrorWrapper: {
		margin: 16
	},
	footerContainer: {
		flex: 1,
		justifyContent: 'flex-end'
	},
	warningContainer: {
		marginTop: 20,
		marginHorizontal: 24,
		marginBottom: 32
	},
	buyEth: {
		color: colors.black,
		textDecorationLine: 'underline'
	},
	confusabeError: {
		display: 'flex',
		flexDirection: 'row',
		justifyContent: 'space-between',
		margin: 16,
		padding: 16,
		borderWidth: 1,
		borderColor: colors.red,
		backgroundColor: colors.red000,
		borderRadius: 8
	},
	confusabeWarning: {
		borderColor: colors.yellow,
		backgroundColor: colors.yellow100
	},
	confusableTitle: {
		marginTop: -3,
		color: colors.red,
		...fontStyles.bold,
		fontSize: 14
	},
	confusableMsg: {
		color: colors.red,
		fontSize: 12,
		lineHeight: 16,
		paddingRight: 10
	},
	black: {
		color: colors.black
	},
	warningIcon: {
		marginRight: 8
	}
});

export { styles };
