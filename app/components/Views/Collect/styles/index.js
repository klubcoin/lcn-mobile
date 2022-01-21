import { StyleSheet, Dimensions } from 'react-native';
import { colors, fontStyles, baseStyles } from '../../../../styles/common';
import brandStyles from './brand';
import { assignNestedObj } from '../../../../util/object';

const styles = StyleSheet.create({
	wrapper: {
		paddingVertical: 20,
		paddingHorizontal: 15
	},
	title: {
		color: colors.white,
		...fontStyles.bold,
		fontSize: 30
	},
	desc: {
		color: colors.white,
		...fontStyles.normal,
		fontSize: 14,
		marginVertical: 20
	},
	partnerImage: {
		height: 300,
		width: '100%',
		borderWidth: 3,
		borderColor: colors.blue,
		borderRadius: 10
	},
	button: {
		marginTop: 20
	}
});

export default assignNestedObj(styles, brandStyles);
