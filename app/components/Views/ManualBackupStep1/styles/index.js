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
	loader: {
		backgroundColor: colors.white,
		flex: 1,
		minHeight: 300,
		justifyContent: 'center',
		alignItems: 'center'
	},
	action: {
		fontSize: 18,
		marginVertical: 16,
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
		fontSize: 14,
		color: colors.fontPrimary,
		textAlign: 'center',
		...fontStyles.normal,
		paddingHorizontal: 6
	},
	seedPhraseConcealer: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		backgroundColor: colors.grey700,
		opacity: 0.7,
		alignItems: 'center',
		borderRadius: 8,
		paddingHorizontal: 24,
		paddingVertical: 45
	},
	touchableOpacity: {
		position: 'absolute',
		width: '100%',
		height: '100%',
		borderRadius: 8
	},
	blurView: {
		position: 'absolute',
		top: 0,
		left: 0,
		bottom: 0,
		right: 0,
		borderRadius: 8
	},
	icon: {
		width: 24,
		height: 24,
		color: colors.white,
		textAlign: 'center',
		marginBottom: 32
	},
	reveal: {
		fontSize: Device.isMediumDevice() ? 13 : 16,
		...fontStyles.bold,
		color: colors.white,
		lineHeight: 22,
		marginBottom: 8,
		textAlign: 'center'
	},
	watching: {
		fontSize: Device.isMediumDevice() ? 10 : 12,
		color: colors.white,
		lineHeight: 17,
		marginBottom: 32,
		textAlign: 'center'
	},
	viewButtonContainer: {
		width: 155,
		padding: 12
	},
	seedPhraseWrapper: {
		backgroundColor: colors.white,
		borderRadius: 8,
		flexDirection: 'row',
		borderColor: colors.grey100,
		borderWidth: 1,
		marginBottom: 64,
		minHeight: 275
	},
	wordColumn: {
		flex: 1,
		alignItems: 'center',
		paddingHorizontal: Device.isMediumDevice() ? 18 : 24,
		paddingVertical: 18,
		justifyContent: 'space-between'
	},
	wordWrapper: {
		flexDirection: 'row'
	},
	word: {
		paddingHorizontal: 8,
		paddingVertical: 6,
		fontSize: 14,
		color: colors.fontPrimary,
		backgroundColor: colors.white,
		borderColor: colors.blue,
		borderWidth: 1,
		borderRadius: 13,
		textAlign: 'center',
		textAlignVertical: 'center',
		lineHeight: 14,
		flex: 1
	},
	confirmPasswordWrapper: {
		flex: 1,
		padding: 30,
		paddingTop: 0
	},
	passwordRequiredContent: {
		marginBottom: 20
	},
	content: {
		alignItems: 'flex-start'
	},
	title: {
		fontSize: 32,
		marginTop: 20,
		marginBottom: 10,
		color: colors.fontPrimary,
		justifyContent: 'center',
		textAlign: 'left',
		...fontStyles.normal
	},
	text: {
		marginBottom: 10,
		marginTop: 20,
		justifyContent: 'center'
	},
	label: {
		fontSize: 16,
		lineHeight: 23,
		color: colors.fontPrimary,
		textAlign: 'left',
		...fontStyles.normal
	},
	buttonWrapper: {
		flex: 1,
		width: '100%',
		marginTop: 20,
		justifyContent: 'flex-end'
	},
	input: {
		borderWidth: 2,
		borderRadius: 5,
		width: '100%',
		borderColor: colors.grey000,
		padding: 10,
		height: 40
	},
	warningMessageText: {
		paddingVertical: 10,
		color: colors.red,
		...fontStyles.normal
	},
	keyboardAvoidingView: {
		flex: 1,
		flexDirection: 'row',
		alignSelf: 'center'
	}
});

export default assignNestedObj(styles, brandStyles);
