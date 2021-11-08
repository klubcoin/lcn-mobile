import React from 'react';
import { View, Text, StyleSheet, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../styles/common';

export default function SearchBar({ value, onChange, hideIcon, placeholder, containerStyle }) {
	return (
		<View style={[styles.searchSection, containerStyle]}>
			{!hideIcon && <Icon name="search" size={22} style={styles.icon} />}
			<TextInput
				style={styles.textInput}
				value={value}
				placeholder={placeholder}
				placeholderTextColor={colors.grey400}
				onChangeText={onChange}
			/>
		</View>
	);
}

const styles = StyleSheet.create({
	searchSection: {
		marginVertical: 10,
		padding: 10,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 8,
		borderColor: colors.grey100
	},
	textInput: {
		flex: 1,
		height: 30,
		marginLeft: 5,
		paddingVertical: 0
	}
});
