import React from 'react';
import { TouchableOpacity, Text, StyleSheet } from 'react-native';
import { colors } from '../../styles/common';
import Device from '../../util/Device';

export default function CustomButton(props) {
	return (
		<TouchableOpacity style={[styles.container, props.style]} onPress={props.onPress}>
			<Text style={styles.title}>{props.title}</Text>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		borderRadius: 10,
		backgroundColor: colors.primaryFox,
		padding: 20,
		alignItems: 'center',
		alignSelf: 'center',
		width: Device.getDeviceWidth() - 50
	},
	title: {
		color: 'white',
		fontWeight: 'bold'
	}
});
