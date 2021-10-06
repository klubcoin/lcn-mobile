import React from 'react';
import { View, Modal, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Fontisto';
import { colors } from '../../../../styles/common';
import * as FileIcons from '../../../../util/file-icons';

function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) return '0 Bytes';

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

export default function SelectedFiles({ file }) {
	return (
		<View style={styles.fileContainer}>
			{FileIcons.getFontAwesomeIconFromMIME(file?.type)}
			<View style={{ alignItems: 'flex-start', marginLeft: 10, flex: 10 }}>
				<Text style={styles.fileName} numberOfLines={1}>
					{file?.name}
				</Text>
				<Text>{formatBytes(file?.size ?? 0)}</Text>
			</View>
			<TouchableOpacity style={{ flex: 1 }}>
				<Icon name="close" size={18} />
			</TouchableOpacity>
		</View>
	);
}

const styles = StyleSheet.create({
	imageContainer: {
		width: 50,
		height: 50,
		padding: 10,
		borderRadius: 10
	},
	fileContainer: {
		flexDirection: 'row',
		alignItems: 'center',
		borderRadius: 10,
		padding: 10
	},
	fileName: {
		fontSize: 18,
		fontWeight: '600'
	},
	fileDate: {
		fontSize: 14,
		color: colors.grey450
	},
	fileSize: {
		fontSize: 14,
		fontWeight: '600'
	}
});
