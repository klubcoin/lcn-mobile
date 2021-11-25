import { StyleSheet } from 'react-native';
import { colors } from '../../../../../styles/common';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: 'transparent'
	},
	body: {
		flex: 1,
		width: 240,
		shadowColor: colors.black,
		shadowOffset: {
			width: 1,
			height: 0
		},
		shadowOpacity: 0.3,
		shadowRadius: 1
	},
	close: {
		marginLeft: 10,
		marginTop: 10,
		width: 25
	},
	profile: {
		alignItems: 'center',
		marginTop: 30
	},
	name: {
		marginTop: 10,
		fontSize: 16,
		fontWeight: '600'
	},
	address: {
		fontSize: 12,
		marginTop: 5,
		color: colors.grey600
	},
	menuItem: {
		padding: 10,
		flexDirection: 'row',
		alignItems: 'center'
	},
	menuTitle: {
		flex: 1,
		marginLeft: 10,
		fontWeight: '600',
		fontSize: 14
	},
	footer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20
	},
	setting: {
		padding: 10,
		flexDirection: 'row',
		alignItems: 'center'
	},
	settingText: {
		marginLeft: 10,
		fontWeight: '600',
		fontSize: 14
	}
});

export default assignNestedObj(styles, brandStyles);
