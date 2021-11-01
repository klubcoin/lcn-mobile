import React from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, ImageBackground, View } from 'react-native';
import { colors } from '../../../styles';
import Device from '../../../util/Device';
import { brandStyles, brandImgs } from './styles/brand';
import { styles, images } from './styles/index';

const OnboardingScreenWithBg = props => (
	<View style={styles.flex}>
		<ImageBackground
			source={brandImgs[props.screen]}
			style={[styles.wrapper, brandStyles.wrapper]}
			resizeMode={'cover'}
		>
			{props.children}
		</ImageBackground>
	</View>
);

OnboardingScreenWithBg.propTypes = {
	/**
	 * String specifying the image
	 * to be used
	 */
	screen: PropTypes.string,
	/**
	 * Children components of the GenericButton
	 * it can be a text node, an image, or an icon
	 * or an Array with a combination of them
	 */
	children: PropTypes.any
};

export default OnboardingScreenWithBg;
