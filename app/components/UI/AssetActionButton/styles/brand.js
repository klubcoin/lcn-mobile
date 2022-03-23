import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { RFValue } from 'react-native-responsive-fontsize';

const brandStyles = StyleSheet.create({
	button: {
		// marginHorizontal: 5,
		padding: 10,
		backgroundColor: colors.lightPurple,
		borderRadius: 10,
		flex: 1,
	},
	buttonIconWrapper: {
		width: 48,
		height: 48,
		borderRadius: 100,
		backgroundColor: colors.primaryFox,
		alignItems: 'center',
		justifyContent: 'center'
	},
	textWrapperStyle: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 4,
	},
	buttonIcon: {
		color: colors.white,
		paddingHorizontal: 3,
	},
	buttonText: {
		color: colors.white,
		marginTop: 1,
		...fontStyles.bold,
		fontSize: RFValue(14)
	},
	receive: {
		transform: [{ rotate: '0deg' }]
	},
	imageIcon: {
		width: 25,
		height: 25,
	}
});

export default brandStyles;
