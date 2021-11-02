import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import Device from '../../../../../util/Device';

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: colors.white
	},
	scrollWrapper: {
		marginBottom: 60
	},
	buttonNextWrapper: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'flex-end'
	},
	buttonNext: {
		flex: 1,
		marginHorizontal: 24
	},
	inputWrapper: {
		flex: 1,
		marginTop: 30,
		marginHorizontal: 24
	},
	actionsWrapper: {
		flexDirection: 'row'
	},
	action: {
		flex: 1,
		alignItems: 'center'
	},
	actionBorder: {
		flex: 0.8
	},
	actionDropdown: {
		...fontStyles.normal,
		backgroundColor: colors.blue,
		paddingHorizontal: 16,
		paddingVertical: 2,
		borderRadius: 100,
		flexDirection: 'row',
		alignItems: 'center'
	},
	textDropdown: {
		...fontStyles.normal,
		fontSize: 14,
		color: colors.white,
		paddingVertical: 2
	},
	iconDropdown: {
		paddingLeft: 10
	},
	maxText: {
		...fontStyles.normal,
		fontSize: 12,
		color: colors.blue,
		alignSelf: 'flex-end',
		textTransform: 'uppercase'
	},
	actionMax: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'flex-end'
	},
	actionMaxTouchable: {},
	inputContainerWrapper: {
		marginVertical: 16,
		alignItems: 'center'
	},
	inputContainer: {
		flexDirection: 'row'
	},
	inputCurrencyText: {
		...fontStyles.normal,
		fontWeight: fontStyles.light.fontWeight,
		color: colors.black,
		fontSize: 44,
		marginRight: 8,
		paddingVertical: Device.isIos() ? 0 : 8,
		justifyContent: 'center',
		alignItems: 'center',
		textTransform: 'uppercase'
	},
	textInput: {
		...fontStyles.normal,
		fontWeight: fontStyles.light.fontWeight,
		fontSize: 44,
		textAlign: 'center',
		color: colors.fontPrimary
	},
	switch: {
		flex: 1,
		marginTop: Device.isIos() ? 0 : 2
	},
	actionSwitch: {
		paddingHorizontal: 8,
		paddingVertical: 2,
		borderRadius: 8,
		flexDirection: 'row',
		borderColor: colors.grey500,
		borderWidth: 1,
		right: -2
	},
	textSwitch: {
		...fontStyles.normal,
		fontSize: 14,
		color: colors.grey500,
		textTransform: 'uppercase'
	},
	switchWrapper: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0
	},
	tokenImage: {
		width: 36,
		height: 36,
		overflow: 'hidden'
	},
	assetElementWrapper: {
		height: 70,
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.grey000,
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 24
	},
	assetElement: {
		flexDirection: 'row',
		flex: 1
	},
	assetsModalWrapper: {
		backgroundColor: colors.white,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		height: 450
	},
	titleWrapper: {
		width: '100%',
		height: 33,
		alignItems: 'center',
		justifyContent: 'center',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey100
	},
	dragger: {
		width: 48,
		height: 5,
		borderRadius: 4,
		backgroundColor: colors.grey400,
		opacity: Device.isAndroid() ? 0.6 : 0.5
	},
	textAssetTitle: {
		...fontStyles.normal,
		fontSize: 18
	},
	assetInformationWrapper: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'space-between',
		marginLeft: 16
	},
	assetBalanceWrapper: {
		flexDirection: 'column'
	},
	textAssetBalance: {
		...fontStyles.normal,
		fontSize: 18,
		textAlign: 'right'
	},
	textAssetFiat: {
		...fontStyles.normal,
		fontSize: 12,
		color: colors.grey500,
		textAlign: 'right',
		textTransform: 'uppercase'
	},
	errorMessageWrapper: {
		marginVertical: 16
	},
	CollectibleMedia: {
		width: 120,
		height: 120
	},
	collectibleName: {
		...fontStyles.normal,
		fontSize: 32,
		color: colors.grey500,
		textAlign: 'center'
	},
	collectibleId: {
		...fontStyles.normal,
		fontSize: 14,
		color: colors.grey500,
		marginTop: 8,
		textAlign: 'center'
	},
	collectibleInputWrapper: {
		margin: 24
	},
	collectibleInputImageWrapper: {
		flexDirection: 'column',
		alignItems: 'center'
	},
	collectibleInputInformationWrapper: {
		marginTop: 12
	},
	nextActionWrapper: {
		flex: 1,
		marginBottom: 16
	},
	balanceWrapper: {
		marginVertical: 16
	},
	balanceText: {
		...fontStyles.normal,
		color: colors.fontPrimary,
		alignSelf: 'center',
		fontSize: 12,
		lineHeight: 16
	}
});

export { styles };
