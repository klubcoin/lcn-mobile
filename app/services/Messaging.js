import CryptoSignature from '../core/CryptoSignature';

const WS_URL = 'wss://account.liquichain.io/meveo/ws/liquichain';

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
  ws = null;

  _events = {};

  constructor(address) {
    this._walletAddress = address;
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
    if (data == 'message correctly processed') {
      this._onEvent(WSEvent.ready, data);
    } else {
      this._onEvent(WSEvent.message, data);
    }
  }

  _onClose = () => {
    this._onEvent(WSEvent.close);

    if (!this.terminated) {
      setTimeout(() => {
        this.initConnection();
      }, 1000);
    }
  }

  _onError = (data) => {
    console.warn('onError', data)
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

  async send(data) {
    if (!data) return;

    this._ws.send(JSON.stringify(data));
  }

  async _signMessage(data) {
    const from = data.address || this._walletAddress;
    return await CryptoSignature.signMessage(from, data);
  }
}