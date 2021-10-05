import React, { useState } from 'react';
import { StyleSheet, View, TextInput, Text, Image, TouchableHighlight } from 'react-native';
import { colors } from '../../../../styles/common';

export default function FileItem({ item, onClick }) {
	const fileLogo = require('../../../../images/file_ic.png');
	const checkIc = require('../../../../images/check.png');

	const checkFile = id => {
		setChecked(!checked);
		// onClick(id);
	};
	const [checked, setChecked] = useState(false);

	return (
		<TouchableHighlight onPress={() => checkFile(item.id)} underlayColor={colors.grey000}>
			<View style={[styles.fileContainer, { backgroundColor: checked ? colors.primaryFox100 : null }]}>
				<View
					style={[styles.imageContainer, { backgroundColor: checked ? colors.primaryFox : 'rgba(0,0,0,.1)' }]}
				>
					<Image
						source={checked ? checkIc : fileLogo}
						resizeMode="cover"
						style={{ width: '100%', height: '100%', tintColor: checked ? 'white' : null }}
					/>
				</View>
				<View style={{ marginLeft: 10, width: '80%' }}>
					<View
						style={{
							flexDirection: 'row',
							justifyContent: 'space-between',
							width: '100%',
							alignItems: 'center'
						}}
					>
						<Text style={styles.fileName}>{item.filename}</Text>
						<Text style={styles.fileSize}>{item.size}</Text>
					</View>
					<Text style={styles.fileDate}>{item.date}</Text>
				</View>
			</View>
		</TouchableHighlight>
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
		padding: 10,
		marginBottom: 10
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
