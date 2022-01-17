import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	scrollView: {
		backgroundColor: colors.white
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
	data: {
		textAlign: 'center',
		paddingTop: 7
	},
	label: {
		fontSize: 24,
		textAlign: 'center',
		...fontStyles.normal
	},
	labelInput: {
		marginBottom: Device.isAndroid() ? -10 : 0
	},
	addressWrapper: {
		backgroundColor: colors.blue000,
		borderRadius: 40,
		marginTop: 20,
		marginBottom: 20,
		paddingVertical: 7,
		paddingHorizontal: 15
	},
	address: {
		fontSize: 12,
		color: colors.grey400,
		...fontStyles.normal,
		letterSpacing: 0.8
	},
	amountFiat: {
		fontSize: 12,
		paddingTop: 5,
		color: colors.fontSecondary,
		...fontStyles.normal
	},
	identiconBorder: {
		borderRadius: 80,
		borderWidth: 2,
		padding: 2,
		borderColor: colors.blue
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
		flex: 1,
		justifyContent: 'center',
		alignItems: 'flex-start',
		flexDirection: 'row'
	},
	accountWrapper: {},
	row: {},
	balance: {},
});

export default assignNestedObj(styles, brandStyles);
