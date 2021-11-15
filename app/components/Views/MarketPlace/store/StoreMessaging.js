import { StoreMessage } from './StoreMessages';

export default class StoreMessaging {
	webrtc = null;
	evtMessage = null;

	from = null;
	data = null;

	constructor(from, webrtc) {
		this.from = from;
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
			if (data.action == StoreMessage().action) {
				if (this.evtMessage) this.evtMessage(data, peerId);
			}
		}
	};

	setOnError(callback) {
		this.onError = callback;
	}

	_onError = (data, peerId) => {
		if (data?.action == StoreMessage().action) {
			if (this.onError) this.onError(data.message, peerId);
		}
	}

	send(data, to) {
		const address = to;
		this.data = StoreMessage(data, this.from, address);

		if (this.webrtc && this.webrtc.sendToPeer) {
			this.webrtc.sendToPeer(address, this.data);
		}
	}
}
