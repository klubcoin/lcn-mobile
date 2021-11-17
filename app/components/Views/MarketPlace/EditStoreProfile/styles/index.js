import { StyleSheet } from 'react-native';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
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
		paddingHorizontal: 10,
		marginBottom: 20,
		maxHeight: 50
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
		marginVertical: 5
	},
	next: {
		width: 240
	},
	paymentSection: {
		flexDirection: 'row',
		marginVertical: 10
	},
	orderPayment: {
		flex: 1,
		marginRight: 10
	},
	deliveryPayment: {
		flex: 1,
		marginLeft: 10
	},
	header: {
		fontSize: RFValue(12),
		fontWeight: 'bold'
	},
	explainText: {
		color: colors.grey500,
		marginBottom: 10
	},
	optionButton: {
		padding: 15,
		flexDirection: 'row',
		borderWidth: 1,
		justifyContent: 'space-between',
		alignItems: 'center',
		borderRadius: 5
	},
	optionLabel: {
		fontSize: RFValue(12)
	},
	section: {
		marginTop: 0,
		marginBottom: 20
	},
	selected: {
		borderColor: colors.primaryFox
	}
});

export default assignNestedObj(styles, brandStyles);
