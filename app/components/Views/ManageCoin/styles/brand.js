import { StyleSheet } from 'react-native';
import Device from '../../../../util/Device';
import { colors, fontStyles } from '../../../../styles/common';
import { RFValue } from 'react-native-responsive-fontsize';

const brandStyles = StyleSheet.create({
	title: {
		color: colors.fontPrimary,
		fontSize: RFValue(24)
	},
	createWrapper: {
		justifyContent: 'center'
	},
	image: {
		alignSelf: 'center',
		width: 200
	},
	buttonWrapper: {
		width: '100%'
	},
	buttonDescription: {
		color: colors.fontPrimary
	},
	ctas: {
		width: '100%',
		justifyContent: 'center',
		paddingHorizontal: 20
	}
});

export default brandStyles;
