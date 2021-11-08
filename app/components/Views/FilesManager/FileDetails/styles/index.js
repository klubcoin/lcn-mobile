import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import Device from '../../../../../util/Device';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from '../../styles/brand';

const swipeOffset = Device.getDeviceWidth() / 2;

const styles = StyleSheet.create({
	fileContainer: {
		flex: 1,
		flexDirection: 'column',
		alignItems: 'center',
		paddingVertical: 15,
		paddingHorizontal: 30
	},
	fileName: {
		fontSize: 18,
		fontWeight: '600',
		marginLeft: 10
	},
	percent: {
		fontSize: 14,
		fontWeight: '500'
	},
	listContainer: {
		flex: 1,
		width: '100%',
		marginTop: 30,
		alignItems: 'flex-start'
	},
	title: {
		fontSize: 16,
		fontWeight: '500',
		marginBottom: 5
	}
});

export default assignNestedObj(styles, brandStyles);
