import store from './index';
import { addHexPrefix } from 'ethereumjs-util';
import { sha256 } from '../../../../core/CryptoSignature';
import APIService from '../../../../services/APIService';
import { refWebRTC } from '../../../../services/WebRTC';
import { OrderStatuses, StoreAnnounce, StoreLookUp, StoreMessage, StoreOrder, StoreOrderStats, StoreProductGet, StoreQuery } from './StoreMessages';
import StoreMessaging from './StoreMessaging';
import { randomHex, stripHexPrefix } from 'web3-utils';

const useAnnounceAPI = true;
export default class StoreService {
	from = ''; // wallet address
	evtMessage = null;

	constructor(address) {
		this.from = address.toLowerCase();

		this.storeMessaging = new StoreMessaging(this.from, refWebRTC());
		this.storeMessaging.addListener('message', this._onStoreMessage);
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
	};

	handleStoreAnnounce = (data, peerId) => {
		const products = store.marketProducts;
		let titleHits = 0,
			titleDescHits = 0;
		let priceMin = parseInt('0xFFFFFFFF', 16),
			priceMax = 0;
		let tags = [],
			ratings = [];

		const results = products.filter(product => {
			const { title, description, category, price, tags, comments } = product;
			comments?.map(e => ratings.push(e.rating));
			if (category.hash == data.hash) {
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
					to: priceMax
				},
				rating,
				tags: [...new Set(tags)]
			};
			const announce = StoreAnnounce(this.from, [data.hash], info);
			this.storeMessaging.send(announce, peerId);
		}
	};

	handleStoreMessage = (data, peerId) => {
		const { message } = data;
		if (message.action == StoreLookUp().action) {
			this.handleStoreAnnounce(message, peerId);
		} else if (message.action == StoreAnnounce().action) {
			if (this.evtMessage) this.evtMessage(message);
		} else if (message.action == StoreQuery().action) {
			this.handleStoreQuery(message, peerId);
		} else if (message.action == StoreOrder().action) {
			this.handleStoreOrder(message, peerId);
		} else if (message.action == StoreOrderStats().action) {
			this.handleOrderStats(message, peerId);
			if (this.evtMessage) this.evtMessage(message);
		} else if (message.action == StoreProductGet().action) {
			this.handleProductQuery(message, peerId);
		}
	};

	handleProductQuery = (data, peerId) => {
		if (data.data) {
			if (this.evtMessage) this.evtMessage(data);
		} else {
			const products = store.marketProducts;
			const result = products.find(product => product.uuid == data.uuid);
			const message = StoreProductGet(this.from, data.uuid, result || 1);
			this.storeMessaging.send(message, peerId);
		}
	}

	handleStoreQuery = (data, peerId) => {
		if (typeof data.data?.result != 'undefined') {
			if (this.evtMessage) this.evtMessage(data);
			return;
		}

		const { query } = data.data;
		const products = store.marketProducts;
		let total = 0;

		const results = products.filter(product => {
			const { title, description, category } = product;

			const hash = category?.hash;
			if (hash == data.hash) {
				const titleHit = title.toLowerCase().includes(query);
				const descHit = description.toLowerCase().includes(query);

				const found = titleHit || descHit;
				if (found) total++;

				return found;
			}
		});

		const result = {
			query: data.data,
			result: results,
			total
		};
		const response = StoreQuery(this.from, data.hash, result);
		this.storeMessaging.send(response, peerId);
	};

	async searchProduct(query, hash) {
		if (useAnnounceAPI) {
			const coord = {
				latitude: 0,
				longitude: 0,
			}
			await new Promise((resolve, reject) =>
				APIService.announceInfoHash(
					hash, this.from, 0, coord,
					(success, json) => {
						store.addPeerAnnounce(hash, json);
						if (json?.peers) {
							this.sendSearchQuery(query, hash, json.peers);
						}
						resolve(json);
					}
				)
			)
		} else {
			const data = StoreLookUp(this.from, hash, query);

			const webrtc = refWebRTC();
			webrtc.sendWebSocketMessage(data);
		}
	}

