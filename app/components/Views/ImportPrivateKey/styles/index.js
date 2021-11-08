import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.blue000
	},
	wrapper: {
		flexGrow: 1
	},
	content: {
		alignItems: 'flex-start'
	},
	title: {
		fontSize: 32,
		marginTop: 20,
		marginBottom: 40,
		color: colors.fontPrimary,
		justifyContent: 'center',
		textAlign: 'left',
		...fontStyles.normal
	},
	dataRow: {
		marginBottom: 10
	},
	label: {
		fontSize: 14,
		color: colors.fontPrimary,
		textAlign: 'left',
		...fontStyles.normal
	},
	subtitleText: {
		fontSize: 18,
		...fontStyles.bold
	},
	scanPkeyRow: {
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 20
	},
	scanPkeyText: {
		fontSize: 14,
		color: colors.blue
	},
	icon: {
		textAlign: 'left',
		fontSize: 50,
		marginTop: 0,
		marginLeft: 0
	},
	buttonWrapper: {
		flex: 1,
		justifyContent: 'flex-end',
		padding: 20,
		backgroundColor: colors.white
	},
	button: {
		marginBottom: Device.isIphoneX() ? 20 : 0
	},
	top: {
		paddingTop: 0,
		padding: 30
	},
	bottom: {
		width: '100%',
		padding: 30,
		backgroundColor: colors.white
	},
	input: {
		marginTop: 20,
		marginBottom: 10,
		backgroundColor: colors.white,
		paddingTop: 20,
		paddingBottom: 20,
		paddingLeft: 20,
		paddingRight: 20,
		fontSize: 15,
		borderRadius: 4,
		height: 120,
		borderWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey100,
		...fontStyles.normal
	},
	navbarRightButton: {
		alignSelf: 'flex-end',
		paddingHorizontal: 22,
		paddingTop: 20,
		paddingBottom: 10,
		marginTop: Device.isIphoneX() ? 40 : 20
	},
	closeIcon: {
		fontSize: 28,
		color: colors.fontSecondary
	}
});

export default assignNestedObj(styles, brandStyles);
