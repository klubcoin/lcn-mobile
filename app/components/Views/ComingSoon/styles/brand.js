import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';

const brandStyles = StyleSheet.create({
	scrollView: {
		flexGrow: 1,
		alignItems: 'center',
		paddingHorizontal:24,
		paddingBottom:12
	},
	image: {
		marginTop: 80
	},
	imageText: {},
	text1: {
		color: colors.blue,
		fontSize:30, 
		fontWeight:'bold',
		marginTop:40
	},
	text2: {
		marginTop:40,
		fontSize:20,
		 fontWeight:'bold',
		 color:colors.white,
		 marginBottom:12
	},
	itemWrapper:{
		backgroundColor:colors.purple,
		flexDirection:'row',
		borderRadius:12,
		marginBottom:10,
		justifyContent:'center',
		alignItems:'center',
		paddingVertical:12,
		width:'100%'
	},
	itemIcon:{
		color:colors.white,
		marginRight:12
	},
	itemText:{
		color:colors.white,
		fontSize:16,
		 fontWeight:'bold'
	},
});

export default brandStyles;
