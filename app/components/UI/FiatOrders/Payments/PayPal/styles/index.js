import { StyleSheet } from 'react-native';
import { assignNestedObj } from '../../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	container: {},
	titleContainer: {},
	titleWrapper: {},
	stepperContainer: {},
	webView: {},
	fromWrapper: {},
	fromButton: {},
	fromLoading: {},
	stepperWrapper: {},
	stepperCheckout: {},
	stepperButton: {},
	stepperButtonContent: {},
	stepperButtonText: {},
	seeCalculationButton: {},
	amountButton: {},
	selectedAmountButton: {},
	amountWrapper: {},
	amountContent: {},
	amountTextInput: {},
	amountButton2: {},
	fromText: {},
	receiveWrapper: {},
	receiveContent: {},
	receiveText: {},
	receiveButton: {},
	receiveRightContent: {},
	icon: {},
	currencyText: {}
});

export default assignNestedObj(styles, brandStyles);
