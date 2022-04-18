import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const deviceHeight = Device.getDeviceHeight();
const breakPoint = deviceHeight < 700;

const brandStyles = StyleSheet.create({
	comingSoon: {
		color: colors.white,
		fontWeight: 'bold',
		fontSize: 16
	},
	chartContainer: {
		padding: 0,
		backgroundColor: colors.lightPurple,
		borderRadius: 10,
		marginBottom: 20,
		overflow: 'hidden',
		height: 290
	},
	chartWrapper: {
		overflow: 'hidden'
	},
	chartHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 16,
		marginLeft: 16
	},
	chartTimelineWrapper: {
		flexDirection: 'row'
	},
	chartTimelineButton: {
		borderRadius: 6,
		marginRight: 10
	},
	chartSelectedTimelineText: {
		color: colors.blue
	},
	chartTimelineText: {
		fontSize: 12,
		fontWeight: 'bold',
		color: colors.white
	},
	currencyWrapper: {
		flexDirection: 'row',
		marginRight: 16
	},
	currencyText: {
		color: colors.white,
		marginRight: 10
	},
	currencyIcon: {
		color: colors.white
	},
	dataPointWrapper: {
		position: 'absolute',
		backgroundColor: colors.purple,
		borderRadius: 100
	},
	dataPointIcon: {
		color: colors.white,
		fontSize: 12
	},
	dataPointVerticalContainer: {
		marginLeft: '-100%',
		height: 1,
		padding: 1
	},
	dataPointVerticalWrapper: {
		width: 2,
		height: 800,
		overflow: 'hidden',
		alignSelf: 'center'
	},
	dataPointVerticalDasher: {
		height: 800,
		borderWidth: 2,
		borderStyle: 'dashed',
		borderRadius: 1,
		borderColor: colors.blue
	},
	dataViewWrapper: {
		position: 'absolute',
		backgroundColor: colors.purple500,
		borderRadius: 12,
		padding: 12,
		width: 180,
		height: 80
	},
	dataViewTime: {
		color: colors.white,
		fontSize: 10
	},
	dataViewBalanceWrapper: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		marginTop: 4
	},
	dataViewBalance: {
		color: colors.white
	},
	dataViewPercentChange: {
		color: colors.pink
	},
	dataViewValue: {
		color: colors.white,
		fontSize: 16,
		fontWeight: 'bold',
		marginTop: 4
	},
	modalContainer: {
		alignItems: 'center'
	},
	modalWrapper: {
		backgroundColor: 'white',
		width: '80%',
		maxHeight: '70%',
		paddingVertical: 12,
		borderRadius: 12
	},
	modalScrollView: {
		paddingHorizontal: 12
	},
	modalItemContainer: {
		paddingVertical: 12,
		borderBottomWidth: 1,
		borderBottomColor: colors.grey100,
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	modalItemIcon: {
		color: colors.success,
		marginRight: 12
	}
});

export default brandStyles;
