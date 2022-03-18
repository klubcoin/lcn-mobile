import CryptoSignature from '../core/CryptoSignature';

const WS_URL = 'wss://account2.liquichain.io/meveo/ws/liquichain';

export const Register = (address) => ({
  action: 'register',
  account: address,
});

export const Message = (to, data) => ({
  action: 'message',
  to,
  message: JSON.stringify(data),
});

export const Ping = (from, to) => Message(to, { from, action: 'ping' });
export const Pong = (from, to) => Message(to, { from, action: 'pong' });
export const Online = (from, to) => Message(to, { from, action: 'online' });

export const WSEvent = {
  connected: 'connected',
  ready: 'ready',
  message: 'message',
  error: 'error',
  close: 'close',
}

/**
 * WebSocket messaging implementation for sending message between wallets
 */
export default class Messaging {
  _walletAddress = '';
  _ready = false;
  _queue = [];
  ws = null;

  _events = {};

  constructor(address) {
    this._walletAddress = address.toLowerCase();
  }

  on = (evt, callback) => {
    if (!evt || typeof evt != 'string') {
      throw new Error(`Invalid event ${evt}`);
    }
    if (!callback || typeof callback != 'function') {
      throw new Error(`Invalid callback function`);
    }
    this._events[evt] = callback;
  }

  _onEvent = (evt, data) => {
    if (this._events[evt]) {
      this._events[evt](data);
    }
  }

  _onConnected = async () => {
    const register = Register(this._walletAddress);
    register.sig = await this._signMessage(register);
    this.send(register);
    this._onEvent(WSEvent.open);
  }

  _onMessage = (evt) => {
    const { data } = evt;
    if (!this._ready && data == 'message correctly processed') {
      this._ready = true;
      this._sendQueue();
      this._onEvent(WSEvent.ready, data);
    } else {
      this._onEvent(WSEvent.message, data);
    }
  }

  _onClose = () => {
    this._ready = false;
    this._onEvent(WSEvent.close);

    if (!this.terminated) {
      setTimeout(() => {
        this.initConnection();
      }, 1000);
    }
  }

  _onError = (data) => {
    // console.warn('WS onError', data)
    this._onEvent(WSEvent.error, data);
  }

  initConnection() {
    this._disconnect();

    this._ws = new WebSocket(WS_URL);
    this._ws.onopen = this._onConnected;
    this._ws.onmessage = this._onMessage;
    this._ws.onerror = this._onError;
    this._ws.onclose = this._onClose;
  }

  disconnect() {
    this.terminated = true;
    this._disconnect();
  }

  _disconnect() {
    if (this._ws) {
      this._ws.close();
      this._ws = null;
    }
  }

  async message(to, data) {
    const message = Message(to, data);
    this.send(message);
  }

  _sendQueue = async () => {
    if (this._queue.length == 0) return;
    await this.send(this._queue.shift());

    if (this._queue.length > 0) {
      setTimeout(this._sendQueue, 10);
    }
  };

  async send(data) {
    if (!data) return;

    if (!this._ready && data.action != Register().action) {
      this._queue.push(data);
    } else {
      this._ws.send(JSON.stringify(data));
    }
  }

  async _signMessage(data) {
    const from = data.address || this._walletAddress;
    return await CryptoSignature.signMessage(from, data);
  }
}