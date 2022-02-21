import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';

const styles = StyleSheet.create({
	//Update brand styles here
	centerModal: {
		backgroundColor: colors.greytransparent,
		width: '100%',
		height: '100%',
		justifyContent:'center',
		alignItems:'center'
	},
	container: {
		backgroundColor: colors.primaryFox,
		paddingTop: 80,
		paddingBottom:30,
		height: '100%',
		width: '100%',
		borderRadius:12
	},
	inputView: {
		width: '100%',
		height: 48,
		marginBottom: 20,
		paddingHorizontal: 20
	},
	inputInner: {
		width: '100%',
		height: '100%',
		borderWidth: 0.5,
		borderColor: colors.grey,
		borderRadius: 10,
		paddingLeft: 10,
		paddingRight: 30
	},
	search: {
		width: '100%',
		height: 48,
		paddingHorizontal: 8,
		backgroundColor:colors.purple,
		borderRadius:12,
		color:colors.white
	},
	delete: {
		position: 'absolute',
		right: 8,
		top: 12,
		width: 24,
		height: 24,
		alignItems: 'center',
		justifyContent: 'center'
	},
	clear: {
		width: 14,
		height: 14,
		resizeMode: 'contain'
	},
	option: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 20
	},
	flag: {
		width: 32,
		height: 32,
		fontSize: 28
	},
	content: {
		flex: 1,
		flexDirection: 'row',
		marginLeft: 16,
		paddingRight: 8,
		paddingVertical: 12,
		borderBottomWidth: 0.5,
		borderColor: colors.white
	},
	name: {
		flex: 1,
		fontSize: 14,
		color: colors.white
	},
	iconCheck: {
		position: 'absolute',
		alignSelf: 'center',
		right: 0,
		width: 20,
		height: 20,
		resizeMode: 'contain'
	},
	dialCode:{
		width:50,
		color:colors.white
	},
	iconClose:{
		alignSelf:"flex-end",
		marginRight:20,
		marginBottom:20
	}
});

export default styles;
