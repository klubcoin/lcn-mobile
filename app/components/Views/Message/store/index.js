import AsyncStorage from '@react-native-community/async-storage';
import { addHexPrefix } from 'ethereumjs-util';
import { makeAutoObservable } from 'mobx';

export const kChatMessages = 'ChatMessages';
export const kConversationInfos = 'ConversationInfos';

const keys = [
	kChatMessages,
	kConversationInfos
];

class Storage {
	storage = {};
	chatConversations = {};
	conversationInfos = {}

	// session variables
	activeChatPeerId = null;

	constructor() {
		makeAutoObservable(this);
	}

	async load() {
		return Promise.all(keys.map(key => this.fetch(key)));
	}

	async fetch(key) {
		if (!!this.storage[key]) return this.storage[key];

		const data = await AsyncStorage.getItem(key);
		this.storage[key] = data ? JSON.parse(data) : data;

		this.bindProps(key, this.storage[key]);
		return this.storage[key];
	}

	bindProps(key, data) {
		switch (key) {
			case kChatMessages:
				this.chatConversations = data || {};
				//this.save(kChatMessages, {})
				break;
			case kConversationInfos:
				this.conversationInfos = data || {};
				//this.save(kConversationInfos, {})
				break;
		}
	}

	async save(key, value) {
		this.storage[key] = value;
		await AsyncStorage.setItem(key, JSON.stringify(value));
	}

	async saveStorage(key) {
		await this.save(key, this.storage[key]);
	}

	async saveChatMessages(address, messages) {
		const peerAddress = `${address}`;
		this.chatConversations[peerAddress] = messages;
		const info = this.conversationInfos[peerAddress] || {};
		const peers = info.peers || [];
		if (!peers.includes(peerAddress)) peers.push(peerAddress);
		this.conversationInfos[peerAddress] = { ...info, peers }
		await this.save(kChatMessages, this.chatConversations);
		await this.save(kConversationInfos, this.conversationInfos);
	}

	async saveConversationPeers(group, peers) {
		const info = this.conversationInfos[group] || {};
		const peersArr = [...new Set([...peers.filter(e => !!e).map(e => addHexPrefix(e))])];
		this.conversationInfos[group] = { ...info, peers: peersArr };
		await this.save(kConversationInfos, this.conversationInfos);
	}

	async deleteConversationPeers(groupId) {
		delete this.conversationInfos[groupId];
		await this.save(kConversationInfos, this.conversationInfos);
	}

	async setNameGroup(group, name) {
		const info = this.conversationInfos[group] || {};
		this.conversationInfos[group] = { ...info, name };
		await this.save(kConversationInfos, this.conversationInfos);
	}

	async getChatMessages(address) {
		const chatMessages = this.storage[kChatMessages] || {};
		if (address) return chatMessages[address];
		return chatMessages;
	}

	async setConversationIsRead(address, isRead) {
		const chatMessages = this.chatConversations || {};
		if (!address) return;
		let foundConversation;
		const keys = Object.keys(chatMessages);

		keys.forEach(e => {
			if (e.toLocaleLowerCase() == address.toLocaleLowerCase()) {
				foundConversation = chatMessages[e];
				if (!foundConversation) return;
				foundConversation.isRead = isRead;
			}
		});
		await this.save(kChatMessages, this.chatConversations);
	}

	async deleteChatMessage(address) {
		delete this.chatConversations[address];
		await this.save(kChatMessages, this.chatConversations);
	}

	async deleteChatMessages() {
		this.chatConversations = {};
		await this.save(kChatMessages, this.chatConversations);
	}

	setActiveChatPeerId(address) {
		this.activeChatPeerId = address;
	}
}

export default new Storage();
