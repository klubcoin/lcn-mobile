import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { colors, fontStyles } from '../../../styles/common';
import StepIndicator from 'react-native-step-indicator';

const strokeWidth = 5;

export default class OnboardingProgress extends PureComponent {
	static defaultProps = {
		currentStep: 0
	};

	static propTypes = {
		/**
		 * int specifying the currently selected step
		 */
		currentStep: PropTypes.number,
		/**
		 * array of text strings representing each step
		 */
		steps: PropTypes.array.isRequired
	};

	customStyles = {
		stepIndicatorSize: 50,
		currentStepIndicatorSize: 50,
		separatorStrokeWidth: strokeWidth,
		separatorFinishedColor: colors.purple,
		separatorUnFinishedColor: colors.purple,
		currentStepStrokeWidth: strokeWidth,
		stepStrokeCurrentColor: colors.purple100,
		stepStrokeWidth: strokeWidth,
		stepStrokeFinishedColor: colors.purple,
		stepStrokeUnFinishedColor: colors.purple,
		stepIndicatorFinishedColor: colors.purple,
		stepIndicatorUnFinishedColor: colors.purple,
		stepIndicatorCurrentColor: colors.purple100,
		stepIndicatorLabelFontSize: 9,
		currentStepIndicatorLabelFontSize: 9,
		stepIndicatorLabelCurrentColor: colors.white,
		stepIndicatorLabelFinishedColor: colors.white,
		stepIndicatorLabelUnFinishedColor: colors.grey100,
		labelColor: colors.grey500,
		stepIndicatorLabelFontFamily: fontStyles.normal.fontFamily,
		labelFontFamily: fontStyles.normal.fontFamily,
		labelSize: 10,
		currentStepLabelColor: colors.white,
		finishedStepLabelColor: colors.grey500,
		unfinishedStepLabelColor: colors.grey500
	};

	render() {
		const { currentStep, steps } = this.props;
		return (
			<StepIndicator
				customStyles={this.customStyles}
				currentPosition={currentStep}
				labels={steps}
				stepCount={steps.length}
			/>
		);
	}
}
