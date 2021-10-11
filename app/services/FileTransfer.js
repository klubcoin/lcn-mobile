import moment from 'moment';
import { sha256 } from 'hash.js';
import * as RNFS from 'react-native-fs';
import Messaging, { Message, WSEvent } from './Messaging';
import { ContainFiles, FilePart, PartSize, SavedFile, StoreFile } from './FileStore';

export default class FileTransfer {
  _ready = false;
  sendingPart = 0;
  queue = [];

  from = null;
  data = null;
  addresses = [];

  name = '';
  timestamp = 0;
  checksum = null;
  partCount = 0;
  partSize = 0;

  constructor(data, from, addresses) {
    this.from = from;
    this.data = data;
    this.addresses = addresses;

    this._prepareQueue();

    this.messaging = new Messaging(from);
    this.messaging.on(WSEvent.ready, this._onReady.bind(this))
    this.messaging.on(WSEvent.close, this._onClose.bind(this))
    this.messaging.on(WSEvent.message, this._onMessage.bind(this))
    this.messaging.initConnection();
  }

  _onClose() {
    console.log('FS lost connection')
    this._ready = false;
  }

  _onReady() {
    console.log('FS ready')
    this._sendQueue();
  }

  _onMessage(data) {
    try {
      data = JSON.parse(data);
    } catch (e) { }

    if (data.action) {
      if (data.action == ContainFiles().action) {
        this._updateSent(data);
      }
    } else {
      this._nextQueue();
    }
  }

  static async storeFile(data) {
    const { from, hash, name, created, parts } = data;

    const folder = `${RNFS.DocumentDirectoryPath}/${from}`;
    if (! await RNFS.exists(folder)) await RNFS.mkdir(folder);

    const part = parts[0];
    const content = part?.v;
    const fileName = `${/*hash ||*/ name}.${part?.i}`;
    const path = `${folder}/${fileName}`;

    return new Promise((resolve, reject) => {
      RNFS.writeFile(path, content, 'utf8')
        .then(() => {
          const savedFile = SavedFile(hash, name, created, parts);
          const containFiles = ContainFiles(from, savedFile);
          const message = Message(data.from, containFiles);
          resolve(message);
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
    const message = Message(address, storeFile);

    this.messaging.send(message);
  }

  _nextQueue() {
    this.sendingPart++;

    const { sendingPart, partCount } = this;
    if (sendingPart >= partCount) {
      this.messaging.disconnect();
    } else {
      this._sendQueue();
    }
  }

  static send(data, lookupName, from, addresses) {
    const ft = new FileTransfer(data, from, addresses);
    ft.checksum = sha256(data).digest('hex');
    ft.name = lookupName;
    ft.timestamp = moment().unix();
  }

  static sendFile(file, from, addresses) {
    // TODO: calculate checksum, read file name, total size, creation timestamp
  }
}