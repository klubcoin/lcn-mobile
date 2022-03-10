import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';

const styles = StyleSheet.create({
	//Update brand styles here

	phoneWrapper: {
		flex: 1,
		backgroundColor: colors.purple,
		borderRadius: 10,
		flexDirection: 'row',
		height: 45
	},
	countryCode: {
		color: colors.white,
		fontSize: 16,
		fontWeight: 'bold'
	},
	countryCodePicker: {
		justifyContent: 'center',
		paddingLeft: 10,
		minWidth: 55,
		borderRightWidth: 1,
		flexDirection:"row", 
		alignItems:'center',
		justifyContent:'flex-end'
	},
	textInputWrapper:{
		flex:1,
		flexDirection:'row',
		paddingHorizontal: 10,
		borderRadius: 10,
		backgroundColor: colors.purple,
		alignItems:'center'
	},
	textInput: {
		flex: 1,
		paddingHorizontal: 10,
		paddingHorizontal:0,
		alignItems: 'center',
		marginBottom:0,
	},
	dropdownIcon: {
		color: colors.white,
		fontSize:16,
		marginLeft:6,
		marginRight:12,
	}
});

export default styles;
