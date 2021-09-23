import AsyncStorage from "@react-native-community/async-storage"
import { makeAutoObservable } from "mobx";

export const kAppList = 'AppList';
export const kSecureHashKeycloak = 'KeycloakHash';
export const kCurrentAppId = 'CurrentAppId';

const keys = [
  kAppList,
  kSecureHashKeycloak,
  kCurrentAppId,
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

  async setCurentAppId(hash) {
    await this.save(kCurrentAppId, hash);
  }

  async getCurrentApp() {
    const hash = await this.fetch(kCurrentAppId);
    if (!hash) return null;
    return await this.getAppByAddress(hash);
  }
}

export default new Preferences();