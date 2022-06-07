import React, { useEffect, useState } from 'react';
import { Image, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors } from '../../../styles/common';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import { geChatListNavbarOptions } from '../../UI/Navbar';
import { connect } from 'react-redux';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TrackingScrollView from '../../UI/TrackingScrollView';
import store from '../Message/store';
import preferences from '../../../store/preferences';
import { refWebRTC } from '../../../services/WebRTC';
import MessagingWebRTC from '../Message/store/MessagingWebRTC';
import { Chat } from '../Message/store/Messages';

const styles = StyleSheet.create({
	scrollViewContainer: {
		flexGrow: 1,
		paddingVertical: 24
	},
	container: {
		flex: 1,
		paddingHorizontal: 12
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16
	},
	chat: {
		color: colors.white,
		fontSize: 28,
		fontWeight: '700'
	},
	addChatButton: {
		padding: 12
	},
	addChatIcon: {
		fontSize: 30,
		color: colors.white
	},
	line: {
		width: '100%',
		height: 2,
		backgroundColor: colors.blue
	},
	chatWrapper: {
		flexDirection: 'row',
		marginVertical: 12
	},
	avatar: {
		width: 60,
		height: 60,
		borderRadius: 100,
		marginRight: 12
	},
	noAvatarWrapper: {
		width: 60,
		height: 60,
		borderRadius: 100,
		backgroundColor: colors.white,
		marginRight: 12,
		alignItems: 'center',
		justifyContent: 'center'
	},
	noAvatarName: {
		fontWeight: '600',
		fontSize: 24,
		color: colors.black
	},
	chatContent: {
		flex: 1
	},
	chatContentHeader: {
		flexDirection: 'row',
		marginBottom: 6,
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	chatName: {
		fontSize: 18,
		fontWeight: '600',
		color: colors.white
	},
	chatTime: {
		color: colors.white
	},
	chatMessage: {
		color: colors.grey200,
		marginRight: 24
	},
	chatAction: {
		fontWeight: 'bold',
		color: colors.blue
	}
});

const ChatList = ({ route, navigation, ...props }) => {
	const [conversations, setConversations] = useState([]);

	const initConnection = () => {
		const messaging = new MessagingWebRTC(null, null, refWebRTC());
		const listener = messaging.addListener('message', (data, peerId) => {
			if (data.action == Chat().action && data.message._id) {
				store.setConversationIsRead(data.from, false);
				fetchHistoryMessages();
			}
		});

		return [listener];
	};

	const fetchHistoryMessages = async () => {
		const { selectedAddress, addressBook, network } = props;
		const addresses = addressBook[network] || {};
		const records = await store.getChatMessages();

		const users = Object.keys(records)
			.filter(uuid => {
				const address = uuid
					.toLowerCase()
					.replace('.', '')
					.replace(selectedAddress.toLowerCase(), '');
				return (
					Object.keys(addresses).find(a => a?.toLocaleLowerCase() == address?.toLowerCase()) ||
					preferences.peerProfile(address)
				);
			})
			.map(uuid => {
				const address = uuid
					.toLowerCase()
					.replace('.', '')
					.replace(selectedAddress.toLowerCase(), '');
				const conversation = { address, ...records[uuid] };

				conversation.lastMessage = records[uuid].messages[0];
				conversation.isRead = records[uuid].isRead;
				return Object.assign(conversation, preferences.peerProfile(address));
			});
		setConversations(users);
	};

	useEffect(() => {
		const listeners = initConnection();
		store.setActiveChatPeerId(null);
		fetchHistoryMessages();

		return () => {
			listeners.forEach(listener => listener.remove());
		};
	}, [route, navigation]);

	const onAddChat = () => {
		navigation.navigate('NewChat');
	};

	const onViewChat = address => {
		store.setConversationIsRead(address, true);
		navigation.navigate('Chat', { selectedContact: { address } });
	};

	const renderLine = () => {
		return <View style={styles.line} />;
	};

	const renderAvatar = (firstname, lastname, avatarURL) => {
		if (avatarURL) {
			return <Image source={{ uri: avatarURL }} style={styles.avatar} />;
		}
		const avatarName = `${firstname.length > 0 ? firstname[0] : ''} ${lastname.length > 0 ? lastname[0] : ''}`;
		return (
			<View style={styles.noAvatarWrapper}>
				<Text style={styles.noAvatarName}>{avatarName}</Text>
			</View>
		);
	};

	const renderChatItem = chat => {
		const {
			address,
			firstname,
			lastname,
			avatar,
			lastMessage: { text, payload },
			createdAt
		} = chat;
		const name = `${firstname} ${lastname}`;
		let displayTime = '';
		const lastTime = moment(createdAt);
		const currentTime = moment();
		if (lastTime.format('YYYY MM DD') === currentTime.format('YYYY MM DD')) {
			displayTime = lastTime.format('HH:mm');
		} else {
			displayTime = lastTime.fromNow();
		}
		const profile = preferences.peerProfile(address);
		return (
			<>
				<TouchableOpacity
					key={address}
					style={styles.chatWrapper}
					activeOpacity={0.7}
					onPress={() => onViewChat(address)}
				>
					{renderAvatar(
						firstname,
						lastname,
						profile?.avatar ? `data:image/*;base64,${profile.avatar}` : avatar
					)}
					<View style={styles.chatContent}>
						<View style={styles.chatContentHeader}>
							<Text style={styles.chatName}>{name}</Text>
							<Text style={styles.chatTime}>{displayTime}</Text>
						</View>
						<Text
							style={[
								styles.chatMessage,
								(payload?.action === 'payment_request' || payload?.action === 'transaction_sync') &&
									styles.chatAction
							]}
							numberOfLines={2}
						>
							{payload?.action === 'payment_request'
								? strings('chat.message_payment_request')
								: payload?.action === 'transaction_sync'
								? strings('chat.message_transaction')
								: text}
						</Text>
					</View>
				</TouchableOpacity>
				{renderLine()}
			</>
		);
	};

	return (
		<OnboardingScreenWithBg screen="a">
			<TrackingScrollView style={styles.container} contentContainerStyle={styles.scrollViewContainer}>
				<View style={styles.header}>
					<Text style={styles.chat}>{strings('chat.chat')}</Text>
					<TouchableOpacity style={styles.addChatButton} activeOpacity={0.7} onPress={onAddChat}>
						<MaterialCommunityIcons name={'comment-plus'} style={styles.addChatIcon} />
					</TouchableOpacity>
				</View>
				{renderLine()}
				{conversations.map(chat => renderChatItem(chat))}
			</TrackingScrollView>
		</OnboardingScreenWithBg>
	);
};

ChatList.navigationOptions = ({ navigation }) => geChatListNavbarOptions(navigation);

ChatList.propTypes = {
	navigation: PropTypes.object
};

const mapStateToProps = state => ({
	addressBook: state.engine.backgroundState.AddressBookController.addressBook,
	network: state.engine.backgroundState.NetworkController.network,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress
});

export default connect(mapStateToProps)(ChatList);
