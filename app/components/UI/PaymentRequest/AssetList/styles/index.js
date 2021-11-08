import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	item: {
		borderWidth: 1,
		borderColor: colors.grey100,
		padding: 8,
		marginBottom: 8,
		borderRadius: 8
	},
	assetListElement: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'flex-start'
	},
	text: {
		...fontStyles.normal
	},
	textSymbol: {
		...fontStyles.normal,
		paddingBottom: 4,
		fontSize: 16
	},
	assetInfo: {
		flex: 1,
		flexDirection: 'column',
		alignSelf: 'center',
		padding: 4
	},
	assetIcon: {
		flexDirection: 'column',
		alignSelf: 'center',
		marginRight: 12
	},
	ethLogo: {
		width: 50,
		height: 50
	}
});

export default assignNestedObj(styles, brandStyles);
