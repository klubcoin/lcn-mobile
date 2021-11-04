import { StyleSheet } from 'react-native';
import Device from '../../../../../util/Device';
import { colors, fontStyles } from '../../../../../styles/common';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1,
		padding: 24,
		paddingBottom: 48
	},
	title: {
		...fontStyles.normal,
		color: colors.fontPrimary,
		fontSize: 20,
		lineHeight: 20
	},
	heading: {
		fontSize: 24,
		lineHeight: 30,
		marginBottom: 24
	},
	desc: {
		...fontStyles.normal,
		color: colors.grey500,
		fontSize: 14,
		lineHeight: 20,
		marginTop: 12
	},
	switchElement: {
		marginTop: 18
	},
	setting: {
		marginTop: 50
	},
	firstSetting: {
		marginTop: 0
	},
	modalView: {
		alignItems: 'center',
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		padding: 20
	},
	modalText: {
		...fontStyles.normal,
		fontSize: 18,
		textAlign: 'center'
	},
	modalTitle: {
		...fontStyles.bold,
		fontSize: 22,
		textAlign: 'center',
		marginBottom: 20
	},
	confirm: {
		marginTop: 18
	},
	protect: {
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	col: {
		width: '48%'
	},
	inner: {
		paddingBottom: 112
	},
	picker: {
		borderColor: colors.grey200,
		borderRadius: 5,
		borderWidth: 2,
		marginTop: 16
	},
	loader: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	warningText: {
		color: colors.black,
		fontSize: 12,
		flex: 1,
		...fontStyles.normal
	},
	warningTextRed: {
		color: colors.red
	},
	warningTextGreen: {
		color: colors.black
	},
	warningBold: {
		...fontStyles.bold,
		color: colors.blue
	},
	viewHint: {
		padding: 5
	},
	seedPhraseVideo: {
		marginTop: 10
	}
});

export { styles };
