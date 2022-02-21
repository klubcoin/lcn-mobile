import { StyleSheet } from 'react-native';
import Device from '../../../../util/Device';
import { colors, fontStyles } from '../../../../styles/common';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1
	},
	header: {
		borderBottomColor: colors.grey400,
		borderBottomWidth: 1,
		...fontStyles.normal
	},
	seedPhrase: {
		backgroundColor: colors.white,
		marginTop: 10,
		paddingBottom: 20,
		paddingLeft: 20,
		paddingRight: 20,
		borderColor: colors.grey400,
		borderBottomWidth: 1,
		fontSize: 20,
		textAlign: 'center',
		color: colors.black,
		...fontStyles.normal
	},
	seedPhraseView: {
		borderRadius: 10,
		borderWidth: 1,
		borderColor: colors.grey400,
		marginTop: 10,
		alignItems: 'center'
	},
	privateCredentialAction: {
		flex: 1,
		flexDirection: 'row',
		alignItems: 'center'
	},
	rowWrapper: {
		padding: 20
	},
	warningWrapper: {
		backgroundColor: colors.red000
	},
	warningRowWrapper: {
		flex: 1,
		flexDirection: 'row',
		alignContent: 'center',
		alignItems: 'center'
	},
	warningText: {
		marginTop: 10,
		color: colors.red,
		...fontStyles.normal
	},
	input: {
		borderWidth: 2,
		borderRadius: 5,
		borderColor: colors.grey000,
		padding: 10
	},
	icon: {
		margin: 10,
		color: colors.red
	},
	actionIcon: {
		margin: 10,
		color: colors.blue
	},
	actionText: {
		color: colors.blue
	},
	warningMessageText: {
		marginLeft: 10,
		marginRight: 40,
		...fontStyles.normal
	},
	enterPassword: {
		marginBottom: 15
	},
	tabContent: {
		padding: 20
	},
	qrCodeWrapper: {
		marginTop: 20,
		padding: 20,
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: 'white'
	},
	tabUnderlineStyle: {
		height: 2,
		backgroundColor: colors.blue
	},
	tabStyle: {
		paddingBottom: 0,
		backgroundColor: colors.beige
	},
	textStyle: {
		fontSize: 12,
		letterSpacing: 0.5,
		...fontStyles.bold
	},
	label: {
		...fontStyles.bold
	}
});

export default assignNestedObj(styles, brandStyles);
