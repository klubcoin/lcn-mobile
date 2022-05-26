import { DeviceEventEmitter } from 'react-native';
import * as RNFS from 'react-native-fs';
import moment from 'moment';
import { sha256 } from '../../../../core/CryptoSignature';
import { refWebRTC } from '../../../../services/WebRTC';
import { ReadFile, ReadFileResult, StoreFile } from './FileStore';
import FileTransferWebRTC from './FileTransferWebRTC';

export default class FileTransferService {
	from = ''; // wallet address

	constructor(address) {
		this.from = address.toLowerCase();

		this.webRTC = refWebRTC();
		this.webRTC?.addListener('message', this.handleFileTransfer);
	}

	sendFile = async (request) => {
		const webrtc = refWebRTC();
		const path = request.name;
		const data = await RNFS.readFile(path, 'base64');

		FileTransferWebRTC.sendAsParts(data, request.hash, this.from, [request.from], webrtc, { direct: true });
	};

	handleFileTransfer = async (data, peerId) => {
		if (data.action == StoreFile().action) {
			FileTransferWebRTC.storeFile(data).then(message => this.webRTC.sendToPeer(peerId, message));
		} else if (data.action == ReadFile().action && !data.sourcePeer) {
			const { from, hash, name } = data;
			if (name && await RNFS.exists(name)) {
				// send whole file at once
				this.sendFile(data);
			} else {
				// file was saved as parts
				const folder = `${RNFS.DocumentDirectoryPath}/${from.toLowerCase()}`;
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
					message.sourcePeer = this.from;
					this.webRTC.sendToPeer(peerId, message);
				});
			}
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
}

const state = { fileService: null };
export const setFileTransferService = ref => (state.fileService = ref);
export const refFileTransferService = () => state.fileService;
