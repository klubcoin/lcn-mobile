import { StyleSheet, Dimensions } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.primaryFox,
		flex: 1
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.primaryFox,
		minHeight: Dimensions.get('window').height / 2
	},
	loader: {
		alignSelf: 'center'
	},
	text: {
		fontSize: 20,
		color: colors.fontTertiary,
		...fontStyles.normal
	}
});

export default assignNestedObj(styles, brandStyles);
