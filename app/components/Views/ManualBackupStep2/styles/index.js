import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const deviceHeight = Device.getDeviceHeight();

const styles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.white,
		flex: 1
	},
	wrapper: {
		flex: 1,
		paddingHorizontal: 32
	},
	onBoardingWrapper: {
		paddingHorizontal: 20
	},
	action: {
		fontSize: 18,
		marginBottom: 16,
		color: colors.fontPrimary,
		justifyContent: 'center',
		textAlign: 'center',
		...fontStyles.bold
	},
	infoWrapper: {
		marginBottom: 16,
		justifyContent: 'center'
	},
	info: {
		fontSize: 16,
		color: colors.fontPrimary,
		textAlign: 'center',
		...fontStyles.normal,
		paddingHorizontal: 6
	},
	seedPhraseWrapper: {
		backgroundColor: colors.white,
		borderRadius: 8,
		flexDirection: 'row',
		justifyContent: 'space-between',
		borderColor: colors.grey100,
		borderWidth: 1,
		marginBottom: 24
	},
	seedPhraseWrapperComplete: {
		borderColor: colors.green500
	},
	seedPhraseWrapperError: {
		borderColor: colors.red
	},
	colLeft: {
		paddingTop: 18,
		paddingLeft: 27,
		paddingBottom: 4,
		alignItems: 'flex-start'
	},
	colRight: {
		paddingTop: 18,
		paddingRight: 27,
		paddingBottom: 4,
		alignItems: 'flex-end'
	},
	wordBoxWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 14
	},
	wordWrapper: {
		paddingHorizontal: 8,
		paddingVertical: 6,
		width: Device.isMediumDevice() ? 75 : 95,
		backgroundColor: colors.white,
		borderColor: colors.grey050,
		borderWidth: 1,
		borderRadius: 34,
		borderStyle: 'dashed',
		marginLeft: 4
	},
	word: {
		fontSize: 14,
		color: colors.fontPrimary,
		lineHeight: 14,
		textAlign: 'center'
	},
	selectableWord: {
		paddingHorizontal: 8,
		paddingVertical: 6,
		color: colors.fontPrimary,
		width: 95,
		backgroundColor: colors.white,
		borderColor: colors.blue,
		borderWidth: 1,
		marginBottom: 6,
		borderRadius: 13,
		textAlign: 'center'
	},
	selectableWordText: {
		textAlign: 'center',
		fontSize: 14,
		lineHeight: 14,
		color: colors.black
	},
	words: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: Device.isMediumDevice() ? 'space-around' : 'space-between'
	},
	successRow: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center'
	},
	successText: {
		fontSize: 12,
		color: colors.green500,
		marginLeft: 4
	},
	selectedWord: {
		backgroundColor: colors.grey400,
		borderWidth: 1,
		borderColor: colors.grey400
	},
	selectedWordText: {
		color: colors.white
	},
	currentWord: {
		borderWidth: 1,
		borderColor: colors.blue
	},
	confirmedWord: {
		borderWidth: 1,
		borderColor: colors.blue,
		borderStyle: 'solid'
	},
	wordText: {}
});

export default assignNestedObj(styles, brandStyles);
