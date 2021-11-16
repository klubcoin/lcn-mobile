import AsyncStorage from '@react-native-community/async-storage';
import { makeAutoObservable } from 'mobx';

export const kMarketCategories = 'MarketCategories';
export const kMarketStoreProducts = 'MarketStoreProducts';
export const kMarketRecentProducts = 'MarketRecentProducts';
export const kMarketRecentProviders = 'MarketRecentProviders';
export const kMarketFavoriteProducts = 'MarketFavoriteProducts';
export const kStoreProfile = 'StoreProfile';

const keys = [
	kMarketCategories,
	kMarketStoreProducts,
	kMarketRecentProducts,
	kMarketRecentProviders,
	kMarketFavoriteProducts,
	kStoreProfile
];

class Store {
	storage = {};
	marketCategories = [];
	marketMenuKey = null;
	marketProducts = [];
	marketRecentProducts = [];
	marketRecentProviders = [];
	marketFavoriteProducts = [];
	storeProfile = {};

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
			case kMarketRecentProducts:
				this.marketRecentProducts = data || [];
				break;
			case kMarketRecentProviders:
				this.marketRecentProviders = data || [];
				break;
			case kMarketFavoriteProducts:
				this.marketFavoriteProducts = data || [];
				break;
			case kStoreProfile:
				this.storeProfile = data || {};
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
		const index = this.marketProducts.findIndex(e => (e.uuid = uuid));
		if (index >= 0) this.marketProducts.splice(index, 1);
		await this.save(kMarketStoreProducts, this.marketProducts);
	}

	async addRecentlyViewedProduct(product) {
		const isProductContained = this.marketRecentProducts.some(e => e.uuid == product.uuid);

		if (!isProductContained) {
			this.marketRecentProducts.unshift(product);
			if (this.marketRecentProducts.length > 10) {
				//10 is limit of recently products
				this.marketRecentProducts.pop();
			}
			await this.save(kMarketRecentProducts, this.marketRecentProducts);
		}
	}

	async removeRecentlyViewedProduct(uuid) {
		const index = this.marketRecentProducts.findIndex(e => (e.uuid = uuid));
		if (index >= 0) this.marketRecentProducts.splice(index, 1);
		await this.save(kMarketRecentProducts, this.marketRecentProducts);
	}

	async addRecentProvider(provider) {
		this.marketRecentProviders.unshift(provider);
		await this.save(kMarketRecentProviders, this.marketRecentProviders);
	}

	async removeRecentProvider(uuid) {
		const index = this.marketRecentProviders.findIndex(e => (e.uuid = uuid));
		if (index >= 0) this.marketRecentProviders.splice(index, 1);
		await this.save(kMarketRecentProviders, this.marketRecentProviders);
	}

	async addFavoriteProduct(product) {
		this.marketFavoriteProducts.push(product);
		await this.save(kMarketFavoriteProducts, this.marketFavoriteProducts);
	}

	async removeFavoriteProduct(uuid) {
		const index = this.marketFavoriteProducts.findIndex(e => (e.uuid = uuid));
		if (index >= 0) this.marketFavoriteProducts.splice(index, 1);
		await this.save(kMarketFavoriteProducts, this.marketFavoriteProducts);
	}

	async saveProfile(profile) {
		this.storeProfile = profile;
		await this.save(kStoreProfile, this.storeProfile);
	}
}

export default new Store();
