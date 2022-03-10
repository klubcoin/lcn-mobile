import React, { Component } from 'react';
import { Text, TouchableOpacity, View } from 'react-native';
import { TextInput } from 'react-native-gesture-handler';
import { colors } from '../../../styles/common';
import styles from './styles/index';
import Icon from 'react-native-vector-icons/FontAwesome';

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
			countryCode = '',
			onFocus,
			rightItem = null
		} = this.props;
		return (
			<View style={containerStyle}>
				{label && <Text style={styles.hintLabel}>{label}</Text>}
				<View style={styles.phoneWrapper}>
					<TouchableOpacity style={styles.countryCodePicker} onPress={onPressCountryCode}>
						{!!countryCode && <Text style={styles.countryCode}>+{countryCode}</Text>}
						<Icon name="caret-down" style={styles.dropdownIcon} />
					</TouchableOpacity>
					<View style={styles.textInputWrapper}>
						<TextInput
							style={styles.textInput}
							value={value}
							placeholder={placeholder}
							placeholderTextColor={colors.grey300}
							onChangeText={onChangeText}
							keyboardType={keyboardType}
							autoCapitalize={autoCapitalize}
							onFocus={onFocus}
						/>
						{rightItem && rightItem }
					</View>
				</View>
			</View>
		);
	}
}
