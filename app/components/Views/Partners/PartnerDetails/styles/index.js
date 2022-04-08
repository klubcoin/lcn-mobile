import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import brandStyles from './brand';
import { assignNestedObj } from '../../../../../util/object';

const styles = StyleSheet.create({
	wrapper: {
		paddingVertical: 20,
		paddingHorizontal: 15
	},
	title: {
		color: colors.white,
		...fontStyles.bold,
		fontSize: 30,
		alignSelf: 'center'
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
		borderRadius: 10,
		overflow: 'hidden'
	},
	button: {
		marginTop: 20
	}
});

export default assignNestedObj(styles, brandStyles);
