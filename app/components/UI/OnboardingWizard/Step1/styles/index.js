import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import Device from '../../../../../util/Device';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	main: {
		flex: 1
	},
	coachmark: {
		marginHorizontal: 16
	},
	coachmarkContainer: {
		flex: 1,
		position: 'absolute',
		left: 0,
		right: 0,
		bottom: Device.isIphoneX() ? 36 : Device.isIos() ? 16 : 36
	}
});

export default assignNestedObj(styles, brandStyles);
