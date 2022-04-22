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
		paddingRight: 20
	},
	titleWrapper: {
		width: '100%',
		paddingLeft: 20,
		paddingRight: 20,
		paddingTop: 20,
		textAlign: 'center',
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
		bottom: 10,
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
		borderLeftColor: colors.grey050,
		borderLeftWidth: 5,
		paddingLeft: 10
	},
	stepperCheckout: {
		paddingTop: 10,
		paddingBottom: 10
	},
	stepperButton: {
		marginTop: 10
	},
	stepperButtonContent: {
		padding: 10,
		width: '50%',
		flexDirection: 'row',
		backgroundColor: colors.purple,
		borderRadius: 12,
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
		borderRadius: 12,
		paddingLeft: 10,
		paddingRight: 10,
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
		borderLeftWidth: 1,
		borderLeftColor: colors.grey050,
		width: '30%',
		alignItems: 'center',
		justifyContent: 'center'
	},
	fromText: {
		fontSize: 24,
		color: colors.purple100
	},
	receiveWrapper: {
		backgroundColor: colors.purple,
		borderRadius: 12,
		paddingLeft: 10,
		paddingRight: 10,
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
		borderLeftWidth: 1,
		borderLeftColor: colors.grey050,
		width: '40%',
		paddingTop: 10,
		paddingBottom: 10
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
		color: colors.purple100
	}
});

export default brandStyles;
