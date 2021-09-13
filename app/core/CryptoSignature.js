import * as sigUtil from 'eth-sig-util';
import Engine from './Engine';

export default class CryptoSignature {
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
