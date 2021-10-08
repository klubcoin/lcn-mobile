import React from 'react';
import { StyleSheet, Text } from 'react-native';

export default function TextSpan({ title, value }) {
	return (
		<Text style={styles.container}>
			<Text style={styles.total}>{title}: </Text>
			<Text>{value}</Text>
		</Text>
	);
}
const styles = StyleSheet.create({
	container: {
		alignSelf: 'flex-start'
	},
	total: {
		fontSize: 16,
		fontWeight: '600'
	}
});
