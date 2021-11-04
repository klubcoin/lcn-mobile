import { StyleSheet } from 'react-native';
import Device from '../../../../../util/Device';
import { colors, fontStyles } from '../../../../../styles/common';

const diameter = 40;
const spacing = 8;

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1,
		padding: 24,
		zIndex: 99999999999999
	},
	title: {
		...fontStyles.normal,
		color: colors.fontPrimary,
		fontSize: 20,
		lineHeight: 20
	},
	desc: {
		...fontStyles.normal,
		color: colors.grey500,
		fontSize: 14,
		lineHeight: 20,
		marginTop: 12
	},
	marginTop: {
		marginTop: 18
	},
	picker: {
		borderColor: colors.grey200,
		borderRadius: 5,
		borderWidth: 2,
		marginTop: 16
	},
	simplePicker: {
		marginTop: 16
	},
	setting: {
		marginTop: 50
	},
	firstSetting: {
		marginTop: 0
	},
	inner: {
		paddingBottom: 48
	},
	identicon_container: {
		marginVertical: 16,
		display: 'flex',
		flexDirection: 'row'
	},
	identicon_row: {
		width: '50%',
		alignItems: 'center',
		flexDirection: 'row'
	},
	identicon_type: {
		...fontStyles.bold,
		fontSize: 14,
		marginHorizontal: 10
	},
	blockie: {
		height: diameter,
		width: diameter,
		borderRadius: diameter / 2
	},
	border: {
		height: diameter + spacing,
		width: diameter + spacing,
		borderRadius: (diameter + spacing) / 2,
		backgroundColor: colors.white,
		borderWidth: 2,
		borderColor: colors.white,
		alignItems: 'center',
		justifyContent: 'center'
	},
	selected: {
		borderColor: colors.blue
	},
	selected_text: {
		color: colors.blue
	}
});

export { styles };
