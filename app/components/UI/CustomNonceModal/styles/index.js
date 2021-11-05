import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const styles = StyleSheet.create({
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0
	},
	keyboardAwareWrapper: {
		flex: 1,
		justifyContent: 'flex-end'
	},
	modal: {
		minHeight: 200,
		backgroundColor: colors.white,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20
	},
	modalContainer: {
		margin: 24
	},
	title: {
		fontSize: 14,
		color: colors.fontPrimary
	},
	nonceInput: {
		width: 80,
		fontSize: 36,
		...fontStyles.bold,
		color: colors.fontPrimary,
		textAlign: 'center',
		marginHorizontal: 24
	},
	desc: {
		color: colors.fontPrimary,
		fontSize: 12,
		lineHeight: 16,
		marginVertical: 10
	},
	nonceInputContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'center',
		marginVertical: 10
	},
	incrementDecrementNonceContainer: {
		display: 'flex',
		flexDirection: 'row',
		alignItems: 'center',
		alignSelf: 'center'
	},
	currentSuggested: {
		fontSize: 14,
		color: colors.grey500,
		marginBottom: 10
	},
	nonceWarning: {
		borderWidth: 1,
		borderColor: colors.yellow,
		backgroundColor: colors.yellow100,
		padding: 16,
		display: 'flex',
		flexDirection: 'row',
		borderRadius: 8,
		marginTop: 10,
		marginBottom: 16
	},
	nonceWarningText: {
		color: colors.black,
		fontSize: 12,
		lineHeight: 16,
		width: '100%',
		flex: 1
	},
	descWarningContainer: {
		height: 240
	},
	actionRow: {
		flexDirection: 'row',
		marginBottom: 15
	},
	actionButton: {
		flex: 1,
		marginHorizontal: 8
	},
	incrementHit: {
		padding: 4
	},
	icon: {
		flex: 0,
		marginTop: 6,
		paddingRight: 14
	},
	incrementDecrementIcon: {
		color: colors.blue
	}
});

export { styles };
