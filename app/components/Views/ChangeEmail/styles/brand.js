import { StyleSheet } from 'react-native';
import Device from '../../../../util/Device';
import { colors, fontStyles } from '../../../../styles/common';

const brandStyles = StyleSheet.create({
	mainWrapper: {
		backgroundColor: colors.transparent
	},
	confirm_input: {
		color: colors.white,
		backgroundColor: colors.purple,
		borderWidth: 0,
		borderRadius: 12
	},
	button: {
		borderRadius: 12,
		width: '100%'
	},
	buttonWrapper: {
		flex: 1,
		marginTop: 20,
		justifyContent: 'flex-end',
		width: '100%'
	},
	label: {
		...fontStyles.normal,
		fontSize: 14,
		color: colors.white,
		paddingHorizontal: 10,
		lineHeight: 18
	},
	input: {
		borderWidth: 0,
		padding: 10,
		fontSize: 14,
		height: 50,
		backgroundColor: colors.purple,
		borderRadius: 12,
		color: colors.white,
		...fontStyles.normal
	},
	ctaWrapper: {
		flex: 1,
		marginTop: 20,
		paddingHorizontal: 10,
		// justifyContent: 'flex-end'
	},
	textInputWrapperStyle: {
		marginBottom: 5
	},
	textContainerStyle: {
		marginTop: 15
	},
	errorText: {
		color: colors.pdfColor
	}
});

export default brandStyles;
