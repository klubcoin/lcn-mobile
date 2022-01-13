import { Dimensions, StyleSheet } from 'react-native';
import { colors } from '../../../../../styles/common';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { isTablet } from 'react-native-device-info';


const styles = StyleSheet.create({
	section: {
		flex: 1,
	},
	heading: {
		marginTop: 20
	},
	product: {
		flex: 1,
		flexDirection: 'row'
	},
	lastItem: {
		borderBottomColor: colors.grey300,
		borderBottomWidth: StyleSheet.hairlineWidth,
	},
	productInfo: {
		flex: 1,
	},
	quantityWrapper: {
		alignItems: 'flex-end',
	},
	productSection: {
		paddingVertical: 8
	},
	addressTitle: {
		flex: 1,
	},
	addressContent: {
		flex: 1,
		alignItems: 'flex-end'
	}
});

export default assignNestedObj(styles, brandStyles);
