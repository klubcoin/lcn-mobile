import WebService from './WebService';

export default class APIService {

  static API_KEY = 'toto';
  static apiEtherScan = () => 'etherscan/api';

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

}