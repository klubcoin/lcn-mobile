import AsyncStorage from "@react-native-community/async-storage"
import { makeAutoObservable } from "mobx";

export const kAppList = 'AppList';
export const kSecureHashKeycloak = 'KeycloakHash';
export const kVoteInstance = 'VoteInstance';
export const kVoteRegistrationId = 'VoteRegistrationId';

const keys = [
  kAppList,
  kSecureHashKeycloak,
];

class Preferences {
  storage = {};

  constructor() {
    makeAutoObservable(this);
  }

  async load() {
    keys.map((key) => this.fetch(key));
  }

  async fetch(key) {
    const data = await AsyncStorage.getItem(key);
    this.storage[key] = data ? JSON.parse(data) : data;
    return this.storage[key];
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

  async setVoteInstance(instance) {
    await this.save(kVoteInstance, instance);
  }

  async getVoteInstance() {
    return await this.fetch(kVoteInstance);
  }

  async setVoterId(registrationId) {
    await this.save(kVoteRegistrationId, registrationId);
  }

  async getVoterId() {
    return await this.fetch(kVoteRegistrationId);
  }

}

export default new Preferences();