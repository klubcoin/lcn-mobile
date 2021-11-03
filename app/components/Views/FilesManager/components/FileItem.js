import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Fontisto';
import { colors } from '../../../../styles/common';
import * as FileIcons from '../../../../util/file-icons';
import { format } from 'date-fns';
import { SwipeListView } from 'react-native-swipe-list-view';
import { process } from 'babel-jest';
import * as Progress from 'react-native-progress';
import { getStatusContent, formatBytes } from '../FileDetails';

function formatDates(date) {
	if (!date) return;
	var formattedDate = format(date, 'MMMM do, yyyy');
	return formattedDate.toString();
}

export default function FileItem({ file, onDeleteItem, date, processPercent, status, textStyle }) {
	return (
		<View style={{ flex: 1 }}>
			<View style={styles.fileContainer}>
				{FileIcons.getFontAwesomeIconFromMIME(file?.type)}
				<View style={{ alignItems: 'flex-start', marginLeft: 10, flex: 10 }}>
					<Text style={[styles.fileName, textStyle]} numberOfLines={1} ellipsizeMode="middle">
						{file?.name}
					</Text>
					{date && <Text style={[styles.fileDate, textStyle]}>{formatDates(date)}</Text>}
					<Text style={[styles.fileSize, textStyle]}>{formatBytes(file?.size ?? 0)}</Text>
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
			{processPercent !== undefined && (
				<Progress.Bar
					progress={processPercent}
					width={null}
					backgroundColor={colors.grey100}
					borderWidth={0}
					color={getStatusContent(status).color}
					style={{ height: 10 }}
					height={10}
				/>
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
		fontWeight: '600',
		color: colors.fontPrimary
	},
	fileDate: {
		fontSize: 14,
		color: colors.grey300
	},
	fileSize: {
		fontSize: 14,
		color: colors.fontPrimary
	}
});
