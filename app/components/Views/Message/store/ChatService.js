import store from './index';
import { DeviceEventEmitter } from 'react-native';
import * as RNFS from 'react-native-fs';
import preferences from '../../../../store/preferences';
import { refWebRTC } from '../../../../services/WebRTC';
import { Chat, ChatFile, ChatProfile } from './Messages';
import MessagingWebRTC from './MessagingWebRTC';
import { JoinFile } from '../../FilesManager/store/FileStore';
import FileTransferWebRTC from '../../FilesManager/store/FileTransferWebRTC';

export default class ChatService {
	from = ''; // wallet address

	constructor(address) {
		this.from = address.toLowerCase();

		this.messaging = new MessagingWebRTC(this.from, '', refWebRTC());
		this.messaging.addListener('message', this.handleChatMessage);
	}

	handleChatMessage = async (data, peerId) => {
		if (data.action == Chat().action) {
			const { action } = data.message;
			if (action) {
				if (action == ChatProfile().action) {
					const { profile } = data.message;
					if (!profile) {
						const { avatar, firstname, lastname } = await preferences.getOnboardProfile();
						const name = `${firstname} ${lastname}`;
						const avatarb64 = await RNFS.readFile(avatar, 'base64');
						const webrtc = refWebRTC();
						webrtc.sendToPeer(peerId, ChatProfile({ name, avatar: avatarb64 }));
					}
				}
			} else {
				const conversation = (await store.getChatMessages(peerId)) || { messages: [], isRead: false };

				conversation.messages.unshift(data.message);
				store.saveChatMessages(peerId, conversation);
			}
		} else if (data.action == ChatProfile().action) {
			await preferences.setPeerProfile(peerId, data.profile);
		} else if (data.action == JoinFile().action) {
			FileTransferWebRTC.joinFile(data).then(async path => {
				const conversation = await store.getChatMessages(peerId);
				const { messages } = conversation || { messages: [] };

				const message = messages.find(e => {
					const { payload } = e;
					if (payload && payload.action == ChatFile().action) {
						return payload.name == data.name;
					}
				});

				if (message) {
					message.payload.uri = `file://${path}`;
					message.payload.loading = false;
					store.saveChatMessages(peerId, { messages });
				}
				DeviceEventEmitter.emit('FileTransReceived', { data, path });
			});
		}
	};
}

const state = { chatService: null };
export const setChatService = ref => (state.chatService = ref);
export const refChatService = () => state.chatService;