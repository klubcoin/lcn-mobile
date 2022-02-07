import { StyleSheet } from 'react-native';
import Device from '../../../../../util/Device';
import { colors, fontStyles } from '../../../../../styles/common';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1,
		padding: 24,
		paddingBottom: 48
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
	setting: {
		marginTop: 50
	},
	firstSetting: {
		marginTop: 0
	},
	modalView: {
		alignItems: 'center',
		flex: 1,
		flexDirection: 'column',
		justifyContent: 'center',
		padding: 20
	},
	modalText: {
		...fontStyles.normal,
		fontSize: 16,
		textAlign: 'center',
		color: colors.black
	},
	modalTitle: {
		...fontStyles.bold,
		fontSize: 24,
		textAlign: 'center',
		marginBottom: 20,
		color: colors.black
	},
	picker: {
		borderColor: colors.grey200,
		borderRadius: 5,
		borderWidth: 2,
		marginTop: 16
	},
	inner: {
		paddingBottom: 48
	},
	ipfsGatewayLoadingWrapper: {
		height: 37,
		alignItems: 'center',
		justifyContent: 'center'
	},
	modalActionView: {
		borderTopWidth: 0
	}
});

export default assignNestedObj(styles, brandStyles);
