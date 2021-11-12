import { StyleSheet } from 'react-native';
import { colors } from '../../../../../styles/common';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: colors.white
	},
	contentWrapper: {
		flex: 1,
		flexDirection: 'row'
	},
	menuWrapper: {
		flex: 1,
		backgroundColor: colors.grey100
	},
	menuItem: {
		flex: 1,
		alignItems: 'center',
		padding: 20,
		maxHeight: 100
	},
	selectedMenuItem: {
		backgroundColor: colors.white
	},
	icon: {
		paddingVertical: 5
	},
	selected: {
		color: colors.primaryFox
	},
	menuName: {
		fontSize: 18,
		color: colors.grey600
	},
	selectedCategoryWrapper: {
		flex: 1,
		backgroundColor: colors.white
	},
	contentItemText: {
		fontSize: 18
	},
	contentItem: {
		width: '100%',
		padding: 20,
		borderBottomColor: colors.grey100,
		borderBottomWidth: 1,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	subItem: {
		paddingLeft: 50
	}
});

export default assignNestedObj(styles, brandStyles);