	sendSearchQuery(query, categoryHash, peers) {
		const data = StoreLookUp(this.from, categoryHash, query);

		for (let k in peers) {
			const peer = peers[k];
			if (peer.uploaded == 0) continue;

			const address = addHexPrefix(peer.peer_id);
			this.storeMessaging.send(data, address?.toLowerCase());
		}
	}

	queryProductOnVendorStore(vendorAddr, query, hash) {
		const data = StoreQuery(this.from, hash, query);
		this.storeMessaging.send(data, vendorAddr?.toLowerCase());
	}

	collectCategoryHashes() {
		const products = store?.marketProducts || [];
		const categories = products.map(e => e.category);
		const categoryHashes = categories.map(e => e.hash);
		const hashes = [...new Set(categoryHashes)];

		const data = [];
		hashes.map(hash => {
			data.push({
				hash,
				total: categoryHashes.filter(id => id == hash).length
			})
		})
		return data;
	}

	async announceToTracker() {
		const categories = this.collectCategoryHashes();
		if (!categories || categories.length == 0) return;

		if (useAnnounceAPI) {
			const coord = {
				latitude: 0,
				longitude: 0,
			}

			for (let index in categories) {
				const category = categories[index];
				const { hash, total } = category;

				await new Promise((resolve, reject) =>
					APIService.announceInfoHash(
						hash, this.from, total, coord,
						(success, json) => {
							store.addPeerAnnounce(hash, json);
							resolve(json)
						}
					)
				)
			}
		} else {
			const data = StoreAnnounce(this.from, categories);

			const webrtc = refWebRTC();
			webrtc.sendWebSocketMessage(data);
		}
	}

	announceToNodes(addresses) {
		const categories = this.collectCategoryHashes();
		if (!categories || categories.length == 0) return;

		const data = StoreAnnounce(this.from, categories);

		const webrtc = refWebRTC();
		addresses.map(address => {
			webrtc.sendToPeer(address.toLowerCase(), data);
		});
	}

	sendOrder(order) {
		const { products } = order;

		const orderItems = products.map(e => {
			const { uuid, product, quantity } = e;
			return {
				uuid,
				title: product.title,
				images: product.images,
				price: product.price,
				currency: product.currency?.symbol,
				quantity,
			}
		});

		const to = order.to.toLowerCase();
		const data = StoreOrder(this.from, to, store.shippingInfo, orderItems);
		data.hash = sha256(JSON.stringify(data));

		store.addPurchasedOrder({
			id: data.id,
			vendor: to,
			shipping: data.shipping,
			items: orderItems,
			createdAt: new Date(),
		})

		this.storeMessaging.send(data, to);
		return data.id;
	}

	handleStoreOrder = (data, peerId) => {
		const clone = { ...data };
		delete clone.hash;
		const hash = sha256(JSON.stringify(clone));
		const orderId = `ORD${stripHexPrefix(randomHex(6)).toUpperCase()}`;

		if (hash != data.hash) return;

		store.addVendorOrder({
			orderId,
			from: peerId,
			shipping: data.shipping,
			items: data.data,
			createdAt: new Date(),
		});

		const message = StoreOrderStats(this.from, peerId, data.id, orderId, OrderStatuses.processing);
		this.storeMessaging.send(message, peerId);
	}

	updateOrderStatus = (order, status) => {
		const peerId = order.from;
		const message = StoreOrderStats(this.from, peerId, order.id, order.orderId, status);
		this.storeMessaging.send(message, peerId);
	}

	handleOrderStats = (data, peerId) => {
		store.updatePurchasedOrder(data);
	}

	fetchProduct = (uuid, peerId) => {
		const message = StoreProductGet(this.from, uuid);
		this.storeMessaging.send(message, peerId);
	}
}

const state = { storeService: null };
export const setStoreService = ref => (state.storeService = ref);
export const refStoreService = () => state.storeService;
