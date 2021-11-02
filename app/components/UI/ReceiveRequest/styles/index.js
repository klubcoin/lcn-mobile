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
	qrWrapper: {
		margin: 15
	},
	addressWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		margin: 15,
		padding: 9,
		paddingHorizontal: 15,
		backgroundColor: colors.grey000,
		borderRadius: 30
	},
	copyButton: {
		backgroundColor: colors.grey050,
		color: colors.red,
		borderRadius: 12,
		overflow: 'hidden',
		paddingVertical: 3,
		paddingHorizontal: 6,
		marginHorizontal: 6
	},
	actionRow: {
		flexDirection: 'row',
		marginBottom: 15
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
	titleWrapper: {
		marginTop: 10
	}
});

export { styles };
