import { StyleSheet, Dimensions } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const styles = StyleSheet.create({
	imageWarning: {
		width: 56,
		height: 56,
		alignSelf: 'center'
	},
	modalNoBorder: {
		borderTopWidth: 0
	},
	skipTitle: {
		fontSize: 24,
		marginTop: 12,
		marginBottom: 16,
		color: colors.fontPrimary,
		textAlign: 'center',
		...fontStyles.bold
	},
	skipModalContainer: {
		flex: 1,
		margin: 24,
		flexDirection: 'column'
	},
	skipModalXButton: {
		flex: 1,
		alignItems: 'flex-end'
	},
	skipModalXIcon: {
		fontSize: 16
	},
	skipModalActionButtons: {
		flexDirection: 'row',
		alignItems: 'flex-start'
	},
	skipModalCheckbox: {
		height: 18,
		width: 18,
		marginRight: 12,
		marginTop: 3
	},
	skipModalText: {
		flex: 1,
		...fontStyles.normal,
		lineHeight: 20,
		fontSize: 14,
		paddingHorizontal: 10
	}
});

export { styles };
