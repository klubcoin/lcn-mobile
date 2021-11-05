import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import brandStyles from './brand';
import { assignNestedObj } from '../../../../util/object';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1,
		minHeight: 500,
		marginTop: 16
	},
	emptyView: {
		justifyContent: 'center',
		alignItems: 'center',
		marginTop: 40
	},
	add: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center'
	},
	addText: {
		fontSize: 15,
		color: colors.blue,
		...fontStyles.normal
	},
	footer: {
		flex: 1,
		paddingBottom: 30
	},
	emptyContainer: {
		flex: 1,
		marginBottom: 42,
		justifyContent: 'center',
		alignItems: 'center'
	},
	emptyImageContainer: {
		width: 76,
		height: 76,
		marginBottom: 12
	},
	emptyTitleText: {
		fontSize: 24,
		color: colors.grey200
	},
	emptyText: {
		color: colors.grey200,
		marginBottom: 8
	}
});

export default assignNestedObj(styles, brandStyles);
