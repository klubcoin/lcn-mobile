import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';
import Device from '../../../../util/Device';

const brandStyles = StyleSheet.create({
	wrapper: {
		borderColor: colors.black,
		backgroundColor: colors.black,
		paddingTop: 0
	}
});

const brandImgs = {
	a: require('../../../../images/klubcoin_filigram_logo.png'),
	b: require('../../../../images/klubcoin_filigram_logo.png'),
	c: require('../../../../images/klubcoin_filigram_logo.png'),
	d: require('../../../../images/klubcoin_filigram_logo.png'),
	carousel: require('../../../../images/klubcoin_filigram_logo.png')
};

export default brandStyles;
