import { StyleSheet } from 'react-native';
import brandStyles from './brand';
import { assignNestedObj } from '../../../../util/object';

const styles = StyleSheet.create({
	container: {},
	description: {},
	itemWrapper: {},
	itemHeader: {},
	iconWrapper: {},
	icon: {},
	itemHeaderText: {},
	itemDescription: {},
	tradeButton: {},
	tradeButtonText: {}
});

export default assignNestedObj(styles, brandStyles);
