import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';

const styles = StyleSheet.create({
	//Update brand styles here
	textInputWrapper:{
		flexDirection:'row',
		backgroundColor: colors.purple,
		paddingHorizontal: 10,
		borderRadius: 10,
		height: 45,
		alignItems:'center',
		marginBottom: 20,

	},	
	textInput: {
		flex:1,
		color: colors.white,
		textAlign: 'left',
		fontSize: 16,
		paddingHorizontal:0,
		alignItems: 'center',
		marginBottom:0,
		...fontStyles.normal
	},
});

export default styles;
