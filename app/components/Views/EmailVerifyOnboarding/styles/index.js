import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { assignNestedObj } from '../../../../util/object';
import scaling from '../../../../util/scaling';
import brandStyles from './brand';

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
		justifyContent: 'flex-start',
		flex: 1,
		marginBottom: 10
	},
	title: {
		fontSize: 24,
		marginBottom: 40,
		color: colors.fontPrimary,
		textAlign: 'center',
		...fontStyles.bold
	},
	text: {
		marginTop: 32,
		justifyContent: 'center'
	},
	label: {
		lineHeight: scaling.scale(20),
		fontSize: scaling.scale(14),
		color: colors.fontPrimary,
		textAlign: 'center',
		...fontStyles.normal
	},
	buttonWrapper: {
		flex: 1,
		justifyContent: 'flex-end'
	},
	bold: {
		...fontStyles.bold
	},
	blue: {
		color: colors.blue
	},
	remindLaterText: {
		textAlign: 'center',
		fontSize: 15,
		lineHeight: 20,
		color: colors.blue,
		...fontStyles.normal
	},
	remindLaterSubText: {
		textAlign: 'center',
		fontSize: 11,
		lineHeight: 20,
		color: colors.grey600,
		...fontStyles.normal
	},
	startSubText: {
		textAlign: 'center',
		fontSize: 11,
		marginTop: 12,
		color: colors.grey600,
		...fontStyles.normal
	},
	remindLaterContainer: {
		marginBottom: 34
	},
	remindLaterButton: {
		elevation: 10,
		zIndex: 10
	},
	ctaContainer: {
		marginBottom: 30
	},
	areYouSure: {},
	warningIcon: {},
	emailBlockedTitle: {},
	emailBlockedContent: {},
	emailBlockedCoundown: {},
	emailBlockedRemaining: {},
	closeModalButton: {},
	closeModalIcon: {}
});

export default assignNestedObj(styles, brandStyles);
