import { StyleSheet, Dimensions } from 'react-native';
import Device from '../../../../util/Device';
import { colors, fontStyles, baseStyles } from '../../../../styles/branch';

const IMAGE_1_RATIO = 285 / 203;
const DEVICE_WIDTH = Dimensions.get('window').width;

const IMG_PADDING = Device.isIphoneX() ? 100 : Device.isIphone5S() ? 180 : 220;

const branchStyles = StyleSheet.create({
	textColor: {
		color: colors.fontPrimary
	},
	carouselImage1: {
		marginTop: 30,
		width: DEVICE_WIDTH - IMG_PADDING,
		height: (DEVICE_WIDTH - IMG_PADDING) * IMAGE_1_RATIO
	},
	// eslint-disable-next-line react-native/no-unused-styles
	carouselImage2: {
		width: DEVICE_WIDTH - IMG_PADDING,
		height: (DEVICE_WIDTH - IMG_PADDING) * IMAGE_1_RATIO
	},
	// eslint-disable-next-line react-native/no-unused-styles
	carouselImage3: {
		width: DEVICE_WIDTH - IMG_PADDING,
		height: (DEVICE_WIDTH - IMG_PADDING) * IMAGE_1_RATIO
	},
	circle: {
		backgroundColor: colors.blue
	}
});

const onboarding_carousel = require('../../../../images/klubcoin_lighten.png'); // eslint-disable-line
const branchImgs = [onboarding_carousel, onboarding_carousel, onboarding_carousel];

export { branchStyles, branchImgs };
