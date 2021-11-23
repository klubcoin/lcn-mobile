import moment from 'moment';
import { sha256 } from '../core/CryptoSignature';
import { DeviceEventEmitter } from 'react-native';
import * as RNFS from 'react-native-fs';
import { ContainFiles, FilePart, JoinFile, PartSize, ReadFileResult, SavedFile, StoreFile } from './FileStore';
import { AckWebRTC } from './Messages';

export default class FileTransferWebRTC {
	_ready = false;
	sendingPart = 0;
	queue = [];
	partCollector = {};

	monitors = {}; // timeout monitors

	from = null;
	data = null;
	addresses = [];
	directToPeer; // send file to one peer

	name = '';
	timestamp = 0;
	checksum = null;
	partCount = 0;
	partSize = 0;

	evtComplete = null;
	evtError = null;

	constructor(data, from, addresses, webrtc, params) {
		this.from = from;
		this.data = data;
		this.addresses = addresses;
		this.webrtc = webrtc;
		this.directToPeer = params?.direct;

		if (data && !data.action && !(params && params.fullSend)) {
			this._prepareQueue();
		}

		this.revokeMessageEvt = webrtc.addListener('message', (data, peer) => this._onMessage(data, peer));
	}

	_onMessage(data, peerId) {
		if (data.action) {
			if (data.action == ContainFiles().action && peerId == this.awaitingPeer) {
				if (this.monitorFailure) clearTimeout(this.monitorFailure);
				this._nextQueue();
				this._updateSent(data);
			} else if (data.action == 'ping') {
				DeviceEventEmitter.emit(`WebRtcPeer:${peerId}`, data);
			} else if (data.action == ReadFileResult().action && data.sourcePeer) {
				const { name, totalPart, parts } = data;
				const hash = sha256(name);

				if (hash == this.watchHash) {
					parts.map(e => {
						const index = e.i;
						const listener = DeviceEventEmitter.addListener(`FileTransPart:${hash}:${index}`, result => {
							if (totalPart == result.totalPart && /^\d+$/.test(totalPart)) {
								listener.remove();
								this.partCollector[`${hash}:${index}`] = result;
								if (Object.keys(this.partCollector).length == totalPart) {
									this.joinParts();
								}
							}
						});
					});
				}
			} else if (data.action == AckWebRTC().action && data.hash == this.checksum) {
				if (this.monitors[peerId]) {
					clearTimeout(this.monitors[peerId]);
					this.monitors[peerId] = null;
				}
			}
		}
	}

	setOnComplete(callback) {
		this.evtComplete = callback;
	}

	setOnError(callback) {
		this.evtError = callback;
	}

	static async joinFile(data) {
		const { from, hash, name, totalPart } = data;

		const folder = `${RNFS.DocumentDirectoryPath}/${from}`;
		if (!(await RNFS.exists(folder))) await RNFS.mkdir(folder);

		const fileName = `${/*hash ||*/ name}`;
		const path = `${folder}/${fileName}`;

		if (await RNFS.exists(path)) await RNFS.unlink(path);

		const files = await RNFS.readDir(folder);
		const foundFiles = files.filter(e =>
			e.name.indexOf(`${hash}.${totalPart}`) === 0
			|| e.name.indexOf(`${name}.${totalPart}`) === 0
		).sort((a, b) => {
			const aIndex = a.path.split('.').reverse()[0];
			const bIndex = b.path.split('.').reverse()[0];
			return aIndex - bIndex;
		});

		// join part files into single file
		for (const index in foundFiles) {
			const file = foundFiles[index];
			const content = await RNFS.readFile(file.path, 'utf8');
			await RNFS.appendFile(path, content, 'utf8');
		}

		// decode base64 utf8 string to binary
		const content = await RNFS.readFile(path, 'utf8');
		await RNFS.writeFile(path, content, 'base64');

		return path;
	}

	async joinParts() {
		if (this.revokeMessageEvt) this.revokeMessageEvt();

		const keys = Object.keys(this.partCollector).sort();
		const { from, hash, name, created } = this.partCollector[keys[0]];

		const folder = `${RNFS.DocumentDirectoryPath}/${from}`;
		if (!(await RNFS.exists(folder))) await RNFS.mkdir(folder);

		const fileName = `${/*hash ||*/ name}`;
		const path = `${folder}/${fileName}`;
		if (await RNFS.exists(path)) await RNFS.unlink(path);

		for (var k in keys) {
			const data = this.partCollector[keys[k]];
			const { parts } = data;

			const part = parts[0];
			const content = part?.v;

			await RNFS.appendFile(path, content, 'utf8');
		}

		DeviceEventEmitter.emit('FileTransFetched', { path, name, hash, created });
	}

	static async storeFile(data) {
		const { from, hash, name, created, totalPart, parts } = data;

		const folder = `${RNFS.DocumentDirectoryPath}/${from}`;
		if (!(await RNFS.exists(folder))) await RNFS.mkdir(folder);
		if (!(await RNFS.exists(folder))) {
			try {
				await RNFS.mkdir(folder);
			} catch (e) {
				console.warn(e)
			}
		}

		const part = parts[0];
		const content = part?.v;
		const fileName = `${/*hash ||*/ name}.${totalPart}.${part?.i}`;
		const path = `${folder}/${fileName}`;
		if (await RNFS.exists(path)) await RNFS.unlink(path);

		return new Promise((resolve, reject) => {
			RNFS.writeFile(path, content, 'utf8')
				.then(() => {
					const savedFile = SavedFile(hash, name, created, parts);
					const containFiles = ContainFiles(from, savedFile);
					resolve(containFiles);
				})
				.catch(err => reject(err));
		});
	}

