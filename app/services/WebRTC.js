import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';
import CryptoSignature, { sha256 } from '../core/CryptoSignature';
import moment from 'moment';
import io from 'socket.io-client';
import { DeviceEventEmitter } from 'react-native';
import * as RNFS from 'react-native-fs';
import Messaging, { Message, WSEvent } from './Messaging';
import { AckWebRTC } from './Messages';
import preferences from '../store/preferences';
import { WalletProfile } from '../components/Views/Contacts/FriendRequestMessages';
import assert from 'assert';

const useSocketIO = false;
const SignalServer = useSocketIO && 'http://192.168.1.5:9000';

export default class WebRTC {
	fromUserId = '';
	sendChannels = {};
	peerRefs = {};
	peerPublicKeys = {};
	monitors = {};
	encryptor = null;

	onReady = null;
	onMessage = null;
	onError = null;
	events = {
		ready: [],
		message: [],
		error: []
	};
	onceListeners = [];

	constructor(from) {
		this.fromUserId = from.toLowerCase();
		this.initSocket();
	}

	addEncryptor = (encryptionLayer) => {
		this.encryptor = encryptionLayer;
	}

	once = (filter, callback) => {
		this.onceListeners.push({ filter, callback });
	}

	addListener = (type, callback) => {
		switch (type) {
			case 'ready':
				this.onReady = this.onReady ?? callback;
				this.events.ready.push(callback);
				return () => this.events.ready.splice(this.events.ready.indexOf(callback), 1);
			case 'message':
				this.onMessage = this.onMessage ?? callback;
				this.events.message.push(callback);
				return () => this.events.message.splice(this.events.message.indexOf(callback), 1);
			case 'error':
				this.onError = this.onError ?? callback;
				this.events.error.push(callback);
				return () => this.events.error.splice(this.events.error.indexOf(callback), 1);
		}
	};

	initSocket = () => {
		if (useSocketIO && SignalServer) {
			this.socketRef = io(SignalServer);

			this.socketRef.on(WSEvent.connected, this.handleConnected.bind(this));
			this.socketRef.on(WSEvent.message, this.handleWebRtcSignal.bind(this));
		}

		this.messaging = new Messaging(this.fromUserId);
		this.messaging.on(WSEvent.ready, this.handleConnected.bind(this));
		this.messaging.on(WSEvent.message, this.handleWebRtcSignal.bind(this));
		this.messaging.initConnection();
	};

	handleWebRtcSignal = message => {
		try {
			const data = (message.action || message.payload) ? message : JSON.parse(message);
			if (data.webrtc) {
				switch (data.signal) {
					case 'offer':
						this.handleOffer(data);
						break;
					case 'answer':
						this.handleAnswer(data);
						break;
					case 'ice-candidate':
						this.handleNewICECandidateMsg(data);
						break;
				}
			} else if (data.action && data.from) {
				this.handleWebSocketMessage(message, data.from?.toLowerCase())
			}
		} catch (e) {}
	};

	handleWebSocketMessage = (data, peerId) => {
		try {
			this.events.message.map(callback => callback(data, peerId));
			this.signalOnce(data, peerId);
		} catch (e) { }
	}

	sendSignal = (signal, payload) => {
		const message = Message(payload.target, {
			webrtc: true,
			signal,
			...payload
		});

		this.sendWebSocketMessage(message);
	};

	sendWebSocketMessage = (message) => {
		if (useSocketIO) {
			this.socketRef.emit(message.action, message);
		} else {
			this.messaging.send(message);
		}
	};

	connectTo = addr => {
		const address = addr.toLowerCase();
		this.peerRefs[address] = this.Peer(address);
		this.sendChannels[address] = this.peerRefs[address].createDataChannel('sendChannel');

		// listen to incoming messages from other peer
		this.sendChannels[address].onmessage = message => this.handleReceiveMessage(message, address);
	};

	handleConnected = () => {
		useSocketIO && this.socketRef.emit('join', this.fromUserId);
	};

