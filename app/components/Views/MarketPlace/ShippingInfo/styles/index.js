import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors } from '../../../../../styles/common';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: colors.storeBg,
	},
	backIcon: {
		color: colors.white,
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
	titleNavBar: {
		flex: 1,
		textAlign: 'center',
		fontSize: RFValue(14),
		color: colors.white,
		marginVertical: 5
	},
	scroll: {
		paddingBottom: 80,
		backgroundColor: colors.white,
	},
	desc: {
		marginTop: 20,
		marginHorizontal: 20,
		fontSize: 16,
		color: colors.grey700,
		fontStyle: 'italic'
	},
	heading: {
		paddingHorizontal: 20,
		marginTop: 15,
		fontSize: 16
	},
	name: {
		marginTop: 10,
		fontSize: 16,
	},
	input: {
		height: 36,
		marginTop: 10,
		paddingHorizontal: 10,
		marginHorizontal: 20,
		paddingVertical: 0,
		borderRadius: 4,
		borderColor: colors.grey400,
		borderWidth: StyleSheet.hairlineWidth
	},
	address: {
		height: 100,
		marginTop: 10,
		paddingHorizontal: 10,
		marginHorizontal: 20,
		borderRadius: 4,
		borderColor: colors.grey400,
		borderWidth: StyleSheet.hairlineWidth
	},
	buttons: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 30
	},
	location: {
		marginHorizontal: 20,
		marginTop: 10,
		flexDirection: 'row',
		alignItems: 'flex-end'
	},
	coords: {
		marginLeft: 10,
	},
	save: {
		width: 140
	},
	cancel: {
		width: 140,
		marginLeft: 20
	},
});

export default assignNestedObj(styles, brandStyles);
