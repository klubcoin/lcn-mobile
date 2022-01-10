import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { strings } from '../../../../locales/i18n';
import { colors } from '../../../styles/common';
import styles from './styles/index';

export default class TextField extends Component {
	render() {
		const { label, placeholder, value, onChangeText, containerStyle } = this.props;
		return (
			<View style={containerStyle}>
				{label && <Text style={styles.hintLabel}>{label}</Text>}
				<TextInput
					style={styles.textInput}
					value={value}
					placeholder={placeholder}
					placeholderTextColor={colors.grey300}
					onChangeText={onChangeText}
				/>
			</View>
		);
	}
}
