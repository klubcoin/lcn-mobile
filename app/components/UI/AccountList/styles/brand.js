import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.primaryFox,
		paddingHorizontal: 12
	},
	footerButton: {
		width: '100%',
		alignItems: 'center',
		justifyContent: 'center',
		marginVertical: 5,
		backgroundColor: colors.blue,
		borderWidth: 0,
		paddingVertical: 20,
	},
	footer: {
		paddingHorizontal: 30,
		alignItems: 'center',
		justifyContent: 'flex-start',
		paddingBottom: Device.isIphoneX() ? 30 : 110,
		paddingTop: 10,
	},
	btnText: {
		color: colors.black,
		...fontStyles.bold,
		fontSize: 14,
	}
});

export default brandStyles;
