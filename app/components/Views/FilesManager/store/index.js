import AsyncStorage from '@react-native-community/async-storage';
import { makeAutoObservable } from 'mobx';

export const kTransferredFiles = 'TransferredFiles';

const keys = [
	kTransferredFiles,
];

class FileShareStore {
	storage = {};

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

	async saveTransferredFiles(files) {
		if (!this.storage[kTransferredFiles]) {
			this.storage[kTransferredFiles] = {};
		}
		this.storage[kTransferredFiles][files.id] = files;
		await this.saveStorage(kTransferredFiles);
	}

	async getTransferredFiles() {
		const transferredFiles = this.storage[kTransferredFiles] || {};
		return Object.keys(transferredFiles).map(key => transferredFiles[key]);
	}

	async deleteTransferredFile(id) {
		delete this.storage[kTransferredFiles][id];
		await this.saveStorage(kTransferredFiles);
	}

	async deleteTransferredFiles() {
		this.storage[kTransferredFiles] = {};
		await this.saveStorage(kTransferredFiles);
	}
}

export default new FileShareStore();
