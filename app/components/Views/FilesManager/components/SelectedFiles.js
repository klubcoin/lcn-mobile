import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Fontisto';
import { colors } from '../../../../styles/common';
import * as FileIcons from '../../../../util/file-icons';
import { format } from 'date-fns';

function formatBytes(bytes, decimals = 2) {
	if (bytes === 0) {
		return '0 Bytes';
	}

	const k = 1024;
	const dm = decimals < 0 ? 0 : decimals;
	const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];

	const i = Math.floor(Math.log(bytes) / Math.log(k));

	return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i];
}

function formatDates(date) {
	if (!date) return;
	var formattedDate = format(date, 'MMMM do, yyyy');
	return formattedDate.toString();
}

export default function SelectedFiles({ file, onDeleteItem, date }) {
	console.log(date);
	return (
		<View style={styles.fileContainer}>
			{FileIcons.getFontAwesomeIconFromMIME(file?.type)}
			<View style={{ alignItems: 'flex-start', marginLeft: 10, flex: 10 }}>
				<Text style={styles.fileName} numberOfLines={1} ellipsizeMode="middle">
					{file?.name}
				</Text>
				{date && <Text>{formatDates(date)}</Text>}
				<Text>{formatBytes(file?.size ?? 0)}</Text>
			</View>
			{onDeleteItem && (
				<TouchableOpacity
					style={{ flex: 1, alignSelf: 'flex-start', marginTop: 5, marginLeft: 5 }}
					onPress={() => onDeleteItem(file)}
				>
					<Icon name="close" size={18} />
				</TouchableOpacity>
			)}
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
