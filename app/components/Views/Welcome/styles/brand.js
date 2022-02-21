import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';


const brandStyles = StyleSheet.create({
	title: {
		color: colors.fontPrimary
	},
	subtitle: {
		color: colors.fontPrimary
	},
	circle: {
		backgroundColor: colors.blue
	},
	logoText:{
		marginVertical:30,
		alignSelf: 'center',
	},
	scrollTabs:{
		paddingTop:20,
		flex:0,
	},
	progessContainer: {
		flexDirection: 'row',
		alignSelf: 'center',
		flex:1,
		alignItems:'center'
	},
});

export default brandStyles;
