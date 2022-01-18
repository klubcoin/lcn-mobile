import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { RFValue } from 'react-native-responsive-fontsize';

const deviceHeight = Device.getDeviceHeight();
const breakPoint = deviceHeight < 700;

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.primaryFox
	},
	tabUnderlineStyle: {
		height: 0,
		backgroundColor: colors.transparent
	},
	textStyle: {
		fontSize: RFValue(12)
	},
	imgBackground: {
		backgroundColor: colors.black,
		flex: 1
	},
	tabWrapper: {
		marginHorizontal: 20,
		marginBottom: 20,
		borderRadius: 10,
		// backgroundColor: colors.purple
	},
	tabStyle: {
		borderTopRightRadius: 10,
		borderTopLeftRadius: 10,
	}
});

export default brandStyles;
