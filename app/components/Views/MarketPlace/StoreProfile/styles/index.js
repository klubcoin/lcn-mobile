import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors } from '../../../../../styles/common';
import Device from '../../../../../util/Device';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

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
		borderRadius: 20,
		borderWidth: 1,
		borderColor: colors.primaryFox,
		height: 90,
		width: 90,
		padding: 2,
		alignItems: 'center',
		justifyContent: 'center',
		alignSelf: 'center',
		position: 'absolute',
		top: Device.getDeviceHeight() * 0.1 + 25,
		zIndex: 999
	},
	editIcon: {
		alignSelf: 'flex-end'
	},
	shopName: {
		fontSize: RFValue(15),
		fontWeight: 'bold',
		alignSelf: 'center',
		marginTop: 20
	},
	header: {
		fontSize: RFValue(12),
		fontWeight: 'bold'
	},
	content: {
		paddingVertical: 10
	},
	desc: {
		marginBottom: 20
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
	}
});

export default assignNestedObj(styles, brandStyles);
