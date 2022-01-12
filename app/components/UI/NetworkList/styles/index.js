import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.grey,
		borderRadius: 10,
		minHeight: 450
	},
	titleWrapper: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey100
	},
	title: {
		textAlign: 'center',
		fontSize: 18,
		marginVertical: 12,
		marginHorizontal: 20,
		color: colors.fontPrimary,
		...fontStyles.bold
	},
	otherNetworksHeader: {
		marginTop: 0,
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey100
	},
	otherNetworksText: {
		textAlign: 'left',
		fontSize: 13,
		marginVertical: 12,
		marginHorizontal: 20,
		color: colors.fontPrimary,
		...fontStyles.bold
	},
	networksWrapper: {
		flex: 1
	},
	network: {
		borderBottomWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey100,
		flexDirection: 'row',
		paddingHorizontal: 20,
		paddingVertical: 20,
		paddingLeft: 45
	},
	mainnet: {
		borderBottomWidth: 0,
		flexDirection: 'column'
	},
	networkInfo: {
		marginLeft: 15,
		flex: 1
	},
	networkLabel: {
		fontSize: 16,
		color: colors.fontPrimary,
		...fontStyles.normal
	},
	footer: {
		borderTopWidth: StyleSheet.hairlineWidth,
		borderColor: colors.grey100,
		height: 60,
		justifyContent: 'center',
		flexDirection: 'row',
		alignItems: 'center'
	},
	footerButton: {
		flex: 1,
		alignContent: 'center',
		alignItems: 'center',
		justifyContent: 'center',
		height: 60
	},
	closeButton: {
		fontSize: 16,
		color: colors.blue,
		...fontStyles.normal
	},
	networkIcon: {
		width: 15,
		height: 15,
		borderRadius: 100,
		marginTop: 3
	},
	networkWrapper: {
		flex: 0,
		flexDirection: 'row'
	},
	selected: {
		position: 'absolute',
		marginLeft: 20,
		marginTop: 20
	},
	mainnetSelected: {
		marginLeft: -30,
		marginTop: 3
	},
	otherNetworkIcon: {
		backgroundColor: colors.transparent,
		borderColor: colors.grey100,
		borderWidth: 2
	}
});

export default assignNestedObj(styles, brandStyles);
