import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white
	},
	titleWrapper: {
		borderBottomWidth: 0
	},
	title: {
		color: colors.black,
		fontSize: RFValue(20),
		alignSelf: 'flex-start'
	},
	networksWrapper: {
		paddingHorizontal: 10,
		marginBottom: 10
	},

	networkLabel: {
		color: colors.black
	},
	otherNetworksText: {
		color: colors.black,
		fontSize: RFValue(16),
		marginLeft: 0
	},
	otherNetworksHeader: {
		borderBottomWidth: 0
	},
	network: {
		borderBottomWidth: 0,
		borderRadius: 10,
		marginBottom: 10
	},
	footer: {
		borderTopWidth: 0,
		paddingHorizontal: 10,
		marginBottom: 10
	},
	closeButton: {
		color: colors.black,
		...fontStyles.bold
	},
	networkWrapper: {
		justifyContent: 'space-between'
	},
	selected: {
		position: 'relative',
		marginTop: 0
	}
});

export default brandStyles;
