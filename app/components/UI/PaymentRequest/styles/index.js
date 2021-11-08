import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1
	},
	contentWrapper: {
		paddingTop: 24,
		paddingHorizontal: 24
	},
	title: {
		...fontStyles.normal,
		fontSize: 16
	},
	searchWrapper: {
		marginVertical: 8
	},
	searchInput: {
		marginHorizontal: 0,
		paddingTop: Device.isAndroid() ? 12 : 2,
		borderRadius: 8,
		paddingHorizontal: 38,
		fontSize: 16,
		backgroundColor: colors.white,
		height: 40,
		width: '100%',
		color: colors.grey400,
		borderColor: colors.grey100,
		borderWidth: 1,
		...fontStyles.normal
	},
	searchIcon: {
		position: 'absolute',
		textAlignVertical: 'center',
		marginTop: Device.isAndroid() ? 9 : 10,
		marginLeft: 12
	},
	input: {
		...fontStyles.normal,
		backgroundColor: colors.white,
		borderWidth: 0,
		fontSize: 24,
		paddingBottom: 0,
		paddingRight: 0,
		paddingLeft: 0,
		paddingTop: 0
	},
	eth: {
		...fontStyles.normal,
		fontSize: 24,
		paddingTop: Device.isAndroid() ? 3 : 0,
		paddingLeft: 10,
		textTransform: 'uppercase'
	},
	fiatValue: {
		...fontStyles.normal,
		fontSize: 18
	},
	split: {
		flex: 1,
		flexDirection: 'row'
	},
	ethContainer: {
		flex: 1,
		flexDirection: 'row',
		paddingLeft: 6,
		paddingRight: 10
	},
	container: {
		flex: 1,
		flexDirection: 'row',
		paddingRight: 10,
		paddingVertical: 10,
		paddingLeft: 14,
		position: 'relative',
		backgroundColor: colors.white,
		borderColor: colors.grey100,
		borderRadius: 4,
		borderWidth: 1
	},
	amounts: {
		maxWidth: '70%'
	},
	switchContainer: {
		flex: 1,
		flexDirection: 'column',
		alignSelf: 'center',
		right: 0
	},
	switchTouchable: {
		flexDirection: 'row',
		alignSelf: 'flex-end',
		right: 0
	},
	enterAmountWrapper: {
		flex: 1,
		flexDirection: 'column'
	},
	button: {
		marginBottom: 16
	},
	buttonsWrapper: {
		flex: 1,
		flexDirection: 'row',
		alignSelf: 'center'
	},
	buttonsContainer: {
		flex: 1,
		flexDirection: 'column',
		alignSelf: 'flex-end'
	},
	scrollViewContainer: {
		flexGrow: 1
	},
	errorWrapper: {
		backgroundColor: colors.red000,
		borderRadius: 4,
		marginTop: 8
	},
	errorText: {
		color: colors.fontError,
		alignSelf: 'center'
	},
	assetsWrapper: {
		marginTop: 16
	},
	assetsTitle: {
		...fontStyles.normal,
		fontSize: 16,
		marginBottom: 8
	},
	secondaryAmount: {
		flexDirection: 'row'
	},
	currencySymbol: {
		...fontStyles.normal,
		fontSize: 24
	},
	currencySymbolSmall: {
		...fontStyles.normal,
		fontSize: 18
	}
});

export default assignNestedObj(styles, brandStyles);
