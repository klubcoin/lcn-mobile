import WebService from './WebService';

const basicAuth = 'apitest:apitest';
const basicAuthAdmin = 'meveo.admin:meveo';

export default class APIService {

  static API_KEY = 'toto';
  static apiEtherScan = () => 'etherscan/api';
  static apiGetOrderById = () => 'pg/v1/orders/<orderId>';
  static apiProceedOrder = () => 'pg/v1/orderpayments';

  static routeAccountAPI = () => 'https://account.liquichain.io/meveo/api/rest/default/persistence/';
  static apiListApps = () => APIService.routeAccountAPI() + 'LiquichainApp/list';
  static apiGetAppInstances = () => APIService.routeAccountAPI() + '{cetCode}/list';
  static apiGetWalletContract = () => APIService.routeAccountAPI() + 'Wallet/{appWallet}';


  static getTransactionHistory(address, callback) {
    const data = {
      module: 'account',
      action: 'balancehistory',
      address,
      tag: 'latest',
      apikey: APIService.API_KEY,
    }
    WebService.sendGet(this.apiEtherScan(), data, callback);
  }

  static getOrderInfo(orderId, callback) {
    const route = this.apiGetOrderById().replace('<orderId>', orderId);
    WebService.sendGet(route, null, callback);
  }

  static proceedOrder(orderId, fromHash, signature, callback) {
    const data = {
      orderId,
      from: fromHash,
      sig: signature,
    }
    WebService.sendPost(this.apiProceedOrder(), data, callback);
  }

  static getAppList(callback) {
    const data = { basicAuth };
    WebService.sendPostDirect(this.apiListApps(), data, callback);
  }

  static getAppInstances(cetCode, callback) {
    const route = this.apiGetAppInstances().replace('{cetCode}', cetCode);
    const data = { basicAuth };
    WebService.sendPostDirect(route, data, callback);
  }

  static getWalletContract(appWallet, callback) {
    const route = this.apiGetWalletContract().replace('{appWallet}', appWallet);
    const data = { basicAuth: basicAuthAdmin };
    WebService.sendGetDirect(route, data, callback);
  }
}