import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import brandStyles from './brand';
import { assignNestedObj } from '../../../../util/object';

const styles = StyleSheet.create({
	root: {
		paddingHorizontal: 24,
		paddingTop: 24,
		paddingBottom: Device.isIphoneX() ? 48 : 24
	},
	customGasHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		width: '100%',
		paddingBottom: 20
	},
	customGasModalTitleText: {
		...fontStyles.bold,
		color: colors.fontPrimary,
		fontSize: 14,
		alignSelf: 'center'
	},
	optionsContainer: {
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		paddingBottom: 20
	},
	basicButton: {
		width: 116,
		height: 36,
		padding: 8,
		justifyContent: 'center',
		alignItems: 'center'
	},
	optionSelected: {
		backgroundColor: colors.grey000,
		borderWidth: 1,
		borderRadius: 20,
		borderColor: colors.grey100
	},
	textOptions: {
		...fontStyles.normal,
		fontSize: 14,
		color: colors.black
	},
	message: {
		...fontStyles.normal,
		color: colors.black,
		fontSize: 12
	},
	warningWrapper: {
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center',
		textAlign: 'center',
		width: '100%',
		marginBottom: 10
	},
	warningTextWrapper: {
		width: '100%',
		paddingHorizontal: 10,
		paddingVertical: 8,
		backgroundColor: colors.red000,
		borderColor: colors.red,
		borderRadius: 8,
		borderWidth: 1,
		justifyContent: 'center',
		alignItems: 'center',
		flexWrap: 'wrap'
	},
	warningText: {
		color: colors.red,
		fontSize: 12,
		textAlign: 'center',
		...fontStyles.normal
	},
	invisible: {
		opacity: 0
	},
	titleContainer: {
		width: '100%',
		flexDirection: 'row',
		justifyContent: 'space-between'
	},
	radio: {
		marginLeft: 'auto'
	},
	gasSelectorWrapper: {
		position: 'absolute',
		alignSelf: 'center',
		width: '100%',
		paddingTop: 24
	},
	selectors: {
		position: 'relative',
		flexDirection: 'row',
		justifyContent: 'space-evenly',
		marginBottom: 8
	},
	selector: {
		alignSelf: 'stretch',
		textAlign: 'center',
		alignItems: 'flex-start',
		flex: 1,
		paddingVertical: 10,
		paddingHorizontal: 12,
		borderWidth: 1,
		borderColor: colors.grey100,
		marginLeft: -2
	},
	selectorSelected: {
		backgroundColor: colors.blue000,
		borderColor: colors.blue,
		zIndex: 1
	},
	first: {
		borderBottomStartRadius: 6,
		borderTopStartRadius: 6
	},
	last: {
		borderBottomEndRadius: 6,
		borderTopEndRadius: 6
	},
	text: {
		...fontStyles.normal,
		fontSize: 10,
		color: colors.black
	},
	textGasFee: {
		fontSize: 12
	},
	textTitle: {
		...fontStyles.bold,
		fontSize: 10,
		color: colors.black
	},
	advancedOptionsContainer: {
		flexDirection: 'column',
		justifyContent: 'center',
		alignItems: 'center'
	},
	valueRow: {
		width: '100%',
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20
	},
	advancedOptionsText: {
		flex: 1,
		textAlign: 'left',
		...fontStyles.light,
		color: colors.fontPrimary,
		fontSize: 14
	},
	totalGasWrapper: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-start',
		paddingVertical: 8,
		paddingRight: 20
	},
	textTotalGas: {
		...fontStyles.bold,
		color: colors.fontPrimary,
		fontSize: 14
	},
	gasInput: {
		flex: 1,
		...fontStyles.bold,
		backgroundColor: colors.white,
		borderColor: colors.grey100,
		color: colors.black,
		borderRadius: 8,
		borderWidth: 1,
		fontSize: 14,
		paddingHorizontal: 10,
		paddingVertical: 8,
		position: 'relative'
	},
	gasInputError: {
		flex: 1,
		...fontStyles.bold,
		backgroundColor: colors.white,
		borderColor: colors.grey100,
		color: colors.red,
		borderRadius: 8,
		borderWidth: 1,
		fontSize: 14,
		paddingHorizontal: 10,
		paddingVertical: 8,
		position: 'relative'
	},
	buttonTransform: {
		transform: [
			{
				translateY: 70
			}
		]
	},
	hidden: {
		opacity: 0,
		height: 0
	}
});

export default assignNestedObj(styles, brandStyles);
