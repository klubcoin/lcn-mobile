import { colors, fontStyles } from '../../../../styles/common';
import { StyleSheet } from 'react-native';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	text: {
		...fontStyles.normal,
		color: colors.grey500,
		textAlign: 'center',
		fontSize: 10
	},
	link: {
		textDecorationLine: 'underline'
	}
});

export default assignNestedObj(styles, brandStyles);
