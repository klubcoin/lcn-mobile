import { displayName } from '../../app.json';
import BuildVariant from '../variants/BuildVariant'

export default {
	jsonRPC: 'jsonrpc',
	walletCreation: 'wallet_creation',
	walletUpdate: 'wallet_update',
	walletInfo: 'wallet_info',
	walletReport: 'wallet_report',
	getBalance: 'eth_getBalance',
	getTransaction: 'eth_getTransactionByHash',
	mainNetWork: {
		name: `${displayName} Main Network`,
		url: `${BuildVariant.activeVariant().ServerAddress}/meveo/rest/jsonrpc`,
		chainId: '76',
		symbol: null,
		ticker: 'KLUB',
		coin: 'Klubcoin',
		route: `${BuildVariant.activeVariant().ServerAddress}/meveo/rest/`,
		hostDomain: 'klubcoin.net',
		blockExploreUrl: 'https://klubcoin.net',
		accountUrl: BuildVariant.activeVariant().ServerAddress,
		helpSupportUrl: 'https://docs.liquichain.io',
		reportIssueUrl: 'https://github.com/liquichain/lcn-mobile/issues'
	},
	klubToken: {
		address: "0x7Bd6050C39252103cEad4501DA5069481aB4F172",
		symbol: "KLB",
		decimals: 18,
		image: "https://avatars.githubusercontent.com/u/93361768?s=200&v=4"
	},
	basicMethod: {
		jsonrpc: '2.0',
		method: null,
		params: null // [mywallet, publicAddress, publicKey]
	},
	getConversions: 'currconv',
	paypalCreateOrder: 'payment',
	paypalPaymentCapture: 'payment-capture'
};
