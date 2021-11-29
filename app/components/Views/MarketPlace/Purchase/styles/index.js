import { StyleSheet } from 'react-native';
import { colors } from '../../../../../styles/common';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';
import { RFValue } from 'react-native-responsive-fontsize';

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: colors.storeBg
	},
	wrapper: {
		flex: 1,
		backgroundColor: colors.white
	},
	navBar: {
		flexDirection: 'row',
		alignItems: 'center',
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
	titleNavBar: {
		flex: 1,
		textAlign: 'center',
		fontSize: RFValue(14),
		color: colors.white,
		marginVertical: 5
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
