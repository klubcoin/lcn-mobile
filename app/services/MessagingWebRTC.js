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
	}

	addListener(type, callback) {
		switch (type) {
			case 'message':
				this.evtMessage = callback;
				return { remove: () => (this.evtMessage = null) };
		}
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


	send(data) {
		const address = this.toPeer;
		this.data = Chat(data, this.from, this.toPeer);

		if (this.webrtc && this.webrtc.sendToPeer) {
			this.webrtc.sendToPeer(address, this.data);
		}
	}
}
