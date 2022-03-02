import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';
import { RFValue } from 'react-native-responsive-fontsize';
import { color } from 'react-native-reanimated';

const cardTextStyle = {
	color: colors.white,
	fontSize: RFValue(12),
	...fontStyles.normal
}

const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: colors.primaryFox,
		paddingHorizontal: 10,
	},
	loader: {
		backgroundColor: colors.white,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	},
	title: {
		marginBottom: 15,
		marginTop: 20,
	},
	titleText: {
		fontSize: RFValue(18),
		...fontStyles.bold,
		color: colors.white
	},
	row: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
	},
	card: {
		flex: 1,
		backgroundColor: colors.purple,
		borderRadius: 10,
		marginRight: 15,
		paddingHorizontal: 10,
		paddingVertical: 20,
		height: '100%'
	},
	cardTitle: cardTextStyle,
	extraCardTitle: {
		...cardTextStyle,
		color: colors.blue,
	},
	cardContent: {
		marginTop: 5,
	},

	balance: {
		fontSize: RFValue(16),
		color: colors.white,
		...fontStyles.bold
	},
	currency: {
		...cardTextStyle,
		fontSize: RFValue(12),
	},
	btnWrapper: {
		marginTop: 20,
	},
	btn: {
		backgroundColor: colors.white,
		padding: 10,
		alignItems: "center",
		borderRadius: 10,
	},
	btnText: {
		...fontStyles.bold,
		fontSize: RFValue(16),
		color: colors.purple
	},
	comingSoon:{}
});

export default assignNestedObj(styles, brandStyles);
