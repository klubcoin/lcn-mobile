import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../../styles/common';
import Identicon from '../../../UI/Identicon';

export default function MessageItem({ message, onItemPress }) {
	return (
		<TouchableOpacity style={styles.container} onPress={() => onItemPress(message.contact)}>
			<View style={[styles.hasMessage, { backgroundColor: !message.isRead && 'dodgerblue' }]} />
			<Identicon address={message.contact.address} diameter={40} />
			<View style={{ flex: 3, marginHorizontal: 8 }}>
				<Text
					style={[styles.address, !message.isRead && styles.unreadStyle]}
					numberOfLines={1}
					ellipsizeMode="middle"
				>
					{message.contact.name}
				</Text>
				<View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
					<Text style={[styles.message, !message.isRead && styles.unreadStyle]} numberOfLines={2}>
						{message.lastMessage}
					</Text>
				</View>
			</View>
			<View style={{ flex: 1, marginHorizontal: 8, alignItems: 'flex-end' }}>
				<Text style={styles.time}>{message.time}</Text>
			</View>
		</TouchableOpacity>
	);
}

const styles = StyleSheet.create({
	container: {
		paddingVertical: 16,
		flexDirection: 'row',
		alignItems: 'center'
	},
	address: {
		fontSize: 16,
		fontWeight: '400',
		maxWidth: 200
	},
	message: {
		textAlign: 'justify',
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
		width: 10,
		height: 10,
		borderRadius: 10,
		alignSelf: 'center',
		marginRight: 10
	},
	unreadStyle: {
		fontWeight: '600',
		color: colors.black
	}
});
