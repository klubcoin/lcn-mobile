import { StyleSheet } from 'react-native';
import { RFValue } from 'react-native-responsive-fontsize';
import { colors, fontStyles } from '../../../../../styles/common';
import Device from '../../../../../util/Device';
import { assignNestedObj } from '../../../../../util/object';
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
	backIcon: {
		color: colors.primaryFox
	},
	navBar: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 10
	},
	titleNavBar: {
		textAlign: 'center',
		flex: 1,
		fontSize: RFValue(15),
		color: colors.primaryFox,
		marginVertical: 5
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
		paddingHorizontal: 20,
		marginTop: 30,
		marginBottom: 30
	},
	textInput: {
		borderBottomColor: colors.primaryFox,
		borderBottomWidth: 2,
		// height: 45,
		// ...fontStyles.normal,
		// borderWidth: StyleSheet.hairlineWidth,
		// borderRadius: 25,
		paddingHorizontal: 10,
		marginBottom: 20,
		maxHeight: 50
		// fontSize: 18,
		// alignItems: 'center',
		// textAlign: 'center',
	},
	outline: {
		maxHeight: 100,
		paddingVertical: 20
	},
	containerOutline: {
		maxHeight: 100
	},
	inputOutline: {
		maxHeight: 100,
		overflow: 'hidden'
	},
	input: {
		marginVertical: 10
	},
	next: {
		width: 240
	}
});

export default assignNestedObj(styles, brandStyles);
