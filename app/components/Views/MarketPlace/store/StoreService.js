import store from ".";
import { sha256 } from "../../../../core/CryptoSignature";
import { refWebRTC } from "../../../../services/WebRTC";
import { StoreAnnounce, StoreLookUp } from "./StoreMessages";

export default class StoreService {
  from = ''; // wallet address

  constructor(address) {
    this.from = address;
  }

  static searchProduct(query, categoryUuid) {
    const hash = sha256(categoryUuid);
    const data = StoreLookUp(this.from, hash, query);

    const webrtc = refWebRTC();
    webrtc.sendWebSocketMessage(data);
  }

  collectCategoryHashes() {
    const products = store.marketProducts;
    const categories = products.map(e => e.category);
    const categoryIds = categories.map(e => e.uuid);

    return [...new Set(categoryIds)].map(e => sha256(e));
  }

  announceToTracker() {
    const categories = this.collectCategoryHashes();
    if (!categories || categories.length == 0) return;

    const data = StoreAnnounce(this.from, categories);

    const webrtc = refWebRTC();
    webrtc.sendWebSocketMessage(data);
  }

  announceToNodes(addresses) {
    const categories = this.collectCategoryHashes();
    if (!categories || categories.length == 0) return;

    const data = StoreAnnounce(this.from, categories);

    const webrtc = refWebRTC();
    addresses.map(address => {
      webrtc.sendToPeer(address, data);
    })
  }
}