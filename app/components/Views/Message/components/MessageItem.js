import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../../styles/common';
import Identicon from '../../../UI/Identicon';

export default function MessageItem({ message, onItemPress }) {
	return (
		<TouchableOpacity style={styles.container} onPress={() => onItemPress(message.to)}>
			<Identicon address={message.to} diameter={35} />
			<View style={{ flex: 10, marginHorizontal: 8 }}>
				<Text style={styles.address} numberOfLines={1} ellipsizeMode="middle">
					{message.to}
				</Text>
				<View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
					<Text style={styles.message} numberOfLines={1}>
						{message.lastMessage}
					</Text>
					<Text style={styles.time}>{message.time}</Text>
				</View>
			</View>
			<View style={{ flex: 1, marginHorizontal: 8 }}>
				<View style={styles.hasMessage} />
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingVertical: 16,
		flexDirection: 'row'
	},
	address: {
		fontSize: 16,
		fontWeight: '400',
		maxWidth: 200
	},
	message: {
		textAlign: 'justify',
		flex: 3,
		color: colors.grey400,
		fontWeight: '300',
		fontSize: 14
	},
	time: {
		flex: 1,
		marginLeft: 10,
		color: colors.grey400,
		fontWeight: '300',
		fontSize: 14
	},
	hasMessage: {
		position: 'absolute',
		top: 8,
		right: 0,
		width: 10,
		height: 10,
		borderRadius: 10,
		backgroundColor: colors.primaryFox
	}
});
