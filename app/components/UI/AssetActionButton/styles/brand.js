import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	button: {
		marginHorizontal: 5
	},
	buttonIconWrapper: {
		width: 50,
		height: 50,
		borderRadius: 100,
		backgroundColor: colors.blue,
		borderColor: colors.borderBlue,
		borderWidth: 3
	},
	textWrapperStyle: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center',
		marginTop: 10,
		paddingVertical: 3,
		paddingHorizontal: 10,
		backgroundColor: colors.grey,
		borderColor: colors.blue,
		borderWidth: 2,
		borderRadius: 80,
		shadowColor: colors.blue,
		shadowOpacity: 0.7,
		shadowRadius: 10,
		shadowOffset: {
			height: 1
		}
	},
	buttonIcon: {
		color: colors.white,
		paddingHorizontal: 3
	},
	buttonText: {
		color: colors.white,
		marginTop: 0,
		marginLeft: 5
	},
	receive: {
		transform: [{ rotate: '0deg' }]
	}
});

export default brandStyles;
