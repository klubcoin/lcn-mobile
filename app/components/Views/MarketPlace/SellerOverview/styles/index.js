import { StyleSheet } from 'react-native';
import { colors } from '../../../../../styles/common';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: '#748cfb'
	},
	navBar: {
		flexDirection: 'row',
		alignItems: 'center'
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
	},
	notFoundWrapper: {
		alignItems: 'center',
		flex: 1
	},
	notFoundText: {
		fontSize: 30,
		color: colors.grey300
	}
});

export default assignNestedObj(styles, brandStyles);
