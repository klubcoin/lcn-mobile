import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1
	},
	contentWrapper: {
		padding: 24
	},
	button: {
		marginBottom: 16
	},
	titleText: {
		...fontStyles.bold,
		fontSize: 24,
		marginVertical: 16,
		alignSelf: 'center'
	},
	descriptionText: {
		...fontStyles.normal,
		fontSize: 14,
		alignSelf: 'center',
		textAlign: 'center',
		marginVertical: 8
	},
	linkText: {
		...fontStyles.normal,
		fontSize: 14,
		color: colors.blue,
		alignSelf: 'center',
		textAlign: 'center',
		marginVertical: 16
	},
	buttonsWrapper: {
		flex: 1,
		flexDirection: 'row',
		alignSelf: 'center'
	},
	buttonsContainer: {
		flex: 1,
		flexDirection: 'column',
		alignSelf: 'flex-end'
	},
	scrollViewContainer: {
		flexGrow: 1
	},
	icon: {
		color: colors.blue,
		marginBottom: 16
	},
	blueIcon: {
		color: colors.white
	},
	iconWrapper: {
		alignItems: 'center'
	},
	buttonText: {
		...fontStyles.bold,
		color: colors.blue,
		fontSize: 14,
		marginLeft: 8
	},
	blueButtonText: {
		...fontStyles.bold,
		color: colors.white,
		fontSize: 14,
		marginLeft: 8
	},
	buttonContent: {
		flexDirection: 'row',
		alignSelf: 'center'
	},
	buttonIconWrapper: {
		flexDirection: 'column',
		alignSelf: 'center'
	},
	buttonTextWrapper: {
		flexDirection: 'column',
		alignSelf: 'center'
	},
	detailsWrapper: {
		padding: 10,
		alignItems: 'center'
	},
	addressTitle: {
		fontSize: 16,
		marginBottom: 16,
		...fontStyles.normal
	},
	informationWrapper: {
		paddingHorizontal: 40
	},
	linkWrapper: {
		paddingHorizontal: 24
	},
	titleQr: {
		flexDirection: 'row'
	},
	closeIcon: {
		position: 'absolute',
		right: Device.isIos() ? -30 : -40,
		bottom: Device.isIos() ? 8 : 10
	},
	qrCode: {
		marginBottom: 16,
		alignItems: 'center',
		justifyContent: 'center',
		paddingHorizontal: 36,
		paddingBottom: 24,
		paddingTop: 16,
		backgroundColor: colors.grey000,
		borderRadius: 8
	},
	qrCodeWrapper: {
		borderColor: colors.grey300,
		borderRadius: 8,
		borderWidth: 1,
		padding: 15
	}
});

export default assignNestedObj(styles, brandStyles);
