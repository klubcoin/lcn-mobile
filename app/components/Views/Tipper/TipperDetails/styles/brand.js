import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';

const styles = StyleSheet.create({
	// overwrite theme for brand here
	contentWrapper: {
		paddingVertical: 0
	},
	scrollViewContainer: {
		paddingVertical: 24
	},
	buttonText: {
		...fontStyles.bold,
		color: colors.blue,
		fontSize: 16,
		marginLeft: 12
	},
	colorBlue: {
		color: colors.blue
	},
	qrCodeWrapper: {
		alignSelf: 'center',
		marginBottom: 20,
		padding: 12,
		backgroundColor: colors.white
	},
	descriptionText: {
		color: colors.grey100
	},
	blueButtonText: {
		fontSize: 16,
		marginLeft: 12
	}
});

export default styles;
