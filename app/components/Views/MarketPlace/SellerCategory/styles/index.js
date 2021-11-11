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
		fontSize: 20,
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
	},
	navBar: {
		flexDirection: 'row',
		alignItems: 'center',
		borderBottomWidth: 1,
		borderColor: colors.grey300
	},
	navButton: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center'
	},
	backIcon: {
		color: colors.white
	},
	logo: {
		width: 60,
		height: 60
	},
	searchBox: {
		marginHorizontal: 20
	},
	search: {
		borderRadius: 24,
		backgroundColor: colors.white
	},
	searchButton: {
		position: 'absolute',
		top: 18,
		right: 8,
		width: 52,
		height: 36,
		borderRadius: 18,
		overflow: 'hidden'
	},
	searchIcon: {
		position: 'absolute',
		alignSelf: 'center',
		marginVertical: 8,
		color: colors.white
	},
	body: {
		backgroundColor: colors.white
	},
	tabs: {
		flexDirection: 'row',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey200
	},
	tab: {
		marginTop: 10,
		marginHorizontal: 8
	},
	tabTitle: {
		fontSize: 14,
		paddingVertical: 5,
		color: colors.grey700
	},
	activeTab: {
		color: colors.blue,
		fontWeight: '600'
	},
	tabActive: {
		height: 2,
		backgroundColor: colors.blue
	},
	category: {
		marginHorizontal: 10,
		marginTop: 20,
		flexDirection: 'row',
		flexWrap: 'wrap',
		justifyContent: 'space-between'
	},
	product: {
		width: '40%',
		marginVertical: 10,
		alignItems: 'center',
		justifyContent: 'center'
	},
	photo: {
		width: 120,
		height: 120,
		borderRadius: 4
	},
	title: {
		marginTop: 5,
		fontSize: 14,
		color: colors.blue,
		fontWeight: '600'
	},
	desc: {
		marginTop: 5,
		fontSize: 12,
		color: colors.grey500
	},
	price: {
		textAlign: 'center',
		marginTop: 5,
		color: '#f84880',
		fontWeight: 'bold'
	}
});

export default assignNestedObj(styles, brandStyles);
