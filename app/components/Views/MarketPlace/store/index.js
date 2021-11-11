import AsyncStorage from '@react-native-community/async-storage';
import { makeAutoObservable } from 'mobx';

export const kMarketCategories = 'MarketCategories';
export const kMarketStoreProducts = 'MarketStoreProducts';

const keys = [
	kMarketCategories,
	kMarketStoreProducts,
];

class Store {
	storage = {};
	marketCategories = [];
	marketMenuKey = null;
	marketProducts = [];

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
			case kMarketCategories:
				this.marketCategories = data || [];
				break;
			case kMarketStoreProducts:
				this.marketProducts = data || [];
				break;
		}
	}

	async save(key, value) {
		this.storage[key] = value;
		await AsyncStorage.setItem(key, JSON.stringify(value));
	}

	async saveProductCategories(categories) {
		this.marketCategories = categories || [];
		await this.save(kMarketCategories, categories);
	}

	async addProduct(product) {
		this.marketProducts.push(product);
		await this.save(kMarketStoreProducts, this.marketProducts);
	}

	async deleteProduct(uuid) {
		const index = this.marketProducts.findIndex(e => e.uuid = uuid);
		if (index >= 0) this.marketProducts.splice(index, 1);
		await this.save(kMarketStoreProducts, this.marketProducts);
	}
}

export default new Store();
