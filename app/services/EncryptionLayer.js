import assert from 'assert';

export default class EncryptionLayer {
  publicKey;
  privateKey;

  encrypt(payload, publicKey) {
    assert(publicKey, 'Missing publicKey to encrypt');
    return payload;
  }

  decrypt(payload, privateKey) {
    assert(privateKey || this.publicKey, 'Missing privateKey to decrypt');
    return payload;
  }
}
