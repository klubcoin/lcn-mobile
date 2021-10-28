import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/branch';
import Device from '../../../../util/Device';

const branchStyles = StyleSheet.create({
	wrapper: {
		borderColor: colors.black,
		backgroundColor: colors.black
	}
});

const branchImgs = {
	a: require('../../../../images/klubcoin_filigram_logo.png'),
	b: require('../../../../images/klubcoin_filigram_logo.png'),
	c: require('../../../../images/klubcoin_filigram_logo.png'),
	d: require('../../../../images/klubcoin_filigram_logo.png'),
	carousel: require('../../../../images/klubcoin_filigram_logo.png')
};

export { branchStyles, branchImgs };
