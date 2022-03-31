import { displayName } from '../../app.json';
import Config from "react-native-config";

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
		url: `${Config.SERVER_ADDRESS}/meveo/rest/jsonrpc`,
		chainId: '1662',
		symbol: null,
		ticker: 'KLUB',
		coin: 'Klubcoin',
		route: `${Config.SERVER_ADDRESS}/meveo/rest/`,
		hostDomain: 'klubcoin.net',
		blockExplorerUrl: 'https://testnet.liquichain.io',
		accountUrl: Config.SERVER_ADDRESS,
		helpSupportUrl: 'https://app.klubcoin.net/docs.html',
		reportIssueUrl: 'https://github.com/klubcoin/lcn-mobile/issues',
		portalUrl: 'https://klubcoin.net',
		contactUrl: 'https://klubcoin.net/contact',
	},
	klubToken: {
		chainId: '1662',
		address: "0x3Dbe873AC593490A425D70ef206B7F166862461e",
		symbol: "KLUB",
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
