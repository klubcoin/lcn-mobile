import { StyleSheet, Dimensions } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import scaling from '../../../../util/scaling';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const IMAGE_1_RATIO = 162.8 / 138;
const DEVICE_WIDTH = Dimensions.get('window').width;
const IMG_PADDING = Device.isIphoneX() ? 100 : Device.isIphone5S() ? 180 : 220;

const styles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.white,
		flex: 1
	},
	scrollviewWrapper: {
		flexGrow: 1
	},
	wrapper: {
		flex: 1,
		padding: 20,
		paddingTop: 0,
		paddingBottom: 0
	},
	content: {
		alignItems: 'center',
		paddingBottom: 16
	},
	title: {
		fontSize: 24,
		marginLeft: 0,
		marginTop: 16,
		marginBottom: 16,
		color: colors.fontPrimary,
		justifyContent: 'center',
		...fontStyles.bold
	},
	text: {
		marginBottom: 16,
		justifyContent: 'center'
	},
	label: {
		lineHeight: 20,
		fontSize: 16,
		color: colors.fontPrimary,
		textAlign: 'left',
		...fontStyles.normal
	},
	bold: {
		lineHeight: 25,
		...fontStyles.bold
	},
	image: {
		marginTop: 14,
		marginBottom: 8,
		width: DEVICE_WIDTH - IMG_PADDING,
		height: (DEVICE_WIDTH - IMG_PADDING) * IMAGE_1_RATIO
	},
	card: {
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.grey100,
		borderRadius: 10,
		shadowColor: colors.black,
		shadowOffset: {
			width: 1,
			height: 4
		},
		shadowOpacity: 0.1,
		shadowRadius: 2.62,

		elevation: 4,
		padding: 16,
		marginBottom: 20
	},

	modalNoBorder: {
		borderTopWidth: 0
	},
	secureModalContainer: { flex: 1, padding: 27, flexDirection: 'column' },
	secureModalXButton: {
		padding: 5,
		alignItems: 'flex-end'
	},
	whySecureTitle: {
		flex: 1,
		fontSize: 18,
		color: colors.fontPrimary,
		textAlign: 'center',
		...fontStyles.bold
	},
	learnMoreText: {
		marginTop: 21,
		textAlign: 'center',
		fontSize: 15,
		lineHeight: 20,
		color: colors.blue,
		...fontStyles.normal
	},
	blue: {
		color: colors.blue
	},
	titleIcon: {
		fontSize: 32
	},
	centerContent: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center'
	},
	infoIcon: {
		fontSize: 15,
		marginRight: 6
	},
	whyImportantText: {
		fontSize: 14,
		color: colors.blue
	},
	manualTitle: {
		fontSize: 16,
		marginBottom: 8,
		lineHeight: 17,
		color: colors.fontPrimary,
		...fontStyles.bold
	},
	paragraph: {
		lineHeight: 17,
		marginBottom: 20,
		fontSize: 12,
		color: colors.fontPrimary
	},
	smallParagraph: {
		lineHeight: 17,
		fontSize: 12,
		color: colors.fontPrimary
	},
	barsTitle: {
		lineHeight: 17,
		marginBottom: 8,
		fontSize: 12,
		color: colors.fontPrimary
	},
	barsContainer: {
		lineHeight: 17,
		flexDirection: 'row',
		marginBottom: 20
	},
	bar: {
		lineHeight: 17,
		width: 32,
		height: 6,
		backgroundColor: colors.blue,
		marginRight: 2
	},
	secureModalXIcon: {
		fontSize: 16
	},
	auxCenterView: {
		width: 26
	},
	secureModalTitleContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		marginBottom: 16
	},
	explainBackupContainer: {
		flexDirection: 'column',
		alignItems: 'center'
	},
	whySecureText: {
		textAlign: 'center',
		lineHeight: 20,
		color: colors.fontPrimary
	}
});

export default assignNestedObj(styles, brandStyles);
