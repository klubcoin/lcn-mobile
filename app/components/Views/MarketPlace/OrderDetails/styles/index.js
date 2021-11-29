import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors } from '../../../../../styles/common';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: colors.storeBg
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
	titleNavBar: {
		flex: 1,
		textAlign: 'center',
		fontSize: RFValue(14),
		color: colors.white,
		marginVertical: 5
	},
	body: {
		flex: 1,
		backgroundColor: colors.grey100,
	},
	statusWrapper: {
		paddingVertical: 10,
		backgroundColor: colors.white,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center'
	},
	statusIc: {
		marginRight: 5
	},
	statusText: {
		fontSize: RFValue(12),
		fontWeight: '500',
		color: colors.grey
	},
	sectionsWrapper: {
		padding: 10
	},
	section: {
		backgroundColor: colors.white,
		borderRadius: 5,
		paddingVertical: 10,
		paddingHorizontal: 15,
		marginBottom: 10
	},
	titleInfoText: {	
		fontSize: RFValue(15),
		fontWeight: '500'
	},
	orderDate: {
		color: colors.grey400,
		fontWeight: '500'
	},
	image: {
		width: 50,
		height: 50,
		marginHorizontal: 10
	},
	titleWrapper: {
		justifyContent: 'space-between'
	},
	infoSection: {
		flexDirection: 'row',
		marginVertical: 5,
	},
	infoText: {
		fontSize: RFValue(12),
		marginLeft: 10, 
		color: colors.grey400
	},
	imageWrapper: {
		flex: 1,
		flexDirection: 'row'
	},
	quantityWrapper: {
		flex: 1,
		alignItems: 'flex-end',
	},
	quantity: {
		fontWeight: '500',
	},
});

export default assignNestedObj(styles, brandStyles);
