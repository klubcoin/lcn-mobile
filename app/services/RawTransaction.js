var __awaiter =
	(this && this.__awaiter) ||
	function(thisArg, _arguments, P, generator) {
		function adopt(value) {
			return value instanceof P
				? value
				: new P(function(resolve) {
						resolve(value);
				  });
		}
		return new (P || (P = Promise))(function(resolve, reject) {
			function fulfilled(value) {
				try {
					step(generator.next(value));
				} catch (e) {
					reject(e);
				}
			}
			function rejected(value) {
				try {
					step(generator['throw'](value));
				} catch (e) {
					reject(e);
				}
			}
			function step(result) {
				result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected);
			}
			step((generator = generator.apply(thisArg, _arguments || [])).next());
		});
	};
var __importDefault =
	(this && this.__importDefault) ||
	function(mod) {
		return mod && mod.__esModule ? mod : { default: mod };
	};

const eth_query_1 = __importDefault(require('eth-query'));
const async_mutex_1 = require('async-mutex');
const util_1 = require('./util');

export default class RawTransaction {
	constructor(getProvider) {
		const provider = getProvider();
		this.mutex = new async_mutex_1.Mutex();

		this.ethQuery = new eth_query_1.default(provider);
	}

	async getNonce(address) {
		return __awaiter(this, void 0, void 0, function*() {
			const releaseLock = yield this.mutex.acquire();
			try {
				const nonce = yield util_1.query(this.ethQuery, 'getTransactionCount', [address]);
				return nonce;
			} catch (error) {
			} finally {
				releaseLock();
			}
		});
	}
}
