import WebService from './WebService';

export default class APIService {

  static API_KEY = 'toto';
  static apiEtherScan = () => 'etherscan/api';
  static apiGetOrderById = () => 'pg/v1/orders/<orderId>';
  static apiProceedOrder = () => 'pg/v1/orderpayments';

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
}