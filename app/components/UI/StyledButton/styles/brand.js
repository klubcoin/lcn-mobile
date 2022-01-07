import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';

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
	confirmText: {
		color: colors.blue
	},
	roundedNormal: {
		backgroundColor: colors.grey,
		borderWidth: 1,
		borderColor: colors.blue,
		padding: 8,
		shadowColor: colors.blue,
		shadowOpacity: 0.7,
		shadowRadius: 12,
		shadowOffset: {
			height: 1
		}
	},
	roundedNormalText: {
		color: colors.white,
		...fontStyles.bold
	},
	normal: {
		backgroundColor: colors.blue,
		borderRadius: 15
	},
	normalPadding: {
		backgroundColor: colors.blue,
		borderRadius: 15,
		padding: 20
	},
	normalText: {
		color: colors.black
	},
	normalPaddingText: {
		color: colors.black
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
		borderColor: colors.black
	},
	neutralText: {
		color: colors.black
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
	},
	pink: {
		backgroundColor: colors.pink,
		borderRadius: 15,
		paddingVertical: 20
	},
	pinkText: {
		color: colors.black
	},
	white: {
		backgroundColor: colors.white,
		borderRadius: 15
	},
	whitePadding: {
		backgroundColor: colors.white,
		borderRadius: 15,
		paddingVertical: 20
	},
	whitePaddingText: {
		color: colors.black
	}
});

export { styles };
