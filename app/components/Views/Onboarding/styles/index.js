import { StyleSheet } from 'react-native';
import Device from '../../../../util/Device';
import { colors, fontStyles } from '../../../../styles/common';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	scroll: {
		flex: 1
	},
	wrapper: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 30
	},
	modalWrapper: {
		flexGrow: 1,
		paddingHorizontal: 24,
		marginTop: 24
	},
	foxWrapper: {
		width: Device.isIos() ? 90 : 45,
		height: Device.isIos() ? 90 : 45,
		marginVertical: 20
	},
	image: {
		alignSelf: 'center',
		width: Device.isIos() ? 90 : 45,
		height: Device.isIos() ? 90 : 45
	},
	termsAndConditions: {
		paddingBottom: 30
	},
	title: {
		fontSize: 24,
		color: colors.fontPrimary,
		...fontStyles.bold,
		textAlign: 'center'
	},
	ctas: {
		flex: 1,
		position: 'relative'
	},
	footer: {
		marginTop: -20,
		marginBottom: 20
	},
	login: {
		fontSize: 18,
		color: colors.blue,
		...fontStyles.normal
	},
	buttonDescription: {
		...fontStyles.normal,
		fontSize: 14,
		textAlign: 'center',
		marginBottom: 16,
		color: colors.fontPrimary,
		lineHeight: 20
	},
	importWrapper: {
		marginVertical: 24
	},
	createWrapper: {
		flex: 1,
		justifyContent: 'flex-end',
		marginBottom: 24
	},
	buttonWrapper: {
		marginBottom: 16
	},
	scanTitle: {
		...fontStyles.bold,
		fontSize: 18,
		color: colors.fontPrimary,
		textAlign: 'center',
		lineHeight: 28
	},
	loader: {
		marginTop: 180,
		justifyContent: 'center',
		textAlign: 'center'
	},
	loadingText: {
		marginTop: 30,
		fontSize: 14,
		textAlign: 'center',
		color: colors.fontPrimary,
		...fontStyles.normal
	},
	column: {
		marginVertical: 24,
		alignItems: 'flex-start'
	},
	modalTypeView: {
		position: 'absolute',
		bottom: 0,
		paddingBottom: Device.isIphoneX() ? 20 : 10,
		left: 0,
		right: 0,
		backgroundColor: colors.transparent
	},
	notificationContainer: {
		flex: 0.1,
		flexDirection: 'row',
		alignItems: 'flex-end'
	}
});

export default assignNestedObj(styles, brandStyles);
