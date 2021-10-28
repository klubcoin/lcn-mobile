import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';
import Device from '../../../../util/Device';

const styles = StyleSheet.create({
	flex: {
		flex: 1,
		backgroundColor: colors.white
	},
	wrapper: {
		top: 0,
		bottom: 0,
		left: 0,
		right: 0,
		position: 'absolute',
		paddingTop: Device.isIphoneX() ? 90 : 50,
		borderTopWidth: 0,
		borderColor: colors.white,
		backgroundColor: colors.white,
		flex: 1,
		width: null,
		height: null
	}
});

const images = {
	a: require('../../../../images/welcome-bg1.jpg'),
	b: require('../../../../images/welcome-bg2.jpg'),
	c: require('../../../../images/welcome-bg3.jpg'),
	d: require('../../../../images/welcome-bg4.jpg'),
	carousel: null
};

export { styles, images };
