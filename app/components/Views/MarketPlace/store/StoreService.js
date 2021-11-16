import store from ".";
import { sha256 } from "../../../../core/CryptoSignature";
import { refWebRTC } from "../../../../services/WebRTC";
import { StoreAnnounce, StoreLookUp, StoreMessage } from "./StoreMessages";
import StoreMessaging from "./StoreMessaging";

export default class StoreService {
  from = ''; // wallet address
  evtMessage = null;

  constructor(address) {
    this.from = address;

    this.storeMessaging = new StoreMessaging(address, refWebRTC());
    this.storeMessaging.addListener('message', this._onStoreMessage)
  }

  addListener(callback) {
    this.evtMessage = callback;
  }

  _onStoreMessage = (data, peerId) => {
    if (data.action == StoreLookUp().action) {
      this.handleStoreAnnounce(data, peerId);
    } else if (data.action == StoreMessage().action) {
      this.handleStoreMessage(data, peerId);
    }
  }

  handleStoreAnnounce = (data, peerId) => {
    const products = store.marketProducts;
    let titleHits = 0, titleDescHits = 0;
    let priceMin = parseInt('0xFFFFFFFF', 16), priceMax = 0;
    let tags = [], ratings = [];

    const results = products.filter(product => {
      const { title, description, category, price, tags, comments } = product;
      comments?.map(e => ratings.push(e.rating));

      const hash = sha256(category.uuid);
      if (hash == data.hash) {
        const { query } = data.data;
        const titleHit = title.toLowerCase().includes(query);
        const descHit = description.toLowerCase().includes(query);

        if (titleHit) {
          titleHits++;
          titleDescHits++;
        } else if (descHit) {
          titleDescHits++;
        }

        const found = titleHit || descHit;
        if (found) {
          priceMin = Math.min(priceMin, price);
          priceMax = Math.max(priceMax, price);
          tags?.map(tag => tags.push(tag));
        }
        return found;
      }
    });

    if (results.length > 0) {
      const rating = ratings.length == 0 ? 1 : ratings.reduce((a, b) => a + b) / ratings.length;
      const info = {
        query: data.data,
        profile: store.storeProfile,
        score: `${titleHits} / ${titleDescHits}`,
        priceRange: {
          from: priceMin,
          to: priceMax,
        },
        rating,
        tags: [...new Set(tags)]
      }
      const announce = StoreAnnounce(this.from, [data.hash], info);
      this.storeMessaging.send(announce, peerId);
    }
  }

  handleStoreMessage = (data, peerId) => {
    const { message } = data;
    if (message.action == StoreAnnounce().action) {
      if (this.evtMessage) this.evtMessage(message);
    }
  }

  searchProduct(query, hash) {
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

const state = { storeService: null };
export const setStoreService = ref => (state.storeService = ref);
export const refStoreService = () => state.storeService;