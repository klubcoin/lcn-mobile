import { DeviceEventEmitter } from 'react-native';
import { AckWebRTC, Chat } from './Messages';

export default class MessagingWebRTC {
	webrtc = null;
	monitors = {}; // timeout monitors
	evtMessage = null;

	from = null;
	toPeer = null;
	data = null;
	checksum = null;

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
			} else if (data.action == AckWebRTC().action && data.hash == this.checksum) {
				if (this.monitors[peerId]) {
					clearTimeout(this.monitors[peerId]);
					this.monitors[peerId] = null;
				}
			}

			if (data.action == Chat().action) {
				if (this.evtMessage) this.evtMessage(data, peerId);
			}
		}
	};

	connectAndSend = address => {
		this.webrtc.connectTo(address);
		DeviceEventEmitter.once(`WebRtcPeer:${address}`, () => {
			this.webrtc.sendToPeer(address, this.data);
		});
	};

	send(data) {
		const address = this.toPeer;
		this.data = Chat(data, this.from, this.toPeer);
		this.checksum = this.data.checksum;

		if (this.webrtc && this.webrtc.sendToPeer) {
			if (!this.webrtc.hasChannel(address)) {
				this.connectAndSend(address);
			} else {
				this.monitors[address] = setTimeout(() => this.connectAndSend(address), 5000);
				this.webrtc.sendToPeer(address, this.data);
			}
		}
	}
}
