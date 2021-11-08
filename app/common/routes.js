import { displayName } from '../../app.json';

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
		url: 'https://account.liquichain.io/meveo/rest/jsonrpc',
		chainId: '76',
		symbol: null,
		ticker: 'LCN',
		coin: 'Licoin',
		route: 'https://account.liquichain.io/meveo/rest/',
		hostDomain: 'liquichain.io',
		blockExploreUrl: 'https://liquichain.io',
		accountUrl: 'https://account.liquichain.io',
		helpSupportUrl: 'https://docs.liquichain.io',
		reportIssueUrl: 'https://github.com/liquichain/lcn-mobile/issues'
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
