import { StyleSheet, Dimensions } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const styles = StyleSheet.create({
	row: {
		backgroundColor: colors.white,
		flex: 1,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey100
	},
	actionContainerStyle: {
		height: 25,
		width: 70,
		padding: 0
	},
	speedupActionContainerStyle: {
		marginRight: 10
	},
	actionStyle: {
		fontSize: 10,
		padding: 0,
		paddingHorizontal: 10
	},
	icon: {
		width: 28,
		height: 28
	},
	summaryWrapper: {
		padding: 15
	},
	fromDeviceText: {
		color: colors.fontSecondary,
		fontSize: 14,
		marginBottom: 10,
		...fontStyles.normal
	},
	importText: {
		color: colors.fontSecondary,
		fontSize: 14,
		...fontStyles.bold,
		alignContent: 'center'
	},
	importRowBody: {
		alignItems: 'center',
		backgroundColor: colors.grey000,
		paddingTop: 10
	}
});

export { styles };
