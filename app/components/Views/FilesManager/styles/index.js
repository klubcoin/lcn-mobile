import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const swipeOffset = Device.getDeviceWidth() / 2;

const styles = StyleSheet.create({
	container: {
		flex: 1
	},
	header: {
		height: '30%',
		borderRadius: 30
	},
	searchSection: {
		marginHorizontal: 20,
		marginVertical: 10,
		padding: 10,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 8,
		borderColor: colors.grey100
	},
	textInput: {
		flex: 1,
		height: 30,
		marginLeft: 5,
		paddingVertical: 0
	},
	files: {
		paddingVertical: 16
	},
	customButton: {
		position: 'absolute',
		bottom: 30
	},
	title: {
		fontSize: 16,
		fontWeight: '500',
		marginBottom: 5
	},
	standaloneRowBack: {
		alignItems: 'center',
		backgroundColor: colors.red,
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-end'
	},
	standaloneRowFront: {
		backgroundColor: colors.white,
		justifyContent: 'center'
	},
	swipeableOption: {
		width: swipeOffset / 2,
		alignItems: 'center',
		backgroundColor: colors.red,
		height: '100%',
		justifyContent: 'center'
	},
	icon: {
		color: colors.primaryFox
	}
});

export default assignNestedObj(styles, brandStyles);
