import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import Device from '../../../../../util/Device';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	wrapper: {
		flexDirection: 'row',
		marginHorizontal: 8,
	},
	selectWrapper: {
		flex: 1,
		marginLeft: 8,
		paddingHorizontal: 10,
		minHeight: 52,
		flexDirection: 'row',
		borderWidth: 1,
		borderRadius: 8,
		marginVertical: 8
	},
	inputWrapper: {
		flex: 1,
		marginLeft: 8,
		padding: 10,
		minHeight: 52,
		flexDirection: 'row',
		borderWidth: 1,
		borderRadius: 8,
		marginTop: 8
	},
	input: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center'
	},
	identiconWrapper: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	addressToInformation: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center',
		position: 'relative'
	},
	exclamation: {
		backgroundColor: colors.white,
		borderRadius: 12,
		position: 'absolute',
		bottom: 8,
		left: 20
	},
	address: {
		flexDirection: 'column',
		alignItems: 'flex-start',
		marginHorizontal: 8
	},
	addressWrapper: { flexDirection: 'row' },
	textAddress: {
		...fontStyles.normal,
		color: colors.black,
		fontSize: 14
	},
	textBalance: {
		...fontStyles.normal,
		fontSize: 12,
		color: colors.grey500
	},
	label: {
		flexDirection: 'row',
		alignItems: 'center',
		width: '15%'
	},
	labelText: {
		...fontStyles.normal,
		color: colors.black,
		fontSize: 16
	},
	textInput: {
		...fontStyles.normal,
		paddingLeft: 0,
		paddingRight: 8,
		width: '100%'
	},
	scanIcon: {
		flexDirection: 'column',
		alignItems: 'center'
	},
	iconOpaque: {
		color: colors.grey500
	},
	iconHighlighted: {
		color: colors.blue
	},
	borderOpaque: {
		borderColor: colors.grey100
	},
	borderHighlighted: {
		borderColor: colors.blue
	},
	iconWrapper: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	dropdownIconWrapper: {
		height: 23,
		width: 23
	},
	dropdownIcon: {
		alignSelf: 'center'
	},
	checkIconWrapper: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	checkAddress: {
		flex: 0.9
		// maxWidth: '90%'
	},
	toInputWrapper: {
		flexDirection: 'row'
	}
});

export default assignNestedObj(styles, brandStyles);
