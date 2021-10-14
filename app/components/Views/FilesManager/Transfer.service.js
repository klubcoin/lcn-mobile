import { DeviceEventEmitter } from 'react-native';
import { statuses } from './FileDetails';
import preferences from '../../../store/preferences';
import { refWebRTC } from '../../../services/WebRTC';
import * as RNFS from 'react-native-fs';
import FileTransferWebRTC from '../../../services/FileTransferWebRTC';

export default class FileTransfer {
	static instance;
	queueFiles = [];

	static getInstance() {
		if (!FileTransfer.instance) {
			FileTransfer.instance = new FileTransfer();
		}
		return FileTransfer.instance;
	}

	updatePreference = async (selectedFile, status, percent, detailPart, partCount) => {
		var localFiles = await preferences.getTransferredFiles();
		var file;
		if (localFiles) file = localFiles.find(e => e.id === selectedFile.id);
		else {
			file = selectedFile;
			localFiles.push(selectedFile);
		}

		file.percent = percent;

		if (partCount) file.partCount = partCount;

		//handle detail part
		if (detailPart) {
			var details = file.details ?? {};
			var key = Object.keys(detailPart);

			if (key[0]) {
				if (!details.hasOwnProperty(key[0])) {
					file.details = Object.assign(details, detailPart);
				} else if (details.hasOwnProperty(key[0])) {
					var mergeArr = file.details[key[0]].concat(detailPart[key[0]]);
					file.details[key[0]] = mergeArr;
				}
				file.currentPart = detailPart[key[0]];
			}
		}

		switch (status) {
			case statuses.process:
				file.status = statuses.process;
				break;
			case statuses.success:
				file.status = statuses.success;
				break;
			case statuses.failed:
				file.status = statuses.failed;
				break;
			default:
				break;
		}

		localFiles.forEach(e => preferences.saveTransferredFiles(e));
	};

	sendToNextFile = (selectedAddress, callback) => {
		callback();
		if (this.queueFiles.length <= 0) return;
		this.queueFiles.shift();
		this.startTransfer(selectedAddress, callback);
	};

	startTransfer = async (selectedAddress, callback) => {
		try {
			const webrtc = refWebRTC();

			const file = this.queueFiles[0];
			const addresses = file.contacts.map(e => e.address);
			const content = await RNFS.readFile(decodeURI(file.file.uri), 'base64');
			const lookupName = file.file.name;

			FileTransferWebRTC.sendAsParts(content, lookupName, selectedAddress, addresses, webrtc);
			const statsEvent = DeviceEventEmitter.addListener('FileTransStat', stats => {
				const { completed, name, error, peer, currentPart, partCount } = stats;

				let successPercent = 0;
				let partDetail = {};
				if (currentPart && partCount) {
					successPercent = currentPart / partCount;
					partDetail[peer] = [currentPart];
				}

				this.updatePreference(file, statuses.process, successPercent, partDetail, partCount);

				callback();

				if (completed && name == lookupName) {
					this.updatePreference(file, statuses.success, 1);
					statsEvent.remove(); // remove if done
					this.sendToNextFile(selectedAddress, callback);
				} else if (error && name == lookupName) {
					this.updatePreference(file, statuses.failed, successPercent);

					alert(`Error: Failed to send ${currentPart}/${partCount} of ${lookupName} to ${peer}`);
					statsEvent.remove();
					this.sendToNextFile(selectedAddress, callback); // remove if done
				}
			});
		} catch (error) {
			const file = this.queueFiles[0];
			this.updatePreference(file, statuses.failed, 0);
			callback();
			this.sendToNextFile(selectedAddress, callback);
		}
	};
}
