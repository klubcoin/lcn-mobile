import WebService from './WebService';

export default class APIService {

  static API_KEY = 'toto';
  static apiEtherScan = () => 'etherscan/api';
  static apiGetOrderById = () => 'pg/v1/orders/<orderId>';

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
}