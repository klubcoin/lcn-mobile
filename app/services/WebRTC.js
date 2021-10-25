import { RTCPeerConnection, RTCSessionDescription, RTCIceCandidate } from 'react-native-webrtc';
import { ReadFile, ReadFileResult, StoreFile } from './FileStore';
import FileTransferWebRTC from './FileTransferWebRTC';
import CryptoSignature, { sha256 } from '../core/CryptoSignature';
import moment from 'moment';
import { DeviceEventEmitter } from 'react-native';
import * as RNFS from 'react-native-fs';
import Messaging, { Message, WSEvent } from './Messaging';
import { AckWebRTC, Chat, ChatProfile } from './Messages';
import preferences from '../store/preferences';

export default class WebRTC {
	fromUserId = '';
	sendChannels = {};
	peerRefs = {};
	peerPublicKeys = {};

	onReady = null;
	onMessage = null;
	onError = null;
	events = {
		ready: [],
		message: [],
		error: []
	};

	constructor(from) {
		this.fromUserId = from;
		this.initSocket();
	}

	async setKeyPairHandler(callback) {
		if (callback) {
			const { privateKey, publicKey } = await callback(this.fromUserId);
			this.setKeyPair(privateKey, publicKey);
		}
	}

	setKeyPair(privateKey, publicKey) {
		this.privateKey = privateKey;
		this.publicKey = publicKey;
	}

	addListener = (type, callback) => {
		switch (type) {
			case 'ready':
				this.onReady = callback;
				this.events.ready.push(callback);
				return () => this.events.ready.splice(this.events.ready.indexOf(callback), 1);
			case 'message':
				this.onMessage = callback;
				this.events.message.push(callback);
				return () => this.events.message.splice(this.events.message.indexOf(callback), 1);
			case 'error':
				this.onError = callback;
				this.events.error.push(callback);
				return () => this.events.error.splice(this.events.error.indexOf(callback), 1);
		}
	};

	initSocket = () => {
		this.messaging = new Messaging(this.fromUserId);
		this.messaging.on(WSEvent.ready, this.handleConnected.bind(this));
		this.messaging.on(WSEvent.message, this.handleWebRtcSignal.bind(this));
		this.messaging.initConnection();
	};

	handleWebRtcSignal = message => {
		try {
			const data = JSON.parse(message);
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
			}
		} catch (e) {}
	};

	sendSignal = (signal, payload) => {
		const message = Message(payload.target, {
			webrtc: true,
			signal,
			...payload
		});
		this.messaging.send(message);
	};

	connectTo = address => {
		this.peerRefs[address] = this.Peer(address);
		this.sendChannels[address] = this.peerRefs[address].createDataChannel('sendChannel');

		// listen to incoming messages from other peer
		this.sendChannels[address].onmessage = message => this.handleReceiveMessage(message, address);
	};

	handleConnected = () => {};

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
			this.sendToPeer(peerId, { action: 'ping', publicKey: this.publicKey });
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
			if (`${peerId}`.toLowerCase() != this.parseSignature(data)) return;

			if (data.encrypted) {
				data = this.decryptPayload(data);
			} else {
				data = JSON.parse(data.payload);
			}

			if (data.action == 'ping') {
				this.peerPublicKeys[peerId] = data.publicKey;
				this.sendToPeer(peerId, { action: 'pong', publicKey: this.publicKey });
			} else if (data.action == 'pong') {
				this.peerPublicKeys[peerId] = data.publicKey;
			} else if (data.checksum) {
				this.sendToPeer(peerId, AckWebRTC(data.checksum));
			}

			await this.handleChatMessage(data, peerId);
			await this.handleFileTransfer(data, peerId);
			this.events.message.map(callback => callback(data, peerId));
		} catch (e) {}
	};

	parseSignature(data) {
		if (!data || !data.payload || !data.signature) return;

		const { payload, signature } = data;
		return CryptoSignature.recoverMessageSignature(payload, signature);
	}

	decryptPayload(data) {
		if (!data || !data.payload || !data.encrypted) return data;

		const json = CryptoSignature.decryptMessage(data.payload, this.privateKey);
		try {
			return JSON.parse(json);
		} catch (e) {
			return json;
		}
	}

	handleChatMessage = async (data, peerId) => {
		if (data.action == Chat().action) {
			const { action } = data.message;
			if (action) {
				if (action == ChatProfile().action) {
					const { profile } = data.message;
					if (!profile) {
						const { avatar, firstname, lastname } = await preferences.getOnboardProfile();
						const name = `${firstname} ${lastname}`;
						const avatarb64 = await RNFS.readFile(avatar, 'base64');
						this.sendToPeer(peerId, ChatProfile({ name, avatar: avatarb64 }));
					}
				}
			} else {
				const conversation = (await preferences.getChatMessages(peerId)) || { messages: [], isRead: false };
				conversation.messages.push(data.message);
				preferences.saveChatMessages(peerId, conversation);
			}
		} else if (data.action == ChatProfile().action) {
			await preferences.setPeerProfile(peerId, data.profile);
		}
	};

	handleFileTransfer = async (data, peerId) => {
		if (data.action == StoreFile().action) {
			FileTransferWebRTC.storeFile(data).then(message => this.sendToPeer(peerId, message));
		} else if (data.action == ReadFile().action && !data.sourcePeer) {
			const { from, hash, name } = data;
			const folder = `${RNFS.DocumentDirectoryPath}/${from}`;
			if (!(await RNFS.exists(folder))) await RNFS.mkdir(folder);

			const files = await RNFS.readDir(folder);

			const foundFiles = files.filter(e => e.name.indexOf(hash) === 0 || e.name.indexOf(name) === 0);
			foundFiles.map(async e => {
				const content = await RNFS.readFile(e.path, 'utf8');
				const partId = e.name.split('.').reverse()[0];
				const totalPart = e.name.split('.').reverse()[1];
				const message = ReadFileResult(from, hash, name, moment(e.mtime).unix(), totalPart, [
					{ i: partId, v: content }
				]);
				message.sourcePeer = this.fromUserId;
				this.sendToPeer(peerId, message);
			});
		} else if (data.action == ReadFileResult().action) {
			//responded file
			const { name, parts } = data;
			const hash = sha256(name);
			parts.map(e => {
				const index = e.i;
				FileTransferWebRTC.storeFile(data).then(() =>
					DeviceEventEmitter.emit(`FileTransPart:${hash}:${index}`, data)
				);
			});
		}
	};

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

	hasChannel(address) {
		return this.sendChannels && this.sendChannels[address];
	}

	async sendToPeer(peerId, message) {
		const json = JSON.stringify(message);
		const channel = this.sendChannels[peerId];
		const publicKey = this.peerPublicKeys[peerId];

		const payload = publicKey ? CryptoSignature.encryptMessage(json, publicKey) : json;
		const signature = await CryptoSignature.signMessage(this.fromUserId, payload);
		const data = {
			payload,
			signature,
			encrypted: !!publicKey
		};
		channel && channel.send(JSON.stringify(data));
	}
}

const state = { webrtc: null };
export const setWebRTC = ref => (state.webrtc = ref);
export const refWebRTC = () => state.webrtc;
