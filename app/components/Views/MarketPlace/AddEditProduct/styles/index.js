import { StyleSheet } from 'react-native';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { colors } from '../../../../../styles/common';
import { assignNestedObj } from '../../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	root: {
		flex: 1,
		backgroundColor: 'transparent'
	},
	body: {
		flex: 1,
		width: 200,
		shadowColor: colors.black,
		shadowOffset: {
			width: 1,
			height: 0
		},
		shadowOpacity: 0.3,
		shadowRadius: 1
	},
	close: {
		marginLeft: 10,
		marginTop: 10,
		width: 25
	},
	profile: {
		alignItems: 'center',
		marginTop: 30
	},
	name: {
		marginTop: 10,
		fontSize: 16,
		fontWeight: '600'
	},
	address: {
		fontSize: 12,
		marginTop: 5,
		color: colors.grey600
	},
	menuItem: {
		padding: 10,
		flexDirection: 'row',
		alignItems: 'center'
	},
	menuTitle: {
		flex: 1,
		marginLeft: 10,
		fontWeight: '600',
		fontSize: 14
	},
	footer: {
		flexDirection: 'row',
		alignItems: 'center',
		marginBottom: 20
	},
	setting: {
		padding: 10,
		flexDirection: 'row',
		alignItems: 'center'
	},
	settingText: {
		marginLeft: 10,
		fontWeight: '600',
		fontSize: 14
	},
	navBar: {
		flexDirection: 'row',
		alignItems: 'center'
	},
	navButton: {
		width: 32,
		height: 32,
		alignItems: 'center',
		justifyContent: 'center'
	},
	backIcon: {
		color: colors.blue
	},
	selectOption: {
		flexDirection: 'row',
		marginHorizontal: 20,
		borderWidth: StyleSheet.hairlineWidth,
		borderRadius: 4,
		borderColor: colors.grey300,
		alignItems: 'center',
		marginTop: 8
	},
	option: {
		flex: 1,
		padding: 10
	},
	dropdownIcon: {
		marginHorizontal: 10,
		alignSelf: 'center'
	},
	headingTitle: {
		fontSize: 24,
		fontWeight: '600',
		color: colors.grey,
		marginTop: 20,
		paddingHorizontal: 10
	},
	line: {
		height: 1,
		backgroundColor: colors.grey100,
		marginHorizontal: 40,
		marginVertical: 20
	},
	heading: {
		paddingHorizontal: 20,
		marginTop: 15,
		fontSize: 16
	},
	buttons: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginTop: 30
	},
	save: {
		width: 140
	},
	cancel: {
		width: 140,
		marginLeft: 20
	},
	input: {
		height: 36,
		marginTop: 10,
		paddingHorizontal: 10,
		marginHorizontal: 20,
		paddingVertical: 0,
		borderRadius: 4,
		borderColor: colors.grey400,
		borderWidth: StyleSheet.hairlineWidth
	},
	containerPrice: {
		flexDirection: 'row'
	},
	price: {
		flex: 3
	},
	stickerContainer: {
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'center',
		alignItems: 'center',
		borderLeftColor: colors.grey300,
		borderLeftWidth: 1,
		marginLeft: 5
	},
	tokenLogo: {
		width: RFPercentage(3),
		height: RFPercentage(3),
		marginLeft: 5
	},
	tokenName: {
		marginBottom: 0,
		marginLeft: 10,
		fontSize: RFValue(12),
		color: colors.black,
		fontWeight: '500',
		overflow: 'scroll'
	},
	desc: {
		height: 100,
		marginTop: 10,
		paddingHorizontal: 10,
		marginHorizontal: 20,
		borderRadius: 4,
		borderColor: colors.grey400,
		borderWidth: StyleSheet.hairlineWidth
	},
	tags: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginHorizontal: 20,
		marginTop: 10
	},
	chip: {
		borderRadius: 20,
		paddingVertical: 5,
		paddingHorizontal: 12,
		marginRight: 8,
		marginBottom: 10,
		borderStyle: 'dotted',
		borderWidth: StyleSheet.hairlineWidth,
		alignItems: 'center'
	},
	addChip: {
		width: 27,
		height: 27,
		borderRadius: 20,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.orange
	},
	addIcon: {
		color: colors.white
	},
	photos: {
		flexDirection: 'row',
		flexWrap: 'wrap',
		marginHorizontal: 20,
		marginTop: 10
	},
	photo: {
		marginRight: 10,
		marginBottom: 15,
		borderStyle: 'dashed',
		borderWidth: StyleSheet.hairlineWidth
	},
	image: {
		width: 72,
		height: 72
	},
	addImageIcon: {
		position: 'absolute',
		top: 20,
		right: 25,
		color: colors.orange
	}
});

export default assignNestedObj(styles, brandStyles);
