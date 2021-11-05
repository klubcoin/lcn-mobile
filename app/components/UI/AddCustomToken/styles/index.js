import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { brandStyles } from './brand';

const index = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1
	},
	rowWrapper: {
		padding: 20
	},
	textInput: {
		borderWidth: 1,
		borderRadius: 4,
		borderColor: colors.grey100,
		padding: 16,
		...fontStyles.normal
	},
	warningText: {
		marginTop: 15,
		color: colors.red,
		...fontStyles.normal
	},
	tokenAddress: {
		...fontStyles.normal
	}
});

const styles = Object.assign(index, brandStyles);

export { styles };