	_updateSent(data) {
		const { files } = data;
		files.map(f => {
			if (f.hash == this.checksum) {
			}
		});
	}

	_prepareQueue() {
		const { data, addresses } = this;
		const totalSize = data.length;
		const partSize = PartSize(totalSize, addresses.length);
		const partCount = Math.ceil(totalSize / partSize);

		this.totalSize = totalSize;
		this.partSize = partSize;
		this.partCount = partCount;
		this.partPerPeer = partCount / addresses.length;

		this.queue = Array(partCount)
			.fill(0)
			.map((e, index) => {
				return {
					index: index + 1,
					address: addresses[index % addresses.length],
					status: 0
				};
			});
	}

	_sendQueue() {
		const { sendingPart, partCount, partSize, from, checksum, name, timestamp } = this;

		if (sendingPart >= partCount) return;

		const queue = this.queue[sendingPart];
		const { index, address } = queue;

		const start = sendingPart * partSize;
		const length = partSize;
		const data = this.data.substr(start, length);

		const part = FilePart(index, data);
		const storeFile = StoreFile(from, address, checksum, name, timestamp, partCount, [part]);

		if (this.webrtc && this.webrtc.sendToPeer) {
			const connectAndSend = () => {
				this.webrtc.connectTo(address);
				this.monitorFailure = setTimeout(() => this._reportFailure(address), 8000);
				DeviceEventEmitter.once(`WebRtcPeer:${address}`, () => {
					this._onProgress(address);
					this.awaitingPeer = address;
					this.webrtc.sendToPeer(address, storeFile);
				});
			};
			if (!this.webrtc.hasChannel(address)) {
				connectAndSend();
			} else {
				this._onProgress(address);
				this.awaitingPeer = address;
				this.webrtc.sendToPeer(address, storeFile);
				this.monitorFailure = setTimeout(() => connectAndSend(), 5000);
			}
		}
	}

	_reportFailure = address => {
		const { name, sendingPart, partCount } = this;
		const info = {
			error: true,
			peer: address,
			name,
			partCount,
			currentPart: sendingPart
		}

		if (this.evtError) this.evtError(info);
		DeviceEventEmitter.emit('FileTransStat', info);
	};

	_onProgress(address) {
		const { sendingPart, partCount, name } = this;
		DeviceEventEmitter.emit('FileTransStat', { name, partCount, currentPart: sendingPart, peer: address });
	}

	_nextQueue() {
		this.sendingPart++;

		const { name, sendingPart, partCount } = this;
		if (sendingPart >= partCount) {
			// File transfer completed
			if (this.revokeMessageEvt) this.revokeMessageEvt();
			DeviceEventEmitter.emit('FileTransStat', { name, partCount, completed: true });
			this._onComplete();
		} else {
			this._sendQueue();
		}
	}

	_onComplete = () => {
		const { partCount, from, addresses, checksum, name, timestamp } = this;
		if (this.evtComplete) this.evtComplete({ partCount, name, timestamp, checksum });

		if (this.directToPeer) {
			const address = addresses[0];
			const action = JoinFile(from, address, checksum, name, partCount);
			this.webrtc.sendToPeer(address, action);
		}
	}

	_readFileStats = () => {
		this.addresses.map(address => this._readFileOnPeer(address));
	};

	_readFileOnPeer = address => {
		if (this.webrtc && this.webrtc.sendToPeer) {
			if (!this.webrtc.hasChannel(address)) {
				this.connectAndSend(address);
			} else {
				this.webrtc.sendToPeer(address, this.data);
			}
		}
	};

	connectAndSend = address => {
		this.webrtc.connectTo(address);
		DeviceEventEmitter.once(`WebRtcPeer:${address}`, () => {
			this.webrtc.sendToPeer(address, this.data);
		});
	};

	_sendAsOne = () => {
		this.data.checksum = this.checksum;
		this.addresses.map(address => {
			if (this.webrtc && this.webrtc.sendToPeer) {
				if (!this.webrtc.hasChannel(address)) {
					this.connectAndSend(address);
				} else {
					this.monitors[address] = setTimeout(() => this.connectAndSend(address), 5000);
					this.webrtc.sendToPeer(address, this.data);
				}
			}
		});
	};

	static readFile(readFileAction, addresses, webrtc) {
		const data = readFileAction;
		const { from, name } = data;
		const ft = new FileTransferWebRTC(data, from, addresses, webrtc);
		ft.watchHash = sha256(name);
		ft._readFileStats();
		return ft;
	}

	static sendAsParts(data, lookupName, from, addresses, webrtc, params) {
		const ft = new FileTransferWebRTC(data, from, addresses, webrtc, params);
		ft.checksum = sha256(data);
		ft.name = lookupName;
		ft.timestamp = moment().unix();
		ft._sendQueue();
		return ft;
	}

	static sendAsOne(data, from, addresses, webrtc) {
		const ft = new FileTransferWebRTC(data, from, addresses, webrtc, { fullSend: true });
		ft.checksum = sha256(data);
		ft._sendAsOne();
		return ft;
	}

	static sendFile(file, from, addresses) {
		// TODO: calculate checksum, read file name, total size, creation timestamp
	}
}
