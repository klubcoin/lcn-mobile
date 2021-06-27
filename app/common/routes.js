export default{
  jsonRPC: 'jsonrpc',
  walletCreation: 'wallet_creation',
  mainNetWork: {
    name: 'Liquichain Main Network',
    url: 'https://account.liquichain.io/meveo/rest/jsonrpc',
    chainId: 76,
    symbol: null,
    route: 'https://account.liquichain.io/meveo/rest/',
    blockExploreUrl: 'https://liquichain.io'
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