	handleOffer = incoming => {
		const peerId = incoming.caller;
		/*
			Here we are exchanging config information
			between the peers to establish communication
		*/
		this.peerRefs[peerId] = this.Peer(incoming.caller);
		this.peerRefs[peerId].ondatachannel = event => {
			this.sendChannels[peerId] = event.channel;
			this.sendChannels[peerId].onmessage = message => this.handleReceiveMessage(message, peerId);
			console.log('[SUCCESS] Connection established');
			this._sendToPeer(peerId, { action: 'ping', publicKey: this.publicKey });
			// if (this.onReady) this.onReady(this.sendChannels[peerId]);
			this.events.ready.map(callback => callback(this.sendChannels[peerId], peerId));
		};

		/*
			Session Description: It is the config information of the peer
			SDP stands for Session Description Protocol. The exchange
			of config information between the peers happens using this protocol
		*/
		const desc = new RTCSessionDescription(incoming.sdp);

		this.peerRefs[peerId]
			.setRemoteDescription(desc)
			.then(() => {
				return this.peerRefs[peerId].createAnswer();
			})
			.then(answer => {
				return this.peerRefs[peerId].setLocalDescription(answer);
			})
			.then(() => {
				const payload = {
					target: incoming.caller,
					caller: this.fromUserId,
					sdp: this.peerRefs[peerId].localDescription
				};
				this.sendSignal('answer', payload);
			});
	};

	handleAnswer = message => {
		const peerId = message.caller;
		// Handle answer by the receiving peer
		const desc = new RTCSessionDescription(message.sdp);
		this.peerRefs[peerId].setRemoteDescription(desc).catch(err => this.onError && this.onError(err));

		const sendChannel = this.sendChannels[peerId];
		// if (this.onReady) this.onReady(sendChannel);
		this.events.ready.map(callback => callback(sendChannel, peerId));
	};

	handleReceiveMessage = (e, peer) => {
		// Listener for receiving messages from the peer
		console.log('[INFO] Message received from peer', peer, `${e.data}`.substr(0, 100));

		this.handleWebRtcMessage(e.data, peer);
	};

	handleWebRtcMessage = async (json, peerId) => {
		try {
			let data = JSON.parse(json);
			if (data.signature && `${peerId}`.toLowerCase() != this.parseSignature(data)) return;

			if (data.encrypted) {
				data = this.decryptPayload(data);
			} else if (data.payload) {
				data = JSON.parse(data.payload);
			}

			if (data.action == 'ping') {
				this.peerPublicKeys[peerId] = data.publicKey;
				this._sendToPeer(peerId, { action: 'pong', publicKey: this.publicKey });
				DeviceEventEmitter.emit(`WebRtcPeer:${peerId}`, data);
			} else if (data.action == 'pong') {
				this.peerPublicKeys[peerId] = data.publicKey;
			} else if (data.checksum) {
				this._sendToPeer(peerId, AckWebRTC(data.checksum));
			} else if (data.action == AckWebRTC().action && data.hash) {
				if (this.monitors[data.hash]) {
					clearTimeout(this.monitors[data.hash]);
				}
			} else if (data.action == WalletProfile().action) {
				if (data.profile) {
					await preferences.setPeerProfile(peerId, data.profile);
				} else {
					const { avatar, firstname, lastname } = await preferences.getOnboardProfile();
					const name = `${firstname} ${lastname}`;
					const avatarb64 = await RNFS.readFile(avatar, 'base64');
					this.sendToPeer(peerId, WalletProfile({ address: this.fromUserId, name, avatar: avatarb64 }));
				}
			}

			this.events.message.map(callback => callback(data, peerId));
			this.signalOnce(data, peerId);
		} catch (e) {}
	};

	signalOnce = (data, peerId) => {
		const removeOnces = [];
		this.onceListeners.map(listener => {
			const { filter, callback } = listener;

			if (filter == data.action || filter == peerId
				|| filter == `${data.action}:${peerId}`) {
				const skipped = callback(data, peerId);
				if (!skipped) removeOnces.push(listener);
			}
		})
		removeOnces.map(e => this.onceListeners.splice(this.onceListeners.indexOf(e), 1));
	}

	parseSignature(data) {
		if (!data || !data.payload || !data.signature) return;

		const { payload, signature } = data;
		return CryptoSignature.recoverMessageSignature(payload, signature);
	}

	decryptPayload(data) {
		if (!data || !data.payload || !data.encrypted) return data;

		assert(this.encryptor, 'Missing encryption layer');
		const json = this.encryptor.decrypt(data);
		try {
			return JSON.parse(json);
		} catch (e) {
			return json;
		}
	}

	handleNewICECandidateMsg = incoming => {
		const peerId = incoming.caller;
		const candidate = new RTCIceCandidate(incoming.candidate);

		this.peerRefs[peerId].addIceCandidate(candidate).catch(err => this.onError && this.onError(err));
	};

	Peer = peerId => {
		const peer = new RTCPeerConnection({
			iceServers: [
				{
					urls: 'stun:stun.stunprotocol.org'
				},
				{
					urls: 'turn:numb.viagenie.ca',
					credential: 'long3232',
					username: 'dragons3232@gmail.com'
				}
			]
		});
		peer.peerId = peerId;
		peer.onicecandidate = this.handleICECandidateEvent;
		peer.onnegotiationneeded = () => this.handleNegotiationNeededEvent(peerId);
		return peer;
	};

	handleICECandidateEvent = e => {
		/*
			ICE stands for Interactive Connectivity Establishment. Using this
			peers exchange information over the intenet. When establishing a
			connection between the peers, peers generally look for several 
			ICE candidates and then decide which to choose best among possible
			candidates
		*/
		if (e.candidate) {
			const payload = {
				target: e.target.peerId,
				caller: this.fromUserId,
				candidate: e.candidate
			};
			this.sendSignal('ice-candidate', payload);
		}
	};

	handleNegotiationNeededEvent = peerId => {
		// Offer made by the initiating peer to the receiving peer.
		this.peerRefs[peerId]
			.createOffer()
			.then(offer => {
				return this.peerRefs[peerId].setLocalDescription(offer);
			})
			.then(() => {
				const payload = {
					target: peerId,
					caller: this.fromUserId,
					sdp: this.peerRefs[peerId].localDescription
				};
				this.sendSignal('offer', payload);
			})
			.catch(err => this.onError && this.onError(err));
	};

	hasChannel(addr) {
		const address = addr.toLowerCase();
		return this.sendChannels && this.sendChannels[address];
	}

	async _sendToPeer(peerId, message) {
		const json = JSON.stringify(message);
		const channel = this.sendChannels[peerId];
		const publicKey = this.peerPublicKeys[peerId];

		assert(this.encryptor, 'Missing encryption layer');
		const payload = this.encryptor.encrypt(json, publicKey);
		const signature = await CryptoSignature.signMessage(this.fromUserId, payload);
		const data = {
			payload,
			signature,
			encrypted: !!publicKey
		};
		channel && channel.send(JSON.stringify(data));
	}

	_handleTimeout = (peerId, data) => {
		this.events.error.map(callback => callback && callback(data, peerId));
	}

	connectAndSend = async (address, data) => {
		this.connectTo(address);
		const timeout = setTimeout(() => this._handleTimeout(address, data), 5000);
		DeviceEventEmitter.once(`WebRtcPeer:${address}`, () => {
			this._sendToPeer(address, data);
			clearTimeout(timeout);
		});
	};

	sendToPeer = async (addr, data) => {
		const address = addr.toLowerCase();
		if (!data.checksum) data.checksum = sha256(JSON.stringify(data));
		if (!this.hasChannel(address)) {
			this.connectAndSend(address, data);
		} else {
			this.monitors[data.checksum] = setTimeout(() => this.connectAndSend(address, data), 5000);
			this._sendToPeer(address, data);
		}
	}
}

const state = { webrtc: null };
export const setWebRTC = ref => (state.webrtc = ref);
export const refWebRTC = () => state.webrtc;
