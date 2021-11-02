import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import Device from '../../../../../util/Device';

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: colors.white
	},
	inputWrapper: {
		flex: 0,
		borderBottomWidth: 1,
		borderBottomColor: colors.grey050,
		paddingHorizontal: 8
	},
	amountWrapper: {
		flexDirection: 'column',
		margin: 24
	},
	textAmountLabel: {
		...fontStyles.normal,
		fontSize: 14,
		textAlign: 'center',
		color: colors.fontSecondary,
		textTransform: 'uppercase',
		marginVertical: 3
	},
	textAmount: {
		...fontStyles.normal,
		fontWeight: fontStyles.light.fontWeight,
		color: colors.fontPrimary,
		fontSize: 44,
		textAlign: 'center'
	},
	buttonNext: {
		flex: 1,
		marginHorizontal: 24,
		alignSelf: 'flex-end'
	},
	buttonNextWrapper: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		marginBottom: 16
	},
	actionTouchable: {
		padding: 12
	},
	actionText: {
		...fontStyles.normal,
		color: colors.blue,
		fontSize: 14,
		alignSelf: 'center'
	},
	actionsWrapper: {
		margin: 24
	},
	CollectibleMediaWrapper: {
		flexDirection: 'column',
		alignItems: 'center',
		margin: 16
	},
	collectibleName: {
		...fontStyles.normal,
		fontSize: 18,
		color: colors.black,
		textAlign: 'center'
	},
	collectibleTokenId: {
		...fontStyles.normal,
		fontSize: 12,
		color: colors.grey500,
		marginTop: 8,
		textAlign: 'center'
	},
	CollectibleMedia: {
		height: 120,
		width: 120
	},
	qrCode: {
		marginBottom: 16,
		paddingHorizontal: 36,
		paddingBottom: 24,
		paddingTop: 16,
		backgroundColor: colors.grey000,
		borderRadius: 8,
		width: '100%'
	},
	hexDataWrapper: {
		padding: 10,
		alignItems: 'center'
	},
	addressTitle: {
		...fontStyles.bold,
		color: colors.black,
		alignItems: 'center',
		justifyContent: 'center',
		textAlign: 'center',
		fontSize: 16,
		marginBottom: 16
	},
	hexDataClose: {
		zIndex: 999,
		position: 'absolute',
		top: 12,
		right: 20
	},
	hexDataText: {
		textAlign: 'justify'
	},
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0
	},
	totalAmount: {
		...fontStyles.normal,
		color: colors.fontPrimary,
		fontSize: 14,
		textAlign: 'right',
		textTransform: 'uppercase',
		flexWrap: 'wrap',
		flex: 1
	},
	keyboardAwareWrapper: {
		flex: 1,
		justifyContent: 'flex-end'
	},
	errorWrapper: {
		marginHorizontal: 24,
		marginTop: 12,
		paddingHorizontal: 10,
		paddingVertical: 8,
		backgroundColor: colors.red000,
		borderColor: colors.red,
		borderRadius: 8,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	error: {
		color: colors.red,
		fontSize: 12,
		lineHeight: 16,
		...fontStyles.normal,
		textAlign: 'center'
	},
	underline: {
		textDecorationLine: 'underline',
		...fontStyles.bold
	},
	over: {
		color: colors.red,
		...fontStyles.bold
	},
	text: {
		lineHeight: 20
	}
});

export { styles };
