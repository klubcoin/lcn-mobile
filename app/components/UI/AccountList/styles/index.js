import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { brandStyles } from './brand';

const index = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		borderTopLeftRadius: 10,
		borderTopRightRadius: 10,
		minHeight: 450
	},
	titleWrapper: {
		width: '100%',
		height: 33,
		alignItems: 'center',
		justifyContent: 'center',
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey100
	},
	dragger: {
		width: 48,
		height: 5,
		borderRadius: 4,
		backgroundColor: colors.grey400,
		opacity: Device.isAndroid() ? 0.6 : 0.5
	},
	accountsWrapper: {
		flex: 1
	},
	footer: {
		height: Device.isIphoneX() ? 140 : 110,
		paddingBottom: Device.isIphoneX() ? 30 : 0,
		justifyContent: 'center',
		flexDirection: 'column',
		alignItems: 'center'
	},
	btnText: {
		fontSize: 14,
		color: colors.blue,
		...fontStyles.normal
	},
	footerButton: {
		width: '100%',
		height: 36,
		alignItems: 'center',
		justifyContent: 'center',
		borderTopWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey100
	}
});

const styles = Object.assign(index, brandStyles);

export { styles };
