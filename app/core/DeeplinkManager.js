'use strict';

import URL from 'url-parse';
import qs from 'qs';
import { InteractionManager, Alert } from 'react-native';
import { parse } from 'eth-url-parser';
import WalletConnect from '../core/WalletConnect';
import AppConstants from './AppConstants';
import Engine from './Engine';
import { generateApproveData } from '../util/transactions';
import { strings } from '../../locales/i18n';
import { getNetworkTypeById } from '../util/networks';
import { WalletDevice } from '@metamask/controllers/';
import moment from 'moment';
import { showTipperModal } from '../actions/modals';
import { store } from '../store';
import { refStoreService } from '../components/Views/MarketPlace/store/StoreService';

class DeeplinkManager {
	constructor(_navigation) {
		this.navigation = _navigation;
		this.pendingDeeplink = null;
	}

	setDeeplink = url => (this.pendingDeeplink = url);

	getPendingDeeplink = () => this.pendingDeeplink;

	expireDeeplink = () => (this.pendingDeeplink = null);

	async handleEthereumUrl(url, origin) {
		let ethUrl = '';
		try {
			ethUrl = parse(url);
		} catch (e) {
			Alert.alert(strings('deeplink.invalid'), e.toString());
			return;
		}

		const functionName = ethUrl.function_name;
		if (!functionName) {
			const txMeta = { ...ethUrl, source: url };
			if (ethUrl.parameters?.value) {
				this.navigation.navigate('SendView', {
					txMeta: { ...txMeta, action: 'send-eth' }
				});
			} else {
				this.navigation.navigate('SendFlowView', { txMeta });
			}
		} else if (functionName === 'transfer') {
			const txMeta = { ...ethUrl, source: url };
			this.navigation.navigate('SendView', {
				txMeta: { ...txMeta, action: 'send-token' }
			});
		} else if (functionName === 'approve') {
			// add approve transaction
			const {
				parameters: { address, uint256 },
				target_address,
				chain_id
			} = ethUrl;
			const { TransactionController, PreferencesController, NetworkController } = Engine.context;
			if (chain_id) {
				const newNetworkType = getNetworkTypeById(chain_id);
				NetworkController.setProviderType(newNetworkType);
			}
			const txParams = {};
			txParams.to = `${target_address}`;
			txParams.from = `${PreferencesController.state.selectedAddress}`;
			txParams.value = '0x0';
			const uint256Number = Number(uint256);
			if (Number.isNaN(uint256Number)) throw new Error('The parameter uint256 should be a number');
			if (!Number.isInteger(uint256Number)) throw new Error('The parameter uint256 should be an integer');
			const value = uint256Number.toString(16);
			txParams.data = generateApproveData({ spender: address, value });
			TransactionController.addTransaction(txParams, origin, WalletDevice.MM_MOBILE);
		}
	}

	handleBrowserUrl(url, callback) {
		this.navigation.navigate('BrowserTabHome');
		InteractionManager.runAfterInteractions(() => {
			if (callback) {
				callback(url);
			} else {
				this.navigation.navigate('BrowserView', {
					newTabUrl: url
				});
			}
		});
	}

	handleNavigateTip(data) {
		this.navigation.navigate('TipperAmount', data);
	}

