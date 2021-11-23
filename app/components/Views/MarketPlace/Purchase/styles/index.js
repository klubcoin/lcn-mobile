import { Dimensions, StyleSheet } from 'react-native';
import { colors } from '../../../../../styles/common';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { isTablet } from 'react-native-device-info';


const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: colors.white
	},
	inputWrapper: {
		flex: 0,
		borderBottomWidth: 1,
		borderBottomColor: colors.grey050,
		paddingHorizontal: 8,
		paddingBottom: 10,
	},
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0
	},
	buttonNextWrapper: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		marginBottom: 20,
	},
	buttonNext: {
		flex: 1,
		marginHorizontal: 24
	},
	warningContainer: {
		marginTop: 20,
		marginHorizontal: 24,
		marginBottom: 32
	},
	buyEth: {
		color: colors.black,
		textDecorationLine: 'underline'
	},
});

export default assignNestedObj(styles, brandStyles);
