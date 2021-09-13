import * as sigUtil from 'eth-sig-util';
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
		const dataBuffer = ethUtil.bufferToHex(Buffer.from(data, 'utf8'));
		const params = { from, data: dataBuffer };
		return await KeyringController.signMessage(params);
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
}
