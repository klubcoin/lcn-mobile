import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import brandStyles from './brand';
import { assignNestedObj } from '../../../../util/object';

const styles = StyleSheet.create({
	header: {
		fontWeight: 'bold',
		fontSize: 16,
		color: colors.primaryFox
	},
	rightButton: {
		marginTop: 7,
		marginRight: 12,
		marginBottom: 12
	},
	metamaskName: {
		// width: 122,
		// height: 15,
		alignSelf: 'flex-start'
	},
	metamaskFox: {
		width: 40,
		height: 40,
		marginRight: 10
	},
	closeIcon: {
		paddingLeft: Device.isAndroid() ? 22 : 18,
		color: colors.blue
	},
	backIcon: {
		color: colors.blue
	},
	backIconIOS: {
		marginHorizontal: 4,
		marginTop: -4,
		backgroundColor: 'red'
	},
	shareIconIOS: {
		marginHorizontal: -5
	},
	hamburgerButton: {
		paddingLeft: Device.isAndroid() ? 22 : 18,
		paddingRight: Device.isAndroid() ? 22 : 18,
		paddingTop: Device.isAndroid() ? 14 : 10,
		paddingBottom: Device.isAndroid() ? 14 : 10
	},
	backButton: {
		paddingLeft: Device.isAndroid() ? 22 : 18,
		paddingRight: Device.isAndroid() ? 22 : 18,
		marginTop: 5,
		height: 48,
		justifyContent: 'center',
		alignItems: 'center'
	},
	closeButton: {
		paddingHorizontal: Device.isAndroid() ? 22 : 18,
		paddingVertical: Device.isAndroid() ? 14 : 8
	},
	infoButton: {
		paddingLeft: Device.isAndroid() ? 22 : 18,
		paddingRight: Device.isAndroid() ? 22 : 18,
		marginTop: 5
	},
	infoIcon: {
		color: colors.blue
	},
	flex: {
		flex: 1
	},
	closeButtonText: {
		color: colors.blue,
		fontSize: 14,
		...fontStyles.normal
	},
	title: {
		fontSize: 18,
		...fontStyles.normal
	},
	titleWrapper: {
		alignItems: 'center',
		flex: 1
	},
	browserRightButton: {
		flex: 1,
		marginRight: Device.isAndroid() ? 10 : 0
	},
	tabIconAndroidWrapper: {
		alignItems: 'center',
		width: 36,
		marginLeft: 5
	},
	disabled: {
		opacity: 0.3
	},
	optinHeaderLeft: {
		flexDirection: 'row',
		alignItems: 'center',
		marginHorizontal: Device.isIos() ? 20 : 0
	},
	tabIconAndroid: {
		marginTop: 13,
		marginLeft: 0,
		marginRight: 3,
		width: 24,
		height: 24
	},
	metamaskNameTransparentWrapper: {
		alignItems: 'center',
		flex: 1
	},
	metamaskNameWrapper: {
		marginLeft: Device.isAndroid() ? 20 : 0
	},
	centeredTitle: {
		fontSize: 20,
		color: colors.fontPrimary,
		textAlign: 'center',
		...fontStyles.normal,
		alignItems: 'center',
		flex: 1
	},
	centeredWhiteTitle: {
		color: colors.white
	},
	headerBackground: {
		backgroundColor: colors.white
	}
});

export default assignNestedObj(styles, brandStyles);
