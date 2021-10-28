import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/branch';

const styles = StyleSheet.create({
	container: {
		padding: 15,
		borderRadius: 100,
		justifyContent: 'center'
	},
	text: {
		fontSize: 14,
		textAlign: 'center',
		...fontStyles.bold
	},
	blue: {
		backgroundColor: colors.grey,
		borderWidth: 2,
		borderColor: colors.white,
		shadowColor: colors.white,
		shadowOpacity: 0.7,
		shadowRadius: 12,
		shadowOffset: {
			height: 1
		}
	},
	blueText: {
		color: colors.white
	},
	orange: {
		backgroundColor: colors.blue
	},
	orangeText: {
		color: colors.white
	},
	infoText: {
		color: colors.blue
	},
	confirm: {
		backgroundColor: colors.blue,
		minHeight: 50
	},
	confirmText: {
		color: colors.white
	},
	roundedNormal: {
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.blue,
		padding: 8
	},
	roundedNormalText: {
		color: colors.blue
	},
	normal: {
		backgroundColor: colors.grey,
		borderWidth: 2,
		borderColor: colors.blue,
		shadowColor: colors.blue,
		shadowOpacity: 0.7,
		shadowRadius: 12,
		shadowOffset: {
			height: 1
		}
	},
	normalText: {
		color: colors.blue
	},
	transparent: {
		backgroundColor: colors.transparent,
		borderWidth: 0,
		borderColor: colors.transparent
	},
	cancel: {
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.grey400
	},
	cancelText: {
		color: colors.grey400
	},
	signingCancel: {
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.blue
	},
	signingCancelText: {
		color: colors.blue
	},
	warning: {
		backgroundColor: colors.red
	},
	info: {
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.blue
	},
	warningText: {
		color: colors.white
	},
	warningTextEmpty: {
		color: colors.red
	},
	neutral: {
		backgroundColor: colors.white,
		borderWidth: 1,
		borderColor: colors.grey500
	},
	neutralText: {
		color: colors.grey500
	},
	sign: {
		backgroundColor: colors.blue,
		borderWidth: 1,
		borderColor: colors.blue
	},
	signText: {
		color: colors.white
	},
	danger: {
		backgroundColor: colors.red,
		borderColor: colors.red,
		borderWidth: 1
	},
	whiteText: {
		...fontStyles.bold,
		color: colors.white
	},
	viewText: {
		fontSize: 18,
		...fontStyles.bold,
		color: colors.white
	},
	view: {
		borderWidth: 1,
		borderColor: colors.white
	}
});

export { styles };
