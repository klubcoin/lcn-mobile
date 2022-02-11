import { StyleSheet, Dimensions } from 'react-native';
import Device from '../../../../util/Device';
import { colors, fontStyles, baseStyles } from '../../../../styles/common';

const IMAGE_1_RATIO = 285 / 203;
const DEVICE_WIDTH = Dimensions.get('window').width;

const IMG_PADDING = Device.isIphoneX() ? 150 : Device.isIphone5S() ? 180 : 220;

const brandStyles = StyleSheet.create({
	title: {
		color: colors.fontPrimary
	},
	subtitle: {
		color: colors.fontPrimary
	},
	carouselImage1: {
		marginTop: 0,
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
	},
	logoText:{
		marginVertical:30,
		alignSelf: 'center',
	},
	scrollTabs:{
		paddingTop:20,
		flex:0
	},
	progessContainer: {
		flexDirection: 'row',
		alignSelf: 'center',
		marginVertical: 30,
		flex:1
	},
});

export default brandStyles;
