import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	textInputContainer: {},
	textInput: {
		color: colors.white,
		backgroundColor: colors.purple,
		borderRadius: 10,
		textAlign: 'left',
		height: 45,
		paddingHorizontal: 10,
		marginBottom: 20,
		fontSize: 16,
		alignItems: 'center',
		...fontStyles.normal
	},
	hintLabel: {
		marginBottom: 10,
		color: colors.white,
		fontSize: 16,
		...fontStyles.bold
	},
	textInputWrapper: {},
	errorText: {}
});

export default assignNestedObj(styles, brandStyles);
