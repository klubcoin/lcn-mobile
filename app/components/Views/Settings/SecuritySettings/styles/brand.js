import { StyleSheet } from 'react-native';
import Device from '../../../../../util/Device';
import { colors, fontStyles } from '../../../../../styles/common';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.transparent,
		padding: 20
	},
	title: {
		...fontStyles.bold
	},
	image: {
		alignSelf: 'center',
		width: 200
	},
	desc: {
		color: colors.grey300
	},
	identicon_type: {
		color: colors.grey300
	},
	selected_text: {
		color: colors.blue
	},
	setting: {
		backgroundColor: colors.purple,
		padding: 20,
		borderRadius: 10,
		marginTop: 0,
		marginBottom: 20,
	},
	firstSetting: {
		marginBottom: 20
	},
	modalView: {
		alignItems: 'center',
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		padding: 20
	}
});

export default brandStyles;
