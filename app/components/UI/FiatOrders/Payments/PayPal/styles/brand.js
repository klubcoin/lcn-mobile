import { StyleSheet, Dimensions } from 'react-native';
import { colors } from '../../../../../../styles/common';

const height = Math.round(Dimensions.get('window').height);

const brandStyles = StyleSheet.create({
	container: {
		flex: 1,
		width: '100%',
		height: '100%',
		backgroundColor: colors.primaryFox
	},
	titleContainer: {
		paddingLeft: 20,
		paddingRight: 20,
		backgroundColor: colors.purple,
		paddingBottom: 20,
		margin: 10,
		borderRadius: 12
	},
	titleWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		marginVertical: 20
	},
	title: {
		flex: 1,
		textAlign: 'left',
		color: colors.white,
		fontSize: 22,
		fontWeight: 'bold'
	},
	menuButton: {
		padding: 12
	},
	menuIcon: {
		fontSize: 22,
		color: colors.white
	},
	stepperContainer: {
		marginLeft: 40
	},
	webView: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		height: '100%',
		width: '100%',
		top: -(height * 0.25)
	},
	fromWrapper: {
		position: 'absolute',
		bottom: 30,
		width: '100%',
		paddingLeft: 20,
		paddingRight: 20
	},
	fromButton: {
		borderRadius: 25,
		height: 50,
		backgroundColor: colors.purple100,
		borderColor: colors.purple100,
		borderWidth: 1,
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 25,
		width: '100%'
	},
	fromLoading: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center'
	},
	stepperWrapper: {
		borderLeftColor: colors.blue,
		borderLeftWidth: 2,
		paddingLeft: 24,
		paddingBottom: 12
	},
	stepperCheckout: {
		paddingTop: 10,
		paddingBottom: 10
	},
	stepperButton: {
		marginTop: 10
	},
	stepperButtonContent: {
		borderWidth: 2,
		borderColor: colors.blue,
		padding: 10,
		width: '50%',
		flexDirection: 'row',
		backgroundColor: colors.purple,
		borderRadius: 6,
		alignItems: 'center'
	},
	stepperButtonText: {
		paddingLeft: 10,
		color: colors.white
	},
	seeCalculationButton: {
		paddingTop: 10,
		paddingBottom: 10,
		color: colors.white
	},
	amountButton: {
		paddingTop: 10,
		paddingBottom: 10
	},
	selectedAmountButton: {
		paddingTop: 10,
		paddingBottom: 10
	},
	amountWrapper: {
		backgroundColor: colors.purple,
		borderColor: colors.blue,
		borderWidth: 2,
		borderRadius: 6,
		overflow: 'hidden',
		paddingLeft: 10,
		flexDirection: 'row',
		marginTop: 20
	},
	amountContent: {
		width: '70%',
		paddingTop: 10,
		paddingBottom: 10
	},
	amountTextInput: {
		fontSize: 24,
		color: colors.white
	},
	amountButton2: {
		borderLeftWidth: 2,
		borderLeftColor: colors.blue,
		width: '30%',
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row'
	},
	fromText: {
		fontSize: 24,
		color: colors.white,
		fontWeight: 'bold'
	},
	receiveWrapper: {
		backgroundColor: colors.purple,
		borderColor: colors.blue,
		borderWidth: 2,
		borderRadius: 6,
		paddingLeft: 10,
		flexDirection: 'row'
	},
	receiveContent: {
		width: '60%',
		paddingTop: 10,
		paddingBottom: 10
	},
	receiveText: {
		fontSize: 24,
		color: colors.white,
		paddingTop: 10,
		paddingBottom: 10
	},
	receiveButton: {
		borderLeftWidth: 2,
		borderLeftColor: colors.blue,
		width: '40%',
		paddingTop: 10,
		paddingBottom: 10,
		paddingHorizontal: 10
	},
	receiveRightContent: {
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row',
		flex: 1
	},
	icon: {
		width: 30,
		height: 30
	},
	currencyText: {
		fontSize: 24,
		color: colors.white,
		fontWeight: 'bold'
	},
	sRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 8
	},
	sMark: {
		width: 10,
		height: 10,
		backgroundColor: colors.blue,
		borderRadius: 10,
		position: 'absolute',
		left: -30
	},
	mMark: {
		width: 30,
		height: 30,
		backgroundColor: colors.blue,
		borderRadius: 20,
		position: 'absolute',
		left: -40,
		justifyContent: 'center',
		alignItems: 'center'
	},
	mRow: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingVertical: 12
	},
	markIcon: {
		fontSize: 16,
		color: colors.white
	},
	markText: {
		color: colors.white,
		fontWeight: 'bold'
	},
	markTitleText: {
		color: colors.grey200,
		marginLeft: 6
	},
	modalContainer: {
		alignItems: 'center'
	},
	modalWrapper: {
		backgroundColor: 'white',
		width: '80%',
		maxHeight: '70%',
		paddingVertical: 12,
		borderRadius: 12
	},
	modalScrollView: {
		paddingHorizontal: 12
	},
	modalItemContainer: {
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.grey100,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	modalItemIcon: {
		color: colors.success,
		marginRight: 12
	},
	dropdownButton: {
		padding: 6
	},
	dropdownIcon: {
		color: colors.white,
		fontSize: 20
	},
	menuContent: {
		borderRadius: 6,
		borderWidth: 2,
		borderColor: colors.blue,
		overflow: 'hidden'
	},
	menuItem: {
		flexDirection: 'row',
		padding: 16,
		alignItems: 'center'
	},
	menuItemBorderBottom: {
		borderBottomWidth: 2,
		borderColor: colors.blue
	},
	menuItemLeftIcon: {
		color: colors.white,
		fontSize: 24
	},
	menuItemTitle: {
		color: colors.white,
		fontSize: 16,
		flex: 1,
		marginLeft: 16
	},
	menuItemRightIcon: {
		color: colors.white,
		fontSize: 24
	},
	tokenText: {
		color: colors.grey300,
		fontWeight: 'bold',
		marginLeft: 4
	},
	networkWrapper: {
		padding: 8,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 6
	},
	networkTitle: {
		color: colors.black,
		fontSize: 8,
		textAlign: 'center'
	},
	buttonText: {
		color: colors.black,
		alignSelf: 'center',
		fontWeight: 'bold',
		fontSize: 16
	},
	confirmTopWrapper: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	confirmSectionTitle: {
		color: colors.white,
		flex: 1
	},
	confirmTopNameWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1
	},
	confirmNameMarker: {
		width: 10,
		height: 10,
		backgroundColor: colors.blue,
		borderRadius: 10,
		marginRight: 12
	},
	confirmTokenName: {
		color: colors.white,
		fontWeight: 'bold'
	},
	addressWrapper: {
		flexDirection: 'row',
		paddingHorizontal: 12,
		borderRadius: 6,
		borderColor: colors.blue,
		borderWidth: 2,
		overflow: 'hidden',
		alignItems: 'center',
		marginTop: 12,
		marginBottom: 36
	},
	addressScroll: {
		paddingVertical: 12
	},
	address: {
		flex: 1,
		color: colors.white
	},
	dasher: {
		marginTop: 16,
		marginBottom: 12
	},
	addressIcon: {},
	confirmContentItemWrapper: {
		flexDirection: 'row'
	},
	confirmContentLeft: {
		flex: 1,
		color: colors.white,
		fontWeight: '600'
	},
	confirmContentRight: {
		color: colors.white,
		fontWeight: '600'
	},
	confirmTotalLeft: {
		flex: 1,
		color: colors.white,
		fontWeight: 'bold'
	},
	confirmTotalRight: {
		color: colors.white,
		fontWeight: 'bold'
	},
	collapsibleWrapper: {
		marginLeft: -40
	},
	collapsible: {
		marginLeft: 40
	}
});

export default brandStyles;
