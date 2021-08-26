export default {
  jsonRPC: 'jsonrpc',
  walletCreation: 'wallet_creation',
  getBalance: 'eth_getBalance',
  getTransaction: 'eth_getTransactionByHash',
  mainNetWork: {
    name: 'Liquichain Main Network',
    url: 'https://account.liquichain.io/meveo/rest/jsonrpc',
    chainId: '76',
    symbol: null,
    ticker: 'LCN',
    route: 'https://account.liquichain.io/meveo/rest/',
    blockExploreUrl: 'https://liquichain.io',
    accountUrl: 'https://account.liquichain.io',
    helpSupportUrl: 'https://docs.liquichain.io',
  },
  basicMethod: {
    "jsonrpc": "2.0",
    "method": null,
    "params": null // [mywallet, publicAddress, publicKey]
  },
  getConversions: 'currconv',
  paypalCreateOrder: "payment",
  paypalPaymentCapture: "payment-capture"
}