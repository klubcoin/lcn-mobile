import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const swipeOffset = Device.getDeviceWidth() / 4;

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 16
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
	floatingButton: {
		borderRadius: 30,
		backgroundColor: colors.blue,
		width: 50,
		height: 50,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		bottom: 30,
		right: 30
	},
	standaloneRowBack: {
		alignItems: 'center',
		backgroundColor: colors.red,
		flex: 1,
		height: 70,
		flexDirection: 'row',
		justifyContent: 'flex-end'
	},
	standaloneRowFront: {
		backgroundColor: colors.white,
		justifyContent: 'center',
		flex: 1,
		height: 70
	},
	swipeableOption: {
		width: swipeOffset,
		alignItems: 'center',
		backgroundColor: colors.red,
		height: '100%',
		justifyContent: 'center'
	}
});

export { styles };
