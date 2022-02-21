import { colors, fontStyles } from '../../../../styles/common';
import { StyleSheet } from 'react-native';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingTop: 10
	},
	body: {
		paddingTop: 50,
		paddingBottom: 120,
		alignItems: 'center'
	},
	avatarView: {
		borderRadius: 96,
		borderWidth: 2,
		padding: 2,
		borderColor: colors.blue,
		alignItems: 'center',
		justifyContent: 'center'
	},
	avatar: {
		width: 96,
		height: 96,
		borderRadius: 48,
		overflow: 'hidden',
		alignSelf: 'center'
	},
	form: {
		width: '100%',
		maxWidth: 300,
		paddingHorizontal: 20,
		marginTop: 30,
		marginBottom: 30
	},
	textInput: {
		height: 45,
		...fontStyles.normal,
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: 25,
		paddingHorizontal: 10,
		marginBottom: 20,
		fontSize: 18,
		alignItems: 'center',
		textAlign: 'center'
	},
	next: {
		width: 240
	},
	hintLabel: {},
	centerModal: {},
	contentModal: {},
	buttonModal: {},
	notiCenterModal: {},
	notiContentModal: {},
	notiContentText: {},
	notiButtonModal: {}
});

export default assignNestedObj(styles, brandStyles);
