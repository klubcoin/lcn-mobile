import moment from 'moment';
import WebService from './WebService';

const basicAuth = 'apitest:apitest';
const basicAuthAdmin = 'meveo.admin:meveo';

const dateFormatMeveo = 'YYYY-MM-DD HH:mm:ss';

export default class APIService {

  static API_KEY = 'toto';
  static apiEtherScan = () => 'etherscan/api';
  static apiGetOrderById = (orderId) => `pg/v1/orders/${orderId}`;
  static apiProceedOrder = () => 'pg/v1/orderpayments';
  static apiPeerAnnounce = () => 'announce';

  static apiRegisterVoter = (instanceId, walletHash) => `registerVoter/${instanceId}/${walletHash}`;
  static apiGetVoteProposals = (instanceId, voterId) => `listProposals/${instanceId}/${voterId}`;
  static apiApproveVoteProposal = (proposalId, voterId) => `approveProposal/${proposalId}/${voterId}`;
  static apiListVotes = (instanceId, voterId) => `listVotes/${instanceId}/${voterId}`;

  static routePersistenceAPI = () => 'https://account.liquichain.io/meveo/api/rest/default/persistence/';
  static apiListApps = () => APIService.routePersistenceAPI() + 'LiquichainApp/list';
  static apiGetAppInstances = (cetCode) => APIService.routePersistenceAPI() + `${cetCode}/list`;
  static apiGetWalletContract = (appWallet) => APIService.routePersistenceAPI() + `Wallet/${appWallet}`;

  static apiVoteProposal = (uuid) => APIService.routePersistenceAPI() + `LiquivoteProposal/${uuid}`;
  static apiVoteDelegations = () => APIService.routePersistenceAPI() + `LiquivoteDelegation/list`;
  static apiVoteDelegation = (uuid) => APIService.routePersistenceAPI() + `LiquivoteDelegation/${uuid}`;

  static announcePeerOnlineStatus(peerId, callback) {
    const data = {
      peer_id: peerId,
      info_hash: '843D620DC0F14CEA05BC72120CC2CDC8A8929B93',
      port: 0,
    }
    WebService.sendGet(this.apiPeerAnnounce(), data, callback);
  }

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
    const route = this.apiGetOrderById(orderId);
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
    const route = this.apiGetAppInstances(cetCode);
    const data = { basicAuth };
    WebService.sendPostDirect(route, data, callback);
  }

  static getWalletContract(appWallet, callback) {
    const route = this.apiGetWalletContract(appWallet);
    const data = { basicAuth: basicAuthAdmin };
    WebService.sendGetDirect(route, data, callback);
  }

  static registerVoter(instanceId, walletHash, callback) {
    WebService.sendPost(this.apiRegisterVoter(instanceId, walletHash), {}, callback);
  }

  static getVoteProposals(instanceId, voterId, callback) {
    WebService.sendGet(this.apiGetVoteProposals(instanceId, voterId), {}, callback);
  }

  static approveVoteProposal(proposalId, voterId, callback) {
    WebService.sendPost(this.apiApproveVoteProposal(proposalId, voterId), {}, callback);
  }

  static getVoteList(instanceId, voterId, callback) {
    WebService.sendGet(this.apiListVotes(instanceId, voterId), {}, callback);
  }

  static createVoteProposal({ uuid, liquivoteInstance, category, title, content }, callback) {
    const entity = {
      cetCode: 'LiquivoteProposal',
      liquivoteInstance,
      creationDate: moment().format(dateFormatMeveo),
      uuid, category, title, content
    };

    const data = {
      basicAuth,
      headers: {
        'Persistence-Mode': 'list',
      },
      rawBody: [entity]
    };
    WebService.sendPostDirect(this.routePersistenceAPI(), data, callback);
  }

  static getVoteProposal(uuid, callback) {
    const data = { basicAuth };
    WebService.sendGetDirect(this.apiVoteProposal(uuid), data, callback);
  }

  static deleteVoteProposal(uuid, callback) {
    const data = { basicAuth };
    WebService.sendDelete(this.apiVoteProposal(uuid), data, callback);
  }

  static getVoteDelegations(callback) {
    const data = { basicAuth };
    WebService.sendPostDirect(this.apiVoteDelegations(), data, callback);
  }

  static createVoteDelegation({ uuid, voterId, category, delegatedTo, fromDate, toDate }, callback) {
    const entity = {
      uuid,
      cetCode: 'LiquivoteDelegation',
      voter: voterId,
      category,
      delegatedTo,
      fromDate: moment(fromDate).format(dateFormatMeveo),
      toDate: moment(toDate).format(dateFormatMeveo),
    };

    APIService.postPersistence(this.routePersistenceAPI(), entity, callback);
  }

  static deleteVoteDelegation(uuid, callback) {
    const data = { basicAuth };
    WebService.sendDelete(this.apiVoteDelegation(uuid), data, callback);
  }

  static postPersistence(url, entity, callback) {
    const data = {
      basicAuth,
      headers: {
        'Persistence-Mode': 'list',
      },
      rawBody: [entity]
    };
    WebService.sendPostDirect(url, data, callback);
  }
}