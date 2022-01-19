import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.purple,
		borderBottomLeftRadius: 10,
		borderBottomRightRadius: 10,
		paddingTop: 10,
	},
	emptyView: {
		backgroundColor: colors.transparent
	}
});

export default brandStyles;
