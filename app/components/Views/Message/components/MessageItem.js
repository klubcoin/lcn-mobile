import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../../../../styles/common';
import Identicon from '../../../UI/Identicon';
import { format } from 'date-fns';
import { TransactionSync, RequestPayment, ChatFile } from '../store/Messages';
import { strings } from '../../../../../locales/i18n';
import { testID } from '../../../../util/Logger';
import marketStore from '../../MarketPlace/store'
import { addHexPrefix } from '@walletconnect/utils';
import drawables from '../../../../common/drawables';
import APIService from '../../../../services/APIService';
import preferences from '../../../../store/preferences';

const StatusColors = {
	ACTIVE: colors.green500,
	ARCHIVED: colors.gray,
}
export default class MessageItem extends Component {

	state = {
		creatorProfile: {}
	}

	componentDidMount() {
		this.getCreatorProfile();
	}

	getCreatorProfile = async () => {
		const { creator } = this.props.recipient;
		const creatorAddress = creator && addHexPrefix(creator?.uuid);
		const creatorProfile = await this.getWalletProfile(creatorAddress);
		this.setState({ creatorProfile });
	}

	getWalletProfile = async (address) => {
		return new Promise((resolve) => {
			const profile = preferences.peerProfile(address) || {};
			APIService.getWalletInfo(address, (success, json) => {
				if (success && json) {
					preferences.setPeerProfile(address, { ...profile, ...json.result });
					resolve(json.result);
				}
			})
		})
	};

	renderAvatar = () => {
		const { recipient } = this.props;

		if (recipient.avatar || recipient.members)
			return (
				<View style={styles.bubble}>
					<Image
						source={recipient.avatar ? { uri: `data:image/jpeg;base64,${recipient.avatar}` } : drawables.users}
						style={styles.proImg}
						resizeMode="contain"
						resizeMethod="scale"
					/>
				</View>
			);

		return <Identicon address={recipient.address} diameter={35} />;
	};

	convertLastMessage() {
		const { recipient } = this.props;
		const { creator, lastMessage } = recipient;
		const creatorAddress = creator && addHexPrefix(creator?.uuid);
		const { name } = this.state.creatorProfile || {};
		const { payload } = lastMessage || {};
		const creationMessage = {
			text: !!name ? strings('chat.group_created_by', { name }) : strings('chat.group_creation'),
			createdAt: recipient.creationDate
		}

		if (payload) {
			switch (payload.action) {
				case RequestPayment().action:
					return {
						...lastMessage,
						text: strings('chat.payment_request')
					};
				case TransactionSync().action: {
					const incoming = payload.transaction && payload.transaction.from
						&& payload.transaction.from.toLowerCase() == recipient.address?.toLowerCase();
					return {
						...lastMessage,
						text: incoming ? strings('chat.received_transaction') : strings('chat.sent_transaction')
					};
				}
				case ChatFile().action: {
					const { type } = payload;
					const mimeType = type?.indexOf('image') == 0 ? strings('chat.image')
						: type?.indexOf('audio') == 0 ? strings('chat.audio')
							: type?.indexOf('video') == 0 ? strings('chat.video') : strings('chat.file');

					const incoming = lastMessage.user && lastMessage.user._id
						&& lastMessage.user._id.toLowerCase() == recipient.address?.toLowerCase();
					const action = incoming ? strings('chat.received') : strings('chat.sent');

					return {
						...lastMessage,
						text: `${action} ${mimeType}`
					};
				}
				default:

					break;
			}
		}
		return lastMessage || creationMessage;
	}

	render() {
		const { recipient, isRead, status, onItemPress } = this.props;
		const lastMessage = this.convertLastMessage();

		const formattedDate = format(new Date(lastMessage?.createdAt || null), 'H:mma');
		const statusColor = { color: StatusColors[status] };

		return (
			<TouchableOpacity {...testID('message-item')} style={styles.container} onPress={onItemPress}>
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
					{!!status && <Text style={[styles.status, statusColor]}>{status}</Text>}
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
	status: {
		fontSize: 12,
		textTransform: 'capitalize',
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
	bubble: {
		width: 35,
		height: 35,
		borderRadius: 18,
		overflow: 'hidden'
	},
	proImg: {
		width: 35,
		height: 35,
		borderRadius: 100
	}
});
