import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	title: {
		fontSize: 20,
		...fontStyles.bold,
	},
	networkName: {
		...fontStyles.bold
	}
});

export default brandStyles;