	parse(url, { browserCallBack, origin, onHandled }) {
		const urlObj = new URL(url);
		let params;

		if (urlObj.query.length) {
			try {
				params = qs.parse(urlObj.query.substring(1));
			} catch (e) {
				Alert.alert(strings('deeplink.invalid'), e.toString());
			}
		}

		const handled = () => onHandled?.();

		const { MM_UNIVERSAL_LINK_HOST } = AppConstants;
		switch (urlObj.protocol.replace(':', '')) {
			case 'http':
			case 'https':
				// Universal links
				handled();
				if (urlObj.hostname === MM_UNIVERSAL_LINK_HOST) {
					// action is the first parth of the pathname
					const action = urlObj.pathname.split('/')[1];

					switch (action) {
						case 'wc':
							params && params.uri && WalletConnect.newSession(params.uri, params.redirectUrl, false);
							break;
						case 'dapp':
							this.handleBrowserUrl(
								urlObj.href.replace(`https://${MM_UNIVERSAL_LINK_HOST}/dapp/`, 'https://'),
								browserCallBack
							);
							break;
						case 'send':
							this.handleEthereumUrl(
								urlObj.href.replace(`https://${MM_UNIVERSAL_LINK_HOST}/send/`, 'ethereum:'),
								origin
							);
							break;
						case 'approve':
							this.handleEthereumUrl(
								urlObj.href.replace(`https://${MM_UNIVERSAL_LINK_HOST}/approve/`, 'ethereum:'),
								origin
							);
							break;
						case 'payment':
						case 'focus':
						case '':
							break;
						case 'tip':
							const receiverAddress = urlObj.pathname.split('/')[2];
							const value = params['value'];
							const symbol = params['symbol'];
							const isETH = params['isETH'];
							const decimals = params['decimals'];
							const tipData = {
								receiverAddress,
								value,
								symbol,
								isETH,
								decimals
							};

							store.dispatch(showTipperModal(tipData));
							break;
						case 'product':
							this.handleProductLink(urlObj.pathname);
							break;
						default:
							Alert.alert(strings('deeplink.not_supported'));
					}
				} else {
					// Normal links (same as dapp)

					handled();
					urlObj.set('protocol', 'https:');
					this.handleBrowserUrl(urlObj.href, browserCallBack);
				}
				break;

			// walletconnect related deeplinks
			// address, transactions, etc
			case 'wc':
				handled();
				if (!WalletConnect.isValidUri(url)) return;
				// eslint-disable-next-line no-case-declarations
				const redirect = params && params.redirect;
				// eslint-disable-next-line no-case-declarations
				const autosign = params && params.autosign;
				WalletConnect.newSession(url, redirect, autosign);
				break;
			case 'ethereum':
				handled();
				this.handleEthereumUrl(url, origin);
				break;
			case 'klubcoin':
				handled();
				switch (urlObj.hostname) {
					case 'wc':
						params && params.uri && WalletConnect.newSession(params.uri, params.redirectUrl, false);
						break;
					case 'dapp':
						this.handleBrowserUrl(
							urlObj.href.replace(`https://${MM_UNIVERSAL_LINK_HOST}/dapp/`, 'https://'),
							browserCallBack
						);
						break;
					case 'send':
						this.handleEthereumUrl(urlObj.href.replace('klubcoin://send/', 'ethereum:'), origin);
						break;
					case 'approve':
						this.handleEthereumUrl(urlObj.href.replace('klubcoin://approve/', 'ethereum:'), origin);
						break;
					case 'payment':
					case 'focus':
					case '':
						break;
					case 'tip':
						const receiverAddress = urlObj.pathname.split('/')[1];
						const value = params['value'];
						const symbol = params['symbol'];
						const isETH = params['isETH'];
						const decimals = params['decimals'];
						const tipData = {
							receiverAddress,
							value,
							symbol,
							isETH,
							decimals
						};

						store.dispatch(showTipperModal(tipData));
						break;
					case 'product':
						this.handleProductLink(urlObj.pathname);
						break;
					default:
						Alert.alert(strings('deeplink.not_supported'));
				}
				// handled();
				// this.handleEthereumUrl(url.replace(`klubcoin://send/`, 'ethereum:'), origin);
				break;
			// Specific to the browser screen
			// For ex. navigate to a specific dapp
			case 'dapp':
				// Enforce https
				handled();
				urlObj.set('protocol', 'https:');
				this.handleBrowserUrl(urlObj.href, browserCallBack);
				break;

			// Specific to the MetaMask app
			// For ex. go to settings
			case 'metamask':
				handled();
				if (urlObj.origin === 'metamask://wc') {
					const cleanUrlObj = new URL(urlObj.query.replace('?uri=', ''));
					const href = cleanUrlObj.href;
					if (!WalletConnect.isValidUri(href)) return;
					const redirect = params && params.redirect;
					const autosign = params && params.autosign;
					WalletConnect.newSession(href, redirect, autosign);
				}
				break;
			case 'liquichain':
				if (url.includes('://namecard') && params['q']) {
					this.navigation.navigate('Contacts', { data: params['q'], key: moment().unix() });
				}
				break;
			default:
				return false;
		}

		return true;
	}

	handleProductLink = async path => {
		const parts = path.split('/');
		const vendorAddr = parts[2];
		const productId = parts[3];
		const chatGroup = parts.length >= 5 ? parts[4] : '';

		const storeService = refStoreService();
		if (!storeService) {
			setTimeout(() => this.handleProductLink(path), 1000);
			return;
		}
		storeService.addListener(message => {
			if (message && message.uuid && message.data != 1) {
				const { uuid, data } = message;
				if (productId == uuid) {
					const product = { ...data };
					this.navigation.navigate('MarketProduct', { product, group: chatGroup });
				}
			}
		});
		storeService.fetchProduct(productId, vendorAddr);
	};
}

let instance = null;

const SharedDeeplinkManager = {
	init: navigation => {
		instance = new DeeplinkManager(navigation);
	},
	parse: (url, args) => instance.parse(url, args),
	setDeeplink: url => instance.setDeeplink(url),
	getPendingDeeplink: () => instance.getPendingDeeplink(),
	expireDeeplink: () => instance.expireDeeplink()
};

export default SharedDeeplinkManager;
