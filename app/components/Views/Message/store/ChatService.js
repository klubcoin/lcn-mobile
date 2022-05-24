import store from './index';
import { DeviceEventEmitter } from 'react-native';
import * as RNFS from 'react-native-fs';
import preferences from '../../../../store/preferences';
import { refWebRTC } from '../../../../services/WebRTC';
import { Chat, ChatFile, ChatProfile, Typing } from './Messages';
import MessagingWebRTC from './MessagingWebRTC';
import { JoinFile } from '../../FilesManager/store/FileStore';
import FileTransferWebRTC from '../../FilesManager/store/FileTransferWebRTC';
import APIService from '../../../../services/APIService';

const fetchProfile = async (address) => {
	APIService.getWalletInfo(address, (success, json) => {
		if (success && json) {
			preferences.setPeerProfile(address, json.result);
		}
	})
};

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
						const hasAvatar = avatar && await RNFS.exists(avatar);
						const avatarb64 = hasAvatar ? await RNFS.readFile(avatar, 'base64') : '';
						const webrtc = refWebRTC();
						webrtc.sendToPeer(peerId, ChatProfile({ name, avatar: avatarb64 }));
					}
				} else if (action == Typing().action) {
					const peer = preferences.peerProfile(peerId);
					if (!peer) fetchProfile(peerId);
				}
			} else {
				const group = data.message?.group;
				const conversation = (await store.getChatMessages(group || peerId)) || { messages: [], isRead: false };

				const ids = conversation.messages.map(e => e?._id);
				if (!ids.includes(data.message?._id)) {
					conversation.messages.unshift(data.message);
					store.saveChatMessages(group || peerId, conversation);
				}
			}
		} else if (data.action == ChatProfile().action) {
			await preferences.setPeerProfile(peerId, data.profile);
		} else if (data.action == JoinFile().action) {
			FileTransferWebRTC.joinFile(data).then(async path => {
				const group = data.uuid;
				const conversation = await store.getChatMessages(group || peerId);
				const { messages } = conversation || { messages: [] };

				const message = messages?.find(e => {
					const { payload } = e;
					if (payload && payload.action == ChatFile().action) {
						return payload.name == data.name;
					}
				});

				if (message) {
					message.payload.uri = `file://${path}`;
					message.payload.loading = false;
					store.saveChatMessages(group || peerId, { messages });
				}
				DeviceEventEmitter.emit('FileTransReceived', { data, path });
			});
		}
	};
}

const state = { chatService: null };
export const setChatService = ref => (state.chatService = ref);
export const refChatService = () => state.chatService;
