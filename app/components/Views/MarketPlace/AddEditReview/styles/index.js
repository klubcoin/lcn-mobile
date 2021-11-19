import { StyleSheet } from 'react-native';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { colors } from '../../../../../styles/common';
import Device from '../../../../../util/Device';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	wrapper: {
		paddingHorizontal: 16,
		paddingTop: 16
	},
	productSummaryContainer: {
		flex: 1,
		flexDirection: 'row',
		// backgroundColor: colors.grey000,
		borderRadius: 5,
		padding: 16,
		marginBottom: 16,
		borderColor: colors.primaryFox,
		borderWidth: 1
	},
	productImg: {
		flex: 1,
		borderRadius: 5
	},
	productInfo: {
		flex: 3,
		paddingHorizontal: 8
	},
	productName: {
		fontSize: RFValue(13),
		fontWeight: '500'
	},
	productContent: {
		fontSize: RFValue(12),
		fontWeight: '400'
	},
	header: {
		fontSize: RFValue(15),
		fontWeight: '600'
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
	ratingWrapper: {
		flex: 5,
		marginTop: 30
	},
	ratingSection: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		marginBottom: 20
	},
	ratings: {
		marginTop: 10,
		alignSelf: 'flex-start'
	},
	ratingText: {
		fontSize: RFValue(18),
		color: colors.yellow,
		fontWeight: '500',
		marginLeft: 15
	},
	backIcon: {
		color: colors.blue
	},
	buttons: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 30
	},
	save: {
		flex: 1
	},
	cancel: {
		flex: 1,
		marginLeft: 20
	},
	input: {
		height: Device.getDeviceHeight() / 3,
		marginTop: 10,
		paddingHorizontal: 16,
		borderRadius: 4,
		backgroundColor: colors.grey000,
		paddingTop: 16
	}
});

export default assignNestedObj(styles, brandStyles);
