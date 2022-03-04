import React, { useState, useRef } from 'react';
import { View, Image, StyleSheet, TouchableOpacity, TextInput, Dimensions, Text } from 'react-native';
import { colors } from '../../../../styles/common';

const { width } = Dimensions.get('screen');
export default function OTPInput({ style, value, onChange }) {
	const styles = StyleSheet.create({
		wrapper: {
			flex: 1,
			paddingHorizontal: 20,
			// backgroundColor: 'red',
			flexDirection: 'row',
			justifyContent: 'space-between',
			overflow: 'hidden',
      marginVertical:12
		},
		input: {
			position: 'absolute',
			top: -100
		},
		item: {
			backgroundColor: colors.white,
			width: 40,
			maxWidth: width / 10,
			height: 60,
			justifyContent: 'center',
			alignItems: 'center'
		},
		activeItem: {
			borderBottomWidth: 4,
			borderBottomColor: colors.purple100
		},
		textItem: {
			fontSize: 30,
			fontWeight: 'bold',
			color: colors.black
		}
	});

	// const [otp, setOtp] = useState('');
	const inputRef = useRef();

	// const onChangeOtp = text => {
	// 	if (text.length > 6) return;
	// 	setOtp(text);
	// };

	const onFocus = () => {
		inputRef.current.focus();
	};

	return (
		<TouchableOpacity activeOpacity={0.7} style={[styles.wrapper, style]} underlayColor={colors.grey}>
			<TextInput
				style={styles.input}
				maxLength={6}
        keyboardType={"number-pad"}
				ref={inputRef}
				value={value}
				onChangeText={text => onChange(text)}
			/>
			{[0, 1, 2, 3, 4, 5].map(e => (
				<TouchableOpacity
					activeOpacity={0.7}
					style={[styles.item, value.length === e ? styles.activeItem : null]}
					onPress={onFocus}
				>
					<Text style={styles.textItem}>{value[e]}</Text>
				</TouchableOpacity>
			))}
		</TouchableOpacity>
	);
}
