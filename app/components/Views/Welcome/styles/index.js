import { StyleSheet, Dimensions } from 'react-native';
import Device from '../../../../util/Device';
import { colors, fontStyles } from '../../../../styles/common';
import brandStyles from './brand';
import { assignNestedObj } from '../../../../util/object';

const IMAGE_3_RATIO = 215 / 315;
const IMAGE_2_RATIO = 222 / 239;
const IMAGE_1_RATIO = 285 / 203;
export const DEVICE_WIDTH = Dimensions.get('window').width;

export const IMG_PADDING = Device.isIphoneX() ? 100 : Device.isIphone5S() ? 180 : 120;

const index = StyleSheet.create({
	scroll: {
		flexGrow: 1
	},
	wrapper: {
		paddingVertical: 30,
		flex: 1
	},
	title: {
		fontSize: 24,
		marginBottom: 12,
		color: colors.fontPrimary,
		justifyContent: 'center',
		textAlign: 'center',
		...fontStyles.bold
	},
	subtitle: {
		fontSize: 14,
		lineHeight: 19,
		marginTop: 12,
		marginBottom: 25,
		color: colors.grey500,
		justifyContent: 'center',
		textAlign: 'center',
		...fontStyles.normal
	},
	ctas: {
		paddingHorizontal: 40,
		paddingBottom: Device.isIphoneX() ? 40 : 20,
		flexDirection: 'column'
	},
	ctaWrapper: {
		justifyContent: 'flex-end'
	},
	carouselImage: {},
	// eslint-disable-next-line react-native/no-unused-styles
	carouselImage1: {
		marginTop: 30,
		width: DEVICE_WIDTH - IMG_PADDING,
		height: (DEVICE_WIDTH - IMG_PADDING) * IMAGE_1_RATIO
	},
	// eslint-disable-next-line react-native/no-unused-styles
	carouselImage2: {
		width: DEVICE_WIDTH - IMG_PADDING,
		height: (DEVICE_WIDTH - IMG_PADDING) * IMAGE_2_RATIO
	},
	// eslint-disable-next-line react-native/no-unused-styles
	carouselImage3: {
		width: DEVICE_WIDTH - 60,
		height: (DEVICE_WIDTH - 60) * IMAGE_3_RATIO
	},
	carouselImageWrapper: {
		flexDirection: 'row',
		alignItems: 'center',
		justifyContent: 'center'
	},
	circle: {
		width: 8,
		height: 8,
		borderRadius: 8 / 2,
		backgroundColor: colors.grey500,
		opacity: 0.4,
		marginHorizontal: 8
	},
	solidCircle: {
		opacity: 1
	},
	progessContainer: {
		flexDirection: 'row',
		alignSelf: 'center'
	},
	tab: {
		marginHorizontal: 30
	},
	logoText: {
		width: Device.getDeviceWidth() / 2,
		maxWidth: 200,
		alignSelf: 'center'
	},
	scrollTabs: {}
});

const onboarding_carousel_klubcoin = require('../../../../images/klubcoin.png'); // eslint-disable-line
const klubcoin_text = require('../../../../images/klubcoin_text.png');

const styles = assignNestedObj(index, brandStyles);

export { styles, onboarding_carousel_klubcoin, klubcoin_text };
