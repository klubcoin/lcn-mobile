import { StyleSheet } from 'react-native';
import Device from '../../../../util/Device';
import { colors, fontStyles } from '../../../../styles/common';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	scroll: {
		flex: 1
	},
	wrapper: {
		flex: 1,
		alignItems: 'center',
		paddingVertical: 30
	},
	image: {
		alignSelf: 'center',
		width: Device.isIos() ? 90 : 45,
		height: Device.isIos() ? 90 : 45
	},
	termsAndConditions: {
		paddingBottom: 30
	},
	title: {
		fontSize: 24,
		color: colors.fontPrimary,
		...fontStyles.bold,
		textAlign: 'center'
	},
	ctas: {
		flex: 1,
		position: 'relative'
	},
	footer: {
		marginTop: -20,
		marginBottom: 20
	},
	buttonDescription: {
		...fontStyles.normal,
		fontSize: 14,
		textAlign: 'center',
		marginBottom: 16,
		color: colors.fontPrimary,
		lineHeight: 20
	},
	importWrapper: {
		marginVertical: 24
	},
	createWrapper: {
		flex: 1,
		justifyContent: 'flex-end',
		marginBottom: 24
	},
	buttonWrapper: {
		marginBottom: 16
	}
});

export default assignNestedObj(styles, brandStyles);
