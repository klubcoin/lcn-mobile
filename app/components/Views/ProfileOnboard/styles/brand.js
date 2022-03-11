import { colors, fontStyles } from '../../../../styles/common';
import { StyleSheet } from 'react-native';

const brandStyles = StyleSheet.create({
	container: {
		marginTop: 20
	},
	textInput: {
		color: colors.white,
		backgroundColor: colors.purple,
		borderRadius: 10,
		textAlign: 'left'
	},
	hintLabel: {
		marginBottom: 10,
		color: colors.white,
		...fontStyles.bold
	},
	form: {
		paddingHorizontal: 0,
		marginTop: 10
	},
	next: {
		width: '80%',
		maxWidth: 300
	},
	centerModal: {
		backgroundColor: colors.greytransparent100,
		justifyContent: 'center',
		width: '100%',
		height: '100%',
		alignItems: 'center'
	},
	contentModal: {
		backgroundColor: colors.purple500,
		width: '60%',
		alignItems: 'center',
		paddingVertical: 20,
		paddingHorizontal: 20,
		borderRadius: 12
	},
	buttonModal: {
		width: '100%',
		marginVertical: 12
	},
	notiCenterModal: {
		backgroundColor: colors.greytransparent100,
		justifyContent: 'center',
		width: '100%',
		height: '100%',
		alignItems: 'center'
	},
	notiContentText: {
		color: colors.red,
		fontSize: 20,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	notiContentModal: {
		backgroundColor: colors.white,
		width: '80%',
		justifyContent: 'space-around',
		alignItems: 'center',
		paddingVertical: 20,
		paddingHorizontal: 20,
		borderRadius: 12,
		minHeight: 200
	},
	notiButtonModal: {
		width: '100%',
		marginVertical: 12
	},
	errorText: {
		color: colors.pdfColor
	},
	textInputWrapperStyle: {
		marginBottom: 5
	},
	textContainerStyle: {
		marginTop: 15
	}
});

export default brandStyles;
