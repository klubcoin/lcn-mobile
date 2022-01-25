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
		height: 36,
		alignItems: 'center',
		justifyContent: 'center',
		marginVertical: 5
	}
});

export default brandStyles;
