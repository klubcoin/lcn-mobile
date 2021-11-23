import AsyncStorage from '@react-native-community/async-storage';
import { makeAutoObservable } from 'mobx';

export const kChatMessages = 'ChatMessages';

const keys = [
	kChatMessages,
];

class Storage {
	storage = {};

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

	}

	async save(key, value) {
		this.storage[key] = value;
		await AsyncStorage.setItem(key, JSON.stringify(value));
	}

	async saveStorage(key) {
		await this.save(key, this.storage[key]);
	}

	async saveChatMessages(address, messages) {
		if (!this.storage[kChatMessages]) {
			this.storage[kChatMessages] = {};
		}
		this.storage[kChatMessages][address] = messages;
		await this.saveStorage(kChatMessages);
	}

	async getChatMessages(address) {
		const chatMessages = this.storage[kChatMessages];
		if (address) return chatMessages[address];
		return chatMessages;
	}

	async setConversationIsRead(address, isRead) {
		const chatMessages = this.storage[kChatMessages] || {};
		if (!address) return;
		let foundConversation;
		const keys = Object.keys(chatMessages);

		keys.forEach(e => {
			if (e.toLocaleLowerCase() == address.toLocaleLowerCase()) {
				foundConversation = chatMessages[e];
				if (!foundConversation) return;
				foundConversation.isRead = isRead;
				this.storage[kChatMessages][e] = foundConversation;
				this.saveStorage(kChatMessages);
			}
		});
		await this.saveStorage(kChatMessages);
	}

	async deleteChatMessage(address) {
		delete this.storage[kChatMessages][address];
		await this.saveStorage(kChatMessages);
	}

	async deleteChatMessages() {
		this.storage[kChatMessages] = {};
		await this.saveStorage(kChatMessages);
	}

	setActiveChatPeerId(address) {
		this.activeChatPeerId = address;
	}
}

export default new Storage();
