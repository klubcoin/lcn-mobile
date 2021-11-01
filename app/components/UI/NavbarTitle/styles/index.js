import { StyleSheet } from 'react-native';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';

const styles = StyleSheet.create({
	wrapper: {
		alignItems: 'center',
		flex: 1
	},
	network: {
		flexDirection: 'row'
	},
	networkName: {
		fontSize: 11,
		color: colors.grey400,
		...fontStyles.normal
	},
	networkIcon: {
		width: 5,
		height: 5,
		borderRadius: 100,
		marginRight: 5,
		marginTop: Device.isIos() ? 4 : 5
	},
	title: {
		fontSize: 18,
		...fontStyles.normal,
		color: colors.black
	},
	otherNetworkIcon: {
		backgroundColor: colors.transparent,
		borderColor: colors.grey100,
		borderWidth: 1
	}
});

export { styles };
