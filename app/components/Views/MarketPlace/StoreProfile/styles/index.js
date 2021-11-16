import { StyleSheet } from 'react-native';
import { color } from 'react-native-reanimated';
import { RFValue, RFPercentage } from 'react-native-responsive-fontsize';
import { colors } from '../../../../../styles/common';
import Device from '../../../../../util/Device';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const logoSize = RFPercentage(10);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 10,
		backgroundColor: '#748cfb'
	},
	topBody: {
		height: Device.getDeviceHeight() * 0.1
	},
	body: {
		height: Device.getDeviceHeight() * 0.9,
		backgroundColor: colors.white,
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingVertical: 10,
		paddingHorizontal: 15
	},
	logo: {
		borderRadius: 96,
		borderWidth: 1,
		borderColor: colors.primaryFox,
		height: logoSize,
		width: logoSize,
		padding: 2,
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center',
		position: 'absolute',
		top: 0 - logoSize / 2,
		zIndex: 999
	},
	editIcon: {
		position: 'absolute',
		width: RFPercentage(3),
		height: RFPercentage(3),
		right: 10,
		top: 10
	},
	storeName: {
		fontSize: RFValue(15),
		fontWeight: 'bold',
		alignSelf: 'center',
		marginTop: logoSize / 2
	},
	header: {
		fontSize: RFValue(12),
		fontWeight: 'bold'
	},
	content: {
		paddingVertical: 10
	},
	desc: {
		marginBottom: 20,
		fontSize: RFValue(12)
	},
	contact: {
		fontSize: RFValue(12)
	},
	navBar: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 15
	},
	backIcon: {
		color: colors.white
	},
	titleNavBar: {
		textAlign: 'center',
		flex: 1,
		fontSize: RFValue(15),
		color: colors.white,
		marginVertical: 5
	},
	navButton: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center'
	},
	explainText: {
		color: colors.grey500,
		marginBottom: 20
	}
});

export default assignNestedObj(styles, brandStyles);
