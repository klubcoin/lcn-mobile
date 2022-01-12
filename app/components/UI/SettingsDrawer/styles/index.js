import { StyleSheet, Dimensions } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	root: {
		backgroundColor: colors.transparent,
		borderBottomColor: colors.grey000,
		borderBottomWidth: 1,
		flexDirection: 'row',
		minHeight: 100,
		paddingVertical: 18
	},
	content: {
		flex: 1
	},
	title: {
		...fontStyles.bold,
		color: colors.fontPrimary,
		fontSize: 20,
		marginBottom: 8
	},
	description: {
		...fontStyles.normal,
		color: colors.grey300,
		fontSize: 14,
		lineHeight: 20,
		paddingRight: 8
	},
	action: {
		flex: 0,
		paddingHorizontal: 16
	},
	icon: {
		// bottom: 8,
		color: colors.white,
		// left: 4,
		position: 'relative'
	},
	noBorder: {
		borderBottomWidth: 0
	},
	warning: {
		alignSelf: 'flex-start',
		marginTop: 20
	},
	menuItemWarningText: {
		color: colors.red,
		fontSize: 12,
		...fontStyles.normal
	}
});

export default assignNestedObj(styles, brandStyles);
