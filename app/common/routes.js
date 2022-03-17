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
		chainId: '76',
		symbol: null,
		ticker: 'KLUB',
		coin: 'Klubcoin',
		route: `${Config.SERVER_ADDRESS}/meveo/rest/`,
		hostDomain: 'klubcoin.net',
		blockExploreUrl: 'https://etherscan.io/token/0xf993c2749a21d10a4a36fe5dda23830b415d9e0d',
		accountUrl: Config.SERVER_ADDRESS,
		helpSupportUrl: 'https://docs.liquichain.io',
		reportIssueUrl: 'https://github.com/klubcoin/lcn-mobile/issues',
		portalUrl: 'https://klubcoin.net',
		contactUrl: 'https://klubcoin.net/contact',
	},
	klubToken: {
		address: "0x7Bd6050C39252103cEad4501DA5069481aB4F172",
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
