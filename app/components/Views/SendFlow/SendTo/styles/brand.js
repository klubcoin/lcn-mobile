import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import Device from '../../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.black
	},
	inputWrapper: {
		paddingVertical: 20,
	},
	warning:{
		color:'red',
		fontSize:14,
		marginLeft:12
	}
});

export default brandStyles;
