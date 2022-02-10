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
		fontWeight:'bold'
	},
	countryCodePicker: {
		justifyContent: 'center',
		paddingLeft: 10,
		// backgroundColor:'red',
		 minWidth:35
	},
	textInput: {
		flex: 1,
		paddingHorizontal: 0,
		paddingRight: 10
	}
});

export default styles;
