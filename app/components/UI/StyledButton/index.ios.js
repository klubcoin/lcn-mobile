import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { ViewPropTypes, Text } from 'react-native';
import Button from 'react-native-button';
import getStyles from './styles/index';
import { styles } from './styles/brand';
/**
 * UI component that renders a styled button
 * for iOS devices
 * see styledButtonStyles.js for available styles
 */
export default class StyledButton extends PureComponent {
	static propTypes = {
		/**
		 * Children components of the Button
		 * it can be a text node, an image, or an icon
		 * or an Array with a combination of them
		 */
		children: PropTypes.any,
		/**
		 * Type of the button
		 */
		disabled: PropTypes.bool,
		/**
		 * Styles to be applied to the Button Text
		 */
		style: Text.propTypes.style,
		/**
		 * Styles to be applied to the Button disabled state text
		 */
		styleDisabled: Text.propTypes.style,
		/**
		 * Styles to be applied to the Button disabled container
		 */
		disabledContainerStyle: ViewPropTypes.style,
		/**
		 * Styles to be applied to the Button Container
		 */
		containerStyle: ViewPropTypes.style,
		/**
		 * Function to be called on press
		 */
		onPress: PropTypes.func,
		/**
		 * Function to be called on press out
		 */
		onPressOut: PropTypes.func,
		/**
		 * Type of the button
		 */
		type: PropTypes.string,
		/**
		 * ID of the element to be used on e2e tests
		 */
		testID: PropTypes.string
	};

	static defaultProps = {
		...PureComponent.defaultProps,
		styleDisabled: { opacity: 0.6 },
		disabledContainerStyle: { opacity: 0.6 }
	};

	capitalizeFirstLetter = string => {
		return string.charAt(0).toUpperCase() + string.slice(1);
	};

	render = () => {
		const {
			type,
			onPress,
			onPressOut,
			style,
			children,
			disabled,
			styleDisabled,
			testID,
			disabledContainerStyle
		} = this.props;
		const { fontStyle, containerStyle } = getStyles(type);

		const typeArr = type.split('-');
		typeArr.forEach((element, index) => {
			if (typeArr.indexOf(element) != 0) typeArr[index] = this.capitalizeFirstLetter(element);
		});
		const formattedTypes = typeArr.join('');

		return (
			<Button
				testID={testID}
				accessibilityLabel={this.props.testID}
				disabled={disabled}
				styleDisabled={disabled ? styleDisabled : null}
				disabledContainerStyle={disabled ? disabledContainerStyle : null}
				onPress={onPress}
				onPressOut={onPressOut}
				style={[...fontStyle, styles[`${formattedTypes}Text`], style]}
				containerStyle={[...containerStyle, styles[formattedTypes], this.props.containerStyle]}
				activeOpacity={0.6}
			>
				{children}
			</Button>
		);
	};
}
