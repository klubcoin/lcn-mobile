import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { colors } from '../../../styles/common';
import { testID } from '../../../util/Logger';
import TrackingTextInput from '../TrackingTextInput';
import styles from './styles/index';

export const MAX_LENGTH_INPUT = 256;

export default class TextField extends Component {
	render() {
		const {
			label,
			placeholder,
			value,
			onChangeText,
			containerStyle,
			disabled = false,
			keyboardType,
			autoCapitalize = 'none',
			rightItem = null,
			textInputWrapperStyle,
			onBlur,
			onFocus,
			errorText,
			testID: testId
		} = this.props;
		return (
			<View style={[styles.textInputContainer, containerStyle]}>
				{label && <Text style={styles.hintLabel}>{label}</Text>}
				<View style={[styles.textInputWrapper, textInputWrapperStyle]}>
					<TrackingTextInput
						style={styles.textInput}
						value={value}
						placeholder={placeholder}
						placeholderTextColor={colors.grey300}
						onChangeText={onChangeText}
						keyboardType={keyboardType}
						autoCapitalize={autoCapitalize}
						maxLength={MAX_LENGTH_INPUT}
						editable={!disabled}
						onBlur={() => onBlur && onBlur()}
						onFocus={() => onFocus && onFocus()}
						{...testID(testId ? testId : '')}
					/>
					{rightItem && rightItem}
				</View>
				{!!errorText && <Text style={styles.errorText}>{errorText}</Text>}
			</View>
		);
	}
}
