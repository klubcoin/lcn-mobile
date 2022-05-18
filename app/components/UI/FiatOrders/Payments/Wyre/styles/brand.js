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
		width: '100%',
		paddingLeft: 20,
		paddingRight: 20,
		marginBottom: 30,
		marginTop: 20
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
		paddingBottom: 12,
		overflow: 'visible'
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
		flex: 1,
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
		alignItems: 'center',
		justifyContent: 'center',
		flexDirection: 'row'
	},
	fromText: {
		fontSize: 20,
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
		paddingVertical: 12,
		overflow: 'visible'
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
		padding: 6,
		justifyContent: 'center',
		alignItems: 'center',
		borderRadius: 6,
		backgroundColor: 'white'
	},
	networkColor: {
		opacity: 0.2,
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
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
		marginBottom: 36,
		paddingVertical: 8
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
	},
	scrollViewContainer: {
		flexGrow: 1,
		justifyContent: 'space-between'
	},
	iButton: {
		width: 20,
		height: 20,
		borderRadius: 20,
		marginLeft: 6,
		backgroundColor: colors.blue,
		justifyContent: 'center',
		alignItems: 'center'
	},
	iIcon: {
		fontSize: 12
	},
	iModal: {
		justifyContent: 'center',
		alignItems: 'center'
	},
	iContent: {
		position: 'absolute',
		width: '80%',
		left: 0,
		right: 0,
		zIndex: 1,
		bottom: 40,
		backgroundColor: colors.black95,
		padding: 12,
		borderRadius: 12
	},
	iText: {
		color: colors.white,
		textAlign: 'center',
		fontSize: 16
	},
	flag: {
		width: 24,
		height: 24,
		marginHorizontal: 6
	},
	logo: {
		width: 22,
		height: 22,
		tintColor: colors.white
	},
	inputAndroid: {
		paddingHorizontal: 12
	},
	inputIOS: {
		padding: 12
	},
	buttonIPay: {
		backgroundColor: colors.black,
		justifyContent: 'center',
		alignItems: 'center',
		height: 40,
		borderRadius: 8,
		borderWidth: 1,
		borderColor: colors.grey400
	},
	iPayIcon: {
		height: 20
	},
	sectionWrapper: {
		width: '100%',
		alignItems: 'center',
		marginTop: 30,
		marginBottom: 10
	},
	sectionText: {
		color: colors.white,
		overflow: 'hidden',
		backgroundColor: colors.purple,
		paddingHorizontal: 12,
		fontWeight: 'bold'
	},
	sectionLineWrapper: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		justifyContent: 'center'
	},
	sectionLine: {
		height: 1,
		width: '100%',
		backgroundColor: colors.blue
	},
	label: {
		color: colors.white,
		fontWeight: 'bold',
		marginBottom: 6,
		marginTop: 18
	},
	emailInput: {
		borderWidth: 2,
		borderColor: colors.blue,
		borderRadius: 10,
		width: '100%',
		color: colors.white
	},
	cardInfoWrapper: {
		borderWidth: 2,
		borderColor: colors.blue,
		borderRadius: 10,
		width: '100%',
		overflow: 'hidden'
	},
	cardNumberWrapper: {
		borderBottomWidth: 2,
		borderBottomColor: colors.blue,
		flexDirection: 'row',
		alignItems: 'center'
	},
	cardNumber: {
		flex: 1,
		color: colors.white
	},
	errorInput: {
		backgroundColor: 'rgba(215, 58, 73,0.6)'
	},
	errorText: {
		color: colors.red,
		marginTop: 10
	},
	cardInfoBottomWrapper: {
		flexDirection: 'row'
	},
	mmYY: {
		flex: 1,
		color: colors.white,
		borderRightWidth: 2,
		borderRightColor: colors.blue
	},
	cardCVCWrapper: {
		flex: 1
	},
	cardCVC: {
		flex: 1,
		color: colors.white
	},
	countryWrapper: {
		flexDirection: 'row',
		padding: 12,
		alignItems: 'center',
		borderWidth: 2,
		borderColor: colors.blue,
		borderRadius: 10
	},
	country: {
		color: colors.white,
		fontWeight: 'bold',
		flex: 1
	},
	countryDropdownIcon: {
		marginLeft: 12,
		fontSize: 14,
		color: colors.white
	},
	countryItemWrapper: {
		paddingHorizontal: 12
	},
	countryItem: {
		paddingVertical: 8,
		borderBottomWidth: 1,
		borderBottomColor: colors.grey200
	},
	countryText: {
		width: '100%'
	}
});

export default brandStyles;
