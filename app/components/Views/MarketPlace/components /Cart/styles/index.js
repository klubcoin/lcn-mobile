import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors } from '../../../../../../styles/common';
import { assignNestedObj } from '../../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	button: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center'
	},
	badge: {
		backgroundColor: colors.green600,
		width: 24,
		height: 24,
		borderRadius: 12,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		left: -8,
		bottom: -5
	},
	counter: {
		color: colors.white,
		fontSize: RFValue(10)
	},
});

export default assignNestedObj(styles, brandStyles);
