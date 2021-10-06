import React from 'react';
import { View, Modal, Text, StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';
import * as FileIcons from '../../../../util/file-icons';

export default function SendFileModal() {
	const result = FileIcons.getFontAwesomeIconFromMIME('application/msword');
	console.log(result);

	return (
		<Modal animationType="fade" transparent={true} visible={true}>
			<View style={styles.container}>
				<View style={styles.content}>
					<Text style={styles.header}>Share with contacts</Text>
					<Text style={styles.title}>Your files</Text>
					{FileIcons.getFontAwesomeIconFromMIME('application/pdf')}
				</View>
			</View>
		</Modal>
	);
}

const styles = StyleSheet.create({
	container: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		backgroundColor: colors.greytransparent100
	},
	content: {
		backgroundColor: colors.white,
		width: '80%',
		height: '50%',
		borderRadius: 10,
		padding: 15
	},
	header: {
		fontWeight: 'bold',
		fontSize: 18,
		color: colors.primaryFox,
		alignSelf: 'center'
	},
	title: {
		fontSize: 16,
		fontWeight: '500',
		marginTop: 10
	}
});
