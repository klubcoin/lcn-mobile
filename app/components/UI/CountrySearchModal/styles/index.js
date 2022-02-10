import { StyleSheet } from 'react-native';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	container: {},
	inputView: {},
	inputInner: {},
	search: {},
	delete: {},
	clear: {},
	option: {},
	flag: {},
	content: {},
	name: {},
	iconCheck: {},
	centerModal: {},
	dialCode: {},
	iconClose: {}
});

export default assignNestedObj(styles, brandStyles);
