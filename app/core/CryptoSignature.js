import * as sigUtil from 'eth-sig-util';
import * as ethUtil from 'ethereumjs-util';
import Engine from './Engine';

export default class CryptoSignature {
	static async signMessage(from, data) {
		const { KeyringController } = Engine.context;
		const dataBuffer = ethUtil.bufferToHex(Buffer.from(data, 'utf8'));
		const params = { from, data: dataBuffer };
		return await KeyringController.signMessage(params);
	}
	static async signTypedData(from, typedData, version = 'V4') {
		const { KeyringController } = Engine.context;
		const params = { from, data: typedData };
		return await KeyringController.signTypedMessage(params, version);
	}

	static recoverTypedData(data, signature, version = 'V4') {
		const params = { data, sig: signature };
		return sigUtil.recoverTypedSignature(params, version);
	}
}
