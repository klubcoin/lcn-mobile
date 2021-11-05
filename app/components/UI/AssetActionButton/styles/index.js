import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	button: {
		flexShrink: 1,
		marginHorizontal: 0,
		justifyContent: 'center',
		alignItems: 'center',
		minWidth: 60
	},
	disabledButton: {
		opacity: 0.5
	},
	buttonIconWrapper: {
		width: 36,
		height: 36,
		borderRadius: 18,
		paddingTop: Device.isAndroid() ? 2 : 4,
		paddingLeft: 1,
		justifyContent: 'center',
		alignContent: 'center',
		backgroundColor: colors.blue
	},
	buttonIcon: {
		justifyContent: 'center',
		alignContent: 'center',
		textAlign: 'center',
		color: colors.white
	},
	buttonText: {
		marginTop: 8,
		color: colors.blue,
		fontSize: 14
	},
	receive: {
		right: Device.isIos() ? 1 : 0,
		bottom: 1,
		transform: [{ rotate: '90deg' }]
	},
	swapsIcon: {
		right: Device.isAndroid() ? 1 : 0,
		bottom: Device.isAndroid() ? 1 : 0
	},
	buyIcon: {
		right: Device.isAndroid() ? 0.5 : 0,
		bottom: Device.isAndroid() ? 1 : 2
	},
	textWrapperStyle: {}
});

export default assignNestedObj(styles, brandStyles);
