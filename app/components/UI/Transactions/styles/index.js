import { StyleSheet, Dimensions } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1
	},
	emptyContainer: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center',
		backgroundColor: colors.white,
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

export { styles };
