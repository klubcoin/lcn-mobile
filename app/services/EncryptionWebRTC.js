import CryptoSignature from "../core/CryptoSignature";
import EncryptionLayer from "./EncryptionLayer";

export default class EncryptionWebRTC extends EncryptionLayer {

  address = ''; // user's hex address

  constructor(address) {
    super(address);
    this.address = address;
  }

  async setKeyPairHandler(callback) {
    if (callback) {
      const { privateKey, publicKey } = await callback(this.address);
      this.setKeyPair(privateKey, publicKey);
    }
  }

  setKeyPair(privateKey, publicKey) {
    this.privateKey = privateKey;
    this.publicKey = publicKey;
  }

  encrypt(payload, publicKey) {
    if (!publicKey) return payload;
    return CryptoSignature.encryptMessage(payload, publicKey);
  }

  decrypt(payload) {
    payload = super.decrypt(payload);
    return CryptoSignature.decryptMessage(payload, this.privateKey);
  }
}