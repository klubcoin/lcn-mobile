import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';


const brandStyles = StyleSheet.create({
	wrapper:{
		paddingHorizontal:12,
		marginTop:80
	},
	title: {
		color: colors.white,
		fontSize:20,
		fontWeight:'700'
	},
	resendButton:{
	},
	resendText:{
		color:colors.white,
		fontSize:20,
		fontWeight:'bold'
	}
});

export default brandStyles;
