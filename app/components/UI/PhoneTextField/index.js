import React, { Component } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { strings } from '../../../../locales/i18n';
import { colors } from '../../../styles/common';
import styles from './styles/index';

export default class PhoneTextField extends Component {
	render() {
		const {
			label,
			placeholder,
			value,
			onChangeText,
			containerStyle,
			keyboardType,
			autoCapitalize = 'none',
			onPressCountryCode,
			countryCode=''
		} = this.props;
		return (
			<View style={containerStyle}>
				{label && <Text style={styles.hintLabel}>{label}</Text>}
				<View style={styles.phoneWrapper}>
					<TouchableOpacity style={styles.countryCodePicker} onPress={onPressCountryCode}>
						<Text style={styles.countryCode}>+{countryCode?`${countryCode}-`:''}</Text>
					</TouchableOpacity>
					<TextInput
						style={styles.textInput}
						value={value}
						placeholder={placeholder}
						placeholderTextColor={colors.grey300}
						onChangeText={onChangeText}
						keyboardType={keyboardType}
						autoCapitalize={autoCapitalize}
					/>
				</View>
			</View>
		);
	}
}
