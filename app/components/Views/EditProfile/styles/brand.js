import { colors, fontStyles } from '../../../../styles/common';
import { StyleSheet } from 'react-native';

const brandStyles = StyleSheet.create({
	container: {
		marginTop: 20
	},
	textInput: {
		color: colors.white,
		backgroundColor: colors.purple,
		borderRadius: 10,
		textAlign: 'left'
	},
	hintLabel: {
		marginBottom: 10,
		color: colors.white,
		...fontStyles.bold
	},
	form: {
		paddingHorizontal: 0,
		marginTop: 10
	},
	next: {
		width: '80%',
		maxWidth: 300
	},
	fullname: {
		color: 'white',
		marginTop: 10,
		fontSize: 28,
		...fontStyles.bold
	},
	centerModal:{
		backgroundColor:colors.greytransparent100,
		justifyContent:"center",
		width:'100%',
		height:'100%',
		alignItems:'center',

	},
	contentModal:{
		backgroundColor:colors.purple500,
		width:'60%',
		alignItems:"center",
		paddingVertical:20,
		paddingHorizontal:20,
		borderRadius:12
	},
	buttonModal:{
		width:'100%',
		marginVertical:12
	}
});

export default brandStyles;
