import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { strings } from '../../../../locales/i18n';
import { colors } from '../../../styles/common';
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
			rightItem = null
		} = this.props;
		return (
			<View style={containerStyle}>
				{label && <Text style={styles.hintLabel}>{label}</Text>}
				<View style={styles.textInputWrapper}>
					<TextInput
						style={styles.textInput}
						value={value}
						placeholder={placeholder}
						placeholderTextColor={colors.grey300}
						onChangeText={onChangeText}
						keyboardType={keyboardType}
						autoCapitalize={autoCapitalize}
						maxLength={MAX_LENGTH_INPUT}
						editable={!disabled}
					/>
					{rightItem && rightItem }
				</View>
			</View>
		);
	}
}
