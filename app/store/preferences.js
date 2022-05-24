import AsyncStorage from '@react-native-community/async-storage';
import { makeAutoObservable } from 'mobx';
import moment from 'moment';
import uuid from 'react-native-uuid';

export const kAppList = 'AppList';
export const kSecureHashKeycloak = 'KeycloakHash';
export const kTokenKeycloak = 'KeycloakToken';
export const kAccountKeycloak = 'KeycloakAccount';
export const kCurrentAppId = 'CurrentAppId';
export const kOnboardProfile = 'OnboardProfile';
export const kBlockedIdentityReqPeers = 'BlockedIdentityReqPeers';
export const kNotifications = 'Notifications';
export const kPublicKeys = 'PublicKeys';
export const kPeerProfiles = 'PeerProfiles';

const keys = [
	kAppList,
	kSecureHashKeycloak,
	kTokenKeycloak,
	kAccountKeycloak,
	kCurrentAppId,
	kOnboardProfile,
	kBlockedIdentityReqPeers,
	kNotifications,
	kPublicKeys,
	kPeerProfiles
];

class Preferences {
	storage = {};
	onboardProfile = {};
	blockedIdentityReqPeers = {};
	notifications = {};
	publicKeys = {};
	peerProfiles = {};

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
			case kOnboardProfile:
				this.onboardProfile = data;
				break;
			case kBlockedIdentityReqPeers:
				this.blockedIdentityReqPeers = data || {};
				break;
			case kNotifications:
				this.notifications = data || [];
				break;
			case kPublicKeys:
				this.publicKeys = data || {};
				break;
			case kPeerProfiles:
				this.peerProfiles = data || {};
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

	async saveApp(asset) {
		if (!this.storage[kAppList]) {
			this.storage[kAppList] = {};
		}
		this.storage[kAppList][asset.address] = asset;
		await this.saveStorage(kAppList);
	}

	async getSavedAppList() {
		const apps = this.storage[kAppList] || {};
		return Object.keys(apps).map(key => apps[key]);
	}

	async getAppByAddress(address) {
		const apps = this.storage[kAppList] || {};
		return apps[address];
	}

	async setKeycloakHash(encryptedHash) {
		await this.save(kSecureHashKeycloak, encryptedHash);
	}

	async getKeycloakHash() {
		return await this.fetch(kSecureHashKeycloak);
	}

	async setCurentAppId(hash) {
		await this.save(kCurrentAppId, hash);
	}

	async getCurrentApp() {
		const hash = await this.fetch(kCurrentAppId);
		if (!hash) return null;
		return await this.getAppByAddress(hash);
	}

	async setKeycloakToken(token) {
		await this.save(kTokenKeycloak, token);
	}

	async getKeycloakToken() {
		return await this.fetch(kTokenKeycloak);
	}

	async setKeycloakAccount(account) {
		await this.save(kAccountKeycloak, account);
	}

	async getKeycloakAccount() {
		return await this.fetch(kAccountKeycloak);
	}

	setOnboardProfile(profile) {
		this.onboardProfile = profile;
		this.save(kOnboardProfile, profile);
	}

	async getOnboardProfile() {
		this.onboardProfile = await this.fetch(kOnboardProfile);
		return this.onboardProfile;
	}

	async blockIdentityReqPeer(address) {
		this.blockedIdentityReqPeers[address] = true;
		this.storage[kBlockedIdentityReqPeers] = this.blockedIdentityReqPeers;
		await this.saveStorage(kBlockedIdentityReqPeers);
	}

	async isBlockIdentityReqPeer(address) {
		const blockPeers = this.blockedIdentityReqPeers || {};
		return blockPeers[address];
	}

	async addNotification(data) {
		data.id = uuid.v4();
		data.time = moment().unix();
		this.notifications.push(data);
		await this.saveNotifications(this.notifications);
	}

	async saveNotifications(notifications) {
		this.notifications = notifications || [];
		await this.save(kNotifications, this.notifications);
	}

	async addPublicKey(address, publicKey) {
		this.publicKeys[address] = publicKey;
		await this.save(kPublicKeys, this.publicKeys);
	}

	async publicKeyForAddress(address) {
		return this.publicKeys[address];
	}

	async setPeerProfile(address, profile) {
		this.peerProfiles[address] = profile;
		await this.save(kPeerProfiles, this.peerProfiles);
	}

	peerProfile(address) {
		const peerProfiles = this.storage[kPeerProfiles] || {};
		return peerProfiles[address];
	}
}

export default new Preferences();
