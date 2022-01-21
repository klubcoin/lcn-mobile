import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../../styles/common';
import Device from '../../../../../../util/Device';
import { assignNestedObj } from '../../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
	},
	scrollView: {
		flex: 1,
		paddingHorizontal: 15
	},
});

export default assignNestedObj(styles, brandStyles);
