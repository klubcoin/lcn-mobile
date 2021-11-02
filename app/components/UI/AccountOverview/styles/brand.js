import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	scrollView: {
		backgroundColor: colors.transparent
	},
	wrapper: {
		paddingTop: 20,
		paddingHorizontal: 20,
		paddingBottom: 0,
		alignItems: 'center'
	},
	info: {
		justifyContent: 'center',
		alignItems: 'center',
		textAlign: 'center'
	},
	label: {
		color: colors.fontPrimary,
		...fontStyles.bold
	},
	labelInput: {
		marginBottom: Device.isAndroid() ? -10 : 0
	},
	addressWrapper: {
		backgroundColor: colors.grey,
		paddingVertical: 10,
		paddingHorizontal: 50,
		borderColor: colors.blue,
		borderWidth: 2
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
	avatar: {
		width: 46,
		height: 46,
		borderRadius: 23
	},
	onboardingWizardLabel: {
		borderWidth: 2,
		borderRadius: 4,
		paddingVertical: Device.isIos() ? 2 : -4,
		paddingHorizontal: Device.isIos() ? 5 : 5,
		top: Device.isIos() ? 0 : -2
	},
	actions: {
		width: '100%',
		justifyContent: 'space-around',
		alignItems: 'flex-start'
	},
	shadowStyle: {
		shadowColor: colors.blue,
		shadowOpacity: 0.7,
		shadowRadius: 10,
		shadowOffset: {
			height: 1
		}
	}
});

export { brandStyles };
