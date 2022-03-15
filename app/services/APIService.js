import moment from 'moment';
import config from '../config';
import WebService from './WebService';
import BuildVariant from '../variants/BuildVariant';
import Config from 'react-native-config';

export const basicAuth = Config.BASIC_AUTH;
export const adminAuth = Config.ADMIN_AUTH;
const basicAuthAdmin = 'meveo.admin:meveo';

const dateFormatMeveo = 'YYYY-MM-DD HH:mm:ss';

export default class APIService {
	static API_KEY = 'toto';
	static apiEtherScan = () => 'etherscan/api';
	static apiGetOrderById = orderId => `pg/v1/orders/${orderId}`;
	static apiProceedOrder = () => 'pg/v1/orderpayments';
	static apiPeerAnnounce = () => 'announce';

	static apiRegisterVoter = (instanceId, walletHash) => `registerVoter/${instanceId}/${walletHash}`;
	static apiGetVoteProposals = (instanceId, voterId) => `listProposals/${instanceId}/${voterId}`;
	static apiApproveVoteProposal = (proposalId, voterId) => `approveProposal/${proposalId}/${voterId}`;
	static apiListVotes = (instanceId, voterId) => `listVotes/${instanceId}/${voterId}`;

	static routeMeveoAPI = () => `${Config.SERVER_ADDRESS}/meveo`;
	static routePersistenceAPI = () => `${Config.SERVER_ADDRESS}/meveo/api/rest/default/persistence/`;
	static apiListApps = () => APIService.routePersistenceAPI() + 'LiquichainApp/list';
	static apiGetAppInstances = cetCode => APIService.routePersistenceAPI() + `${cetCode}/list`;
	static apiGetWalletContract = appWallet => APIService.routePersistenceAPI() + `Wallet/${appWallet}`;

	static apiVoteProposal = uuid => APIService.routePersistenceAPI() + `LiquivoteProposal/${uuid}`;
	static apiVoteDelegations = () => APIService.routePersistenceAPI() + `LiquivoteDelegation/list`;
	static apiVoteDelegation = uuid => APIService.routePersistenceAPI() + `LiquivoteDelegation/${uuid}`;

	static apiMarketCategories = () => APIService.routePersistenceAPI() + `LiquimartProductCategory/list`;

	static apiStoreReviews = () => APIService.routePersistenceAPI() + `LiquimartProductReview/list`;
	static apiWebPageContents = () => APIService.routePersistenceAPI() + `WebPageContent/list`;

	static apiGetPartnerList = () => APIService.routePersistenceAPI() + 'KlubCoinPartner';
	static apiGetPartnerIcon = iconPath => APIService.routeMeveoAPI() + iconPath;
	static apiCheckUniqueField = () => APIService.routeMeveoAPI() + '/rest/validateField';
	static apiSendEmailOTP = email => `${APIService.routeMeveoAPI()}/rest/emailOtp/${email}`;
	static apiVerifyEmailOTP = email => `${APIService.routeMeveoAPI()}/rest/verifyOtp/${email}`;

	static apiGooglePlaceSearch = `https://maps.googleapis.com/maps/api/place/textsearch/json?query=%%query%%&key=${
		config.googleApi.key
	}`;
	static apiFAQs = () => APIService.routePersistenceAPI() + 'FrequentlyAskedQuestion';

	static announcePeerOnlineStatus(peerId, callback) {
		const data = {
			peer_id: peerId,
			info_hash: '843D620DC0F14CEA05BC72120CC2CDC8A8929B93',
			port: 0,
			wallet_id: peerId
		};
		WebService.sendGet(this.apiPeerAnnounce(), data, callback);
	}

	static announceInfoHash(hash, peerId, quantity, coord, callback) {
		const data = {
			peer_id: peerId,
			info_hash: hash,
			port: 0,
			uploaded: quantity,
			wallet_id: peerId,
			latitude: coord.latitude,
			longitude: coord.longitude
		};
		WebService.sendGet(this.apiPeerAnnounce(), data, callback);
	}

	static getTransactionHistory(address, callback) {
		const data = {
			module: 'account',
			action: 'balancehistory',
			address,
			tag: 'latest',
			apikey: APIService.API_KEY
		};
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
			sig: signature
		};
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
			uuid,
			category,
			title,
			content
		};

		const data = {
			basicAuth,
			headers: {
				'Persistence-Mode': 'list'
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
			toDate: moment(toDate).format(dateFormatMeveo)
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
				'Persistence-Mode': 'list'
			},
			rawBody: [entity]
		};
		WebService.sendPostDirect(url, data, callback);
	}

	static getMarketCategories(callback) {
		const data = { basicAuth };
		WebService.sendPostDirect(this.apiMarketCategories(), data, callback);
	}

	static searchPlaces(text, type, callback) {
		WebService.sendGetDirect(
			this.apiGooglePlaceSearch.replace('%%query%%', encodeURIComponent(text)) + (type ? `&type=${type}` : ''),
			null,
			callback
		);
	}

	static createReview(
		{ purchaseDate, sellerWalletAddress, buyerWalletAddress, productCode, rating, comments },
		callback
	) {
		const formattedSellerAddress = sellerWalletAddress.replace('0x', '');
		const formattedBuyerAddress = buyerWalletAddress.replace('0x', '');

		const entity = {
			reviewDate: moment().format(dateFormatMeveo),
			cetCode: 'LiquimartProductReview',
			purchaseDate: purchaseDate.format(dateFormatMeveo),
			sellerWalletAddress: formattedSellerAddress,
			buyerWalletAddress: formattedBuyerAddress,
			productCode,
			rating,
			comments
		};
		APIService.postPersistence(this.routePersistenceAPI(), entity, callback);
	}

	static getStoreReviews(callback) {
		const data = { basicAuth };
		WebService.sendPostDirect(this.apiStoreReviews(), data, callback);
	}

	static getPartnerList(callback) {
		const data = { basicAuth };
		WebService.sendGetDirect(this.apiGetPartnerList(), data, callback);
	}

	static getFAQs(callback) {
		const data = { basicAuth };
		WebService.sendGetDirect(this.apiFAQs(), data, callback);
	}

	static getWelcomeContent(callback) {
		const data = {
			basicAuth,
			firstRow: 0,
			numberOfRows: 1,
			filters: { code: 'welcome' }
		};
		WebService.sendPostDirect(this.apiWebPageContents(), data, callback);
	}

	static getOnboardingContent(callback) {
		const data = {
			basicAuth,
			firstRow: 0,
			filters: { code: ['onboarding-1', 'onboarding-2', 'onboarding-3'] }
		};
		WebService.sendPostDirect(this.apiWebPageContents(), data, callback);
	}

	static checkUniqueField(field, value, callback) {
		const data = {
			basicAuth,
			field,
			value
		};
		WebService.sendGetDirect(this.apiCheckUniqueField(), data, callback);
	}

	static checkUniqueFieldInWallet(field, value, walletId, callback) {
		const data = {
			basicAuth,
			field,
			value,
			walletId
		};
		WebService.sendGetDirect(this.apiCheckUniqueField(), data, callback);
	}

	static sendEmailOTP(email, callback) {
		const data = {
			basicAuth: adminAuth
		};
		WebService.sendGetDirect(this.apiSendEmailOTP(email), data, callback);
	}

	static verifyEmailOTP(email, otp, callback) {
		const data = {
			basicAuth: adminAuth,
			otp
		};
		WebService.sendPostDirect(this.apiVerifyEmailOTP(email), data, callback);
	}
}
