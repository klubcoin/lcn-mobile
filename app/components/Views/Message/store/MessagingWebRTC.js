import { DeviceEventEmitter } from 'react-native';
import { AckWebRTC } from '../../../../services/Messages';
import { JoinFile } from '../../FilesManager/store/FileStore';
import { Chat, ChatProfile, EditMessage, DeleteMessage } from './Messages';

export default class MessagingWebRTC {
	webrtc = null;
	evtMessage = null;

	from = null;
	getPeers = null;
	data = null;

	constructor(from, peersFunc, webrtc) {
		this.from = from;
		this.getPeers = peersFunc;
		this.webrtc = webrtc;

		this.revokeMessageEvt = webrtc?.addListener('message', this._onMessage);
		this.revokeErrorEvt = webrtc?.addListener('error', this._onError);
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
			const actions = [Chat().action, ChatProfile().action, JoinFile().action, AckWebRTC().action];
			if (actions.includes(data.action)) {
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
	};

	send(data, peers) {
		const addresses = (peers?.length != 0 && peers) || (this.getPeers && this.getPeers());
		if (!addresses) return;

		for (let address of addresses) {
			this.data = Chat(data, this.from, address);
			if (this.webrtc && this.webrtc.sendToPeer) {
				this.webrtc.sendToPeer(address, this.data);
			}
		}
	}
}
