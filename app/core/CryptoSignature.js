import * as sigUtil from 'eth-sig-util';
import * as sha3JS from 'js-sha3';
import * as ethUtil from 'ethereumjs-util';
import Engine from './Engine';

export default class CryptoSignature {
	/**
	 * @param {*} from sender address
	 * @param {*} data message with fixed length of 32 chars
	 * @returns signature of message
	 */
	static async signMessage(from, data) {
		const { KeyringController } = Engine.context;
		const hash = sha3JS.keccak_256(data);
		const params = { from, data: hash };
		return await KeyringController.signMessage(params);
	}
	/**
	 * 
	 * @param {*} data which was used to generate signature
	 * @param {*} signature 
	 * @returns address of sender
	 */
	static recoverMessageSignature(data, signature) {
		const hash = Buffer.from(sha3JS.keccak_256(data), 'hex');
		const sigParams = ethUtil.fromRpcSig(ethUtil.toBuffer(signature));
		const publicKey = ethUtil.ecrecover(hash, sigParams.v, sigParams.r, sigParams.s);

		const sender = ethUtil.publicToAddress(publicKey);
		return ethUtil.bufferToHex(sender);
	}
	/**
	 * @param {*} from sender address
	 * @param {*} typedData json typed data
	 * @param {*} version optional V1, V3, V4
	 * @returns signature of typed data
	 */
	static async signTypedData(from, typedData, version = 'V4') {
		const { KeyringController } = Engine.context;
		const params = { from, data: typedData };
		return await KeyringController.signTypedMessage(params, version);
	}
	/**
	 * @param {*} data typed data
	 * @param {*} signature
	 * @param {*} version optional V1, V3, V4
	 * @returns address of sender
	 */
	static recoverTypedData(data, signature, version = 'V4') {
		const params = { data, sig: signature };
		return sigUtil.recoverTypedSignature(params, version);
	}

	static getEncryptionPublicKey(privKey) {
		return sigUtil.getEncryptionPublicKey(privKey);
	}

	static encryptMessage(data, publicKey) {
		return sigUtil.encrypt(publicKey, { data }, 'x25519-xsalsa20-poly1305');
	}

	static decryptMessage(data, privKey) {
		return sigUtil.decrypt(data, privKey);
	}
}
