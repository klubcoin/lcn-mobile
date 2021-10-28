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
	a: require('../../../../images/welcome-bg1.jpg'),
	b: require('../../../../images/welcome-bg2.jpg'),
	c: require('../../../../images/welcome-bg3.jpg'),
	d: require('../../../../images/welcome-bg4.jpg'),
	carousel: require('../../../../images/klubcoin_filigram_logo.png')
};

export { branchStyles, branchImgs };
