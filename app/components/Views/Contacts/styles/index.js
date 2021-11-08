import { StyleSheet, Dimensions } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1
	},
	addContact: {
		marginHorizontal: 24,
		marginBottom: 16
	},
	searchSection: {
		marginHorizontal: 20,
		marginVertical: 10,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 8,
		borderColor: colors.grey100
	},
	textInput: {
		flex: 1,
		height: 30,
		...fontStyles.normal
	},
	icon: {
		padding: 16
	},
	online: {
		position: 'absolute',
		top: 8,
		right: 10,
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.green500
	},
	selectedBar: {
		position: 'absolute',
		width: 5,
		height: '100%',
		left: 0,
		backgroundColor: colors.blue
	},
	bottomModal: {
		flex: 1,
		justifyContent: 'flex-end',
		margin: 0
	},
	scanQR: {
		backgroundColor: colors.white,
		paddingHorizontal: 20,
		paddingTop: 30,
		paddingBottom: 40,
		alignItems: 'center'
	},
	qrTitle: {
		marginBottom: 10,
		fontSize: 16,
		color: colors.fontPrimary
	},
	shareQR: {
		width: 300,
		marginTop: 20
	}
});

export default assignNestedObj(styles, brandStyles);
