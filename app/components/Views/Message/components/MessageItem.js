import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../../../../styles/common';
import Identicon from '../../../UI/Identicon';
import { format } from 'date-fns';
import { TransactionSync, RequestPayment } from '../../../../services/Messages';
import { strings } from '../../../../../locales/i18n';

export default class MessageItem extends Component {
	renderAvatar = () => {
		const { recipient } = this.props;

		if (recipient.avatar)
			return (
				<Image
					source={{ uri: `data:image/jpeg;base64,${recipient.avatar}` }}
					style={styles.proImg}
					resizeMode="contain"
					resizeMethod="scale"
				/>
			);

		return <Identicon address={recipient.address} diameter={35} />;
	};

	convertLastMessage() {
		const { recipient } = this.props;
		const lastMessage = recipient.lastMessage;
		const { payload } = lastMessage;

		if (payload) {
			switch (payload.action) {
				case RequestPayment().action:
					return {
						...lastMessage,
						text: strings('chat.payment_request')
					};
				case TransactionSync().action:
					const incoming = payload.transaction && payload.transaction.from
						&& payload.transaction.from.toLowerCase() == recipient.address.toLowerCase();
					return {
						...lastMessage,
						text: incoming ? strings('chat.received_transaction') : strings('chat.sent_transaction')
					};
				default:
					break;
			}
		}
		return lastMessage;
	}

	render() {
		const { recipient, isRead, onItemPress } = this.props;
		const lastMessage = this.convertLastMessage();
		const formattedDate = format(new Date(lastMessage.createdAt), 'H:mma');

		return (
			<TouchableOpacity style={styles.container} onPress={onItemPress}>
				<View style={[styles.hasMessage, !isRead && { backgroundColor: 'dodgerblue' }]} />
				{this.renderAvatar()}
				<View style={{ flex: 3, marginHorizontal: 8 }}>
					<Text
						style={[styles.address, !isRead && styles.unreadStyle]}
						numberOfLines={1}
						ellipsizeMode="middle"
					>
						{recipient?.name}
					</Text>
					<View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
						<Text style={[styles.message, !isRead && styles.unreadStyle]} numberOfLines={2}>
							{lastMessage?.text}
						</Text>
					</View>
				</View>
				<View style={{ flex: 2, marginHorizontal: 8, alignItems: 'flex-end' }}>
					<Text style={styles.time}>{formattedDate}</Text>
				</View>
			</TouchableOpacity>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		paddingVertical: 16,
		flexDirection: 'row',
		alignItems: 'center',
		flex: 1
	},
	address: {
		fontSize: 16,
		fontWeight: '400',
		maxWidth: 200
	},
	message: {
		textAlign: 'left',
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
	},
	proImg: {
		width: 35,
		height: 35,
		borderRadius: 100
	}
});
