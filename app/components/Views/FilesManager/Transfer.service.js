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

	updatePreference = async (selectedFile, status, percent) => {
		var localFiles = await preferences.getTransferredFiles();
		var file;
		if (localFiles) file = localFiles.find(e => e.id === selectedFile.id);
		else {
			file = selectedFile;
			localFiles.push(selectedFile);
		}

		file.percent = percent;

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
		await preferences.saveTransferredFiles(localFiles);
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
				if (currentPart && partCount) {
					successPercent = currentPart / partCount;
				}

				this.updatePreference(file, statuses.process, successPercent);

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
			this.sendToNextFile(selectedAddress, callback);
		}
	};
}
