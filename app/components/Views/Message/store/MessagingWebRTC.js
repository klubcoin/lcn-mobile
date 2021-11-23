import { DeviceEventEmitter } from 'react-native';
import { Chat } from './Messages';

export default class MessagingWebRTC {
	webrtc = null;
	evtMessage = null;

	from = null;
	toPeer = null;
	data = null;

	constructor(from, to, webrtc) {
		this.from = from;
		this.toPeer = to;
		this.webrtc = webrtc;

		this.revokeMessageEvt = webrtc.addListener('message', this._onMessage);
		this.revokeErrorEvt = webrtc.addListener('error', this._onError);
	}

	addListener(type, callback) {
		switch (type) {
			case 'message':
				this.evtMessage = callback;
				return { remove: () => (this.evtMessage = null) };
		}
	}

	removeListeners() {
		if (this.revokeMessageEvt) this.revokeMessageEvt();
		if (this.revokeErrorEvt) this.revokeErrorEvt();
	}

	_onMessage = (data, peerId) => {
		if (data.action) {
			if (data.action == 'ping') {
				DeviceEventEmitter.emit(`WebRtcPeer:${peerId}`, data);
			}

			if (data.action == Chat().action) {
				if (this.evtMessage) this.evtMessage(data, peerId);
			}
		}
	};

	setOnError(callback) {
		this.onError = callback;
	}

	_onError = (data, peerId) => {
		if (data?.action == Chat().action && data?.message?._id) {
			if (this.onError) this.onError(data.message, peerId);
		}
	}

	send(data) {
		const address = this.toPeer;
		this.data = Chat(data, this.from, this.toPeer);

		if (this.webrtc && this.webrtc.sendToPeer) {
			this.webrtc.sendToPeer(address, this.data);
		}
	}
}
