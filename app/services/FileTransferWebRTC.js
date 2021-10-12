import moment from 'moment';
import { sha256 } from 'hash.js';
import { DeviceEventEmitter } from 'react-native';
import * as RNFS from 'react-native-fs';
import { ContainFiles, FilePart, PartSize, ReadFileResult, SavedFile, StoreFile } from './FileStore';

export default class FileTransferWebRTC {
  _ready = false;
  sendingPart = 0;
  queue = [];
  partCollector = {};

  from = null;
  data = null;
  addresses = [];

  name = '';
  timestamp = 0;
  checksum = null;
  partCount = 0;
  partSize = 0;

  constructor(data, from, addresses, webrtc) {
    this.from = from;
    this.data = data;
    this.addresses = addresses;
    this.webrtc = webrtc;

    if (data && !data.action)
      this._prepareQueue();

    this.revokeMessageEvt = webrtc.addListener('message', (data, peer) => this._onMessage(data, peer));
  }

  _onClose() {
    console.log('FS lost connection')
    this._ready = false;
  }

  _onMessage(data, peerId) {
    try {
      data = JSON.parse(data);
    } catch (e) { }

    if (data.action) {
      if (data.action == ContainFiles().action && peerId == this.awaitingPeer) {
        if (this.monitorFailure) clearTimeout(this.monitorFailure);
        this._nextQueue();
        this._updateSent(data);
      } else if (data.action == 'ping') {
        DeviceEventEmitter.emit(`WebRtcPeer:${peerId}`, data);
      } else if (data.action == ReadFileResult().action && data.sourcePeer) {
        const { name, totalPart, parts } = data;
        const hash = sha256(name).digest('hex');

        if (hash == this.watchHash) {
          parts.map(e => {
            const index = e.i;
            const listener = DeviceEventEmitter.addListener(`FileTransPart:${hash}:${index}`, (result) => {
              if (totalPart == result.totalPart && /^\d+$/.test(totalPart)) {
                listener.remove();
                this.partCollector[`${hash}:${index}`] = result;
                if (Object.keys(this.partCollector).length == totalPart) {
                  this.joinParts();
                }
              }
            })
          })
        }
      }
    }
  }

  async joinParts() {
    if (this.revokeMessageEvt) this.revokeMessageEvt();

    const keys = Object.keys(this.partCollector).sort();
    const { from, hash, name, created } = this.partCollector[keys[0]];

    const folder = `${RNFS.DocumentDirectoryPath}/${from}`;
    if (! await RNFS.exists(folder)) await RNFS.mkdir(folder);

    const fileName = `${/*hash ||*/ name}`;
    const path = `${folder}/${fileName}`;
    await RNFS.unlink(path);

    for (k in keys) {
      const data = this.partCollector[keys[k]];
      const { parts } = data;

      const part = parts[0];
      const content = part?.v;

      await RNFS.appendFile(path, content, 'utf8');
    };

    DeviceEventEmitter.emit('FileTransFetched', { path, name, hash, created });
  }

  static async storeFile(data) {
    const { from, hash, name, created, totalPart, parts } = data;

    const folder = `${RNFS.DocumentDirectoryPath}/${from}`;
    if (! await RNFS.exists(folder)) await RNFS.mkdir(folder);

    const part = parts[0];
    const content = part?.v;
    const fileName = `${/*hash ||*/ name}.${totalPart}.${part?.i}`;
    const path = `${folder}/${fileName}`;

    return new Promise((resolve, reject) => {
      RNFS.writeFile(path, content, 'utf8')
        .then(() => {
          const savedFile = SavedFile(hash, name, created, parts);
          const containFiles = ContainFiles(from, savedFile);
          resolve(containFiles);
        })
        .catch((err) => reject(err));
    });
  }

  _updateSent(data) {
    const { files } = data;
    files.map(f => {
      if (f.hash == this.checksum) {

      }
    })
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

    this.queue = Array(partCount).fill(0).map((e, index) => {
      return ({
        index: index + 1,
        address: addresses[index % addresses.length],
        status: 0,
      })
    })
  }

  _sendQueue() {
    const {
      sendingPart, partCount, partSize,
      from,
      checksum, name, timestamp
    } = this;

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
        this.monitorFailure = setTimeout(() => this._reportFailure(address), 4000);
        DeviceEventEmitter.once(`WebRtcPeer:${address}`, () => {
          this._onProgress();
          this.awaitingPeer = address;
          this.webrtc.sendToPeer(address, JSON.stringify(storeFile));
        });
      }
      if (!this.webrtc.hasChannel(address)) {
        connectAndSend();
      } else {
        this._onProgress();
        this.awaitingPeer = address;
        this.webrtc.sendToPeer(address, JSON.stringify(storeFile));
        this.monitorFailure = setTimeout(() => connectAndSend(), 2500);
      }
    }
  }

  _reportFailure = (address) => {
    const { name, sendingPart, partCount } = this;

    DeviceEventEmitter.emit('FileTransStat', {
      error: true,
      peer: address,
      name, partCount, currentPart: sendingPart
    });
  }

  _onProgress() {
    const { sendingPart, partCount, name } = this;
    DeviceEventEmitter.emit('FileTransStat', { name, partCount, currentPart: sendingPart });
  }

  _nextQueue() {
    this.sendingPart++;

    const { name, sendingPart, partCount } = this;
    if (sendingPart >= partCount) {
      // File transfer completed
      if (this.revokeMessageEvt) this.revokeMessageEvt();
      DeviceEventEmitter.emit('FileTransStat', { name, partCount, completed: true });
    } else {
      this._sendQueue();
    }
  }

  _readFileStats = () => {
    this.addresses.map(address => this._readFileOnPeer(address));
  }

  _readFileOnPeer = (address) => {
    if (this.webrtc && this.webrtc.sendToPeer) {
      const connectAndSend = () => {
        this.webrtc.connectTo(address);
        DeviceEventEmitter.once(`WebRtcPeer:${address}`, () => {
          this.webrtc.sendToPeer(address, JSON.stringify(this.data));
        });
      }
      if (!this.webrtc.hasChannel(address)) {
        connectAndSend();
      } else {
        this.webrtc.sendToPeer(address, JSON.stringify(this.data));
      }
    }
  }

  static readFile(readFileAction, addresses, webrtc) {
    const data = readFileAction;
    const { from, name } = data;
    const ft = new FileTransferWebRTC(data, from, addresses, webrtc);
    ft.watchHash = sha256(name).digest('hex');
    ft._readFileStats();
  }

  static sendAsParts(data, lookupName, from, addresses, webrtc) {
    const ft = new FileTransferWebRTC(data, from, addresses, webrtc);
    ft.checksum = sha256(data).digest('hex');
    ft.name = lookupName;
    ft.timestamp = moment().unix();
    ft._sendQueue();
  }

  static sendFile(file, from, addresses) {
    // TODO: calculate checksum, read file name, total size, creation timestamp
  }
}