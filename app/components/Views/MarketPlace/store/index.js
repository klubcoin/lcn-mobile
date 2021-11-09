import AsyncStorage from '@react-native-community/async-storage';
import { makeAutoObservable } from 'mobx';

export const kMarketCategories = 'MarketCategories';

const keys = [kMarketCategories];

class Store {
	storage = {};
	marketCategories = [];
	marketMenuKey = null;

	constructor() {
		makeAutoObservable(this);
	}

	async load() {
		keys.map(key => this.fetch(key));
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
			case kMarketCategories:
				this.marketCategories = data || [];
				break;
		}
	}

	async saveProductCategories(categories) {
		this.marketCategories = categories || [];
		await this.save(kMarketCategories, categories);
	}
}

export default new Store();
