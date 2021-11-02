import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10
	},
	body: {
		alignItems: 'center',
		paddingHorizontal: 15
	},
	actionRow: {
		flexDirection: 'row',
		marginTop: 30,
		marginBottom: 30
	},
	actionButton: {
		flex: 1,
		marginHorizontal: 8
	},
	title: {
		...fontStyles.normal,
		color: colors.fontPrimary,
		fontSize: 18,
		flexDirection: 'row',
		alignSelf: 'center'
	},
	message: {
		...fontStyles.normal,
		color: colors.fontPrimary,
		fontSize: 16,
		flexDirection: 'row',
		alignSelf: 'center',
		marginTop: 10,
		paddingHorizontal: 10
	},
	subMessage: {
		...fontStyles.normal,
		color: colors.fontPrimary,
		fontSize: 14,
		flexDirection: 'row',
		alignSelf: 'center',
		marginTop: 10
	},
	titleWrapper: {
		marginTop: 10
	}
});

export { styles };
