import React, { PureComponent } from 'react';
import { TouchableOpacity, View, Image, StyleSheet, Text, ScrollView, InteractionManager } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import Share from 'react-native-share';
import Icon from 'react-native-vector-icons/FontAwesome';
import FeatherIcon from 'react-native-vector-icons/Feather';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import { colors, fontStyles } from '../../../styles/brand';
import { hasBlockExplorer, findBlockExplorerForRpc, getBlockExplorerName, isMainNet } from '../../../util/networks';
import Identicon from '../Identicon';
import StyledButton from '../StyledButton';
import AccountList from '../AccountList';
import NetworkList from '../NetworkList';
import { strings } from '../../../../locales/i18n';
import { DrawerActions } from 'react-navigation-drawer';
import Modal from 'react-native-modal';
import SecureKeychain from '../../../core/SecureKeychain';
import {
	toggleNetworkModal,
	toggleAccountsModal,
	toggleReceiveModal,
	toggleConfirmLogoutModal
} from '../../../actions/modals';
import { showAlert } from '../../../actions/alert';
import { getEtherscanAddressUrl, getEtherscanBaseUrl } from '../../../util/etherscan';
import Engine from '../../../core/Engine';
import Logger from '../../../util/Logger';
import Device from '../../../util/Device';
import OnboardingWizard from '../OnboardingWizard';
import ReceiveRequest from '../ReceiveRequest';
import Analytics from '../../../core/Analytics';
import AppConstants from '../../../core/AppConstants';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import URL from 'url-parse';
import EthereumAddress from '../EthereumAddress';
import { getEther } from '../../../util/transactions';
import { newAssetTransaction } from '../../../actions/transaction';
import { protectWalletModalVisible } from '../../../actions/user';
import DeeplinkManager from '../../../core/DeeplinkManager';
import SettingsNotification from '../SettingsNotification';
import WhatsNewModal from '../WhatsNewModal';
import InvalidCustomNetworkAlert from '../InvalidCustomNetworkAlert';
import { RPC } from '../../../constants/network';
import { findBottomTabRouteNameFromNavigatorState, findRouteNameFromNavigatorState } from '../../../util/general';
import { ANALYTICS_EVENTS_V2 } from '../../../util/analyticsV2';
import Colors from 'common/colors';
import Helper from 'common/Helper';
import Routes from '../../../common/routes';
import ConfirmLogout from '../ConfirmLogout';
import ConfirmInputModal from '../ConfirmInputModal';
import CryptoSignature from '../../../core/CryptoSignature';
import API from '../../../services/api';
import preferences from '../../../store/preferences';
import RemoteImage from '../../Base/RemoteImage';
import { styles } from './styles/index';
import { brandStyles } from './styles/brand';

const metamask_name = require('../../../images/metamask-name.png'); // eslint-disable-line
const metamask_fox = require('../../../images/fox.png'); // eslint-disable-line
const ICON_IMAGES = {
	wallet: require('../../../images/wallet-icon.png'),
	'selected-wallet': require('../../../images/selected-wallet-icon.png')
};

/**
 * View component that displays the MetaMask fox
 * in the middle of the screen
 */
class DrawerView extends PureComponent {
	static propTypes = {
		/**
		/* navigation object required to push new views
		*/
		navigation: PropTypes.object,
		/**
		 * Object representing the selected the selected network
		 */
		network: PropTypes.object.isRequired,
		/**
		 * Selected address as string
		 */
		selectedAddress: PropTypes.string,
		/**
		 * List of accounts from the AccountTrackerController
		 */
		accounts: PropTypes.object,
		/**
		 * List of accounts from the PreferencesController
		 */
		identities: PropTypes.object,
		/**
		/* Selected currency
		*/
		currentCurrency: PropTypes.string,
		/**
		 * List of keyrings
		 */
		keyrings: PropTypes.array,
		/**
		 * Action that toggles the network modal
		 */
		toggleNetworkModal: PropTypes.func,
		/**
		 * Action that toggles the accounts modal
		 */
		toggleAccountsModal: PropTypes.func,
		/**
		 * Action that toggles the receive modal
		 */
		toggleReceiveModal: PropTypes.func,
		/**
		 * Action that shows the global alert
		 */
		showAlert: PropTypes.func.isRequired,
		/**
		 * Boolean that determines the status of the networks modal
		 */
		networkModalVisible: PropTypes.bool.isRequired,
		/**
		 * Boolean that determines the status of the receive modal
		 */
		receiveModalVisible: PropTypes.bool.isRequired,
		/**
		 * Boolean that determines the status of the logout modal
		 */
		confirmLogoutModalVisible: PropTypes.bool.isRequired,
		/**
		 * Action that toggles the logout modal
		 */
		toggleConfirmLogoutModal: PropTypes.func,
		/**
		 * Start transaction with asset
		 */
		newAssetTransaction: PropTypes.func.isRequired,
		/**
		 * Boolean that determines the status of the networks modal
		 */
		accountsModalVisible: PropTypes.bool.isRequired,
		/**
		 * Boolean that determines if the user has set a password before
		 */
		passwordSet: PropTypes.bool,
		/**
		 * Boolean that determines if the user has set a keycloak authentication
		 */
		keycloakAuth: PropTypes.bool,
		/**
		 * Wizard onboarding state
		 */
		wizard: PropTypes.object,
		/**
		 * Chain Id
		 */
		chainId: PropTypes.string,
		/**
		 * Current provider ticker
		 */
		ticker: PropTypes.string,
		/**
		 * Frequent RPC list from PreferencesController
		 */
		frequentRpcList: PropTypes.array,
		/**
		 * Array of ERC20 assets
		 */
		tokens: PropTypes.array,
		/**
		 * Array of ERC721 assets
		 */
		collectibles: PropTypes.array,
		/**
		 * redux flag that indicates if the user
		 * completed the seed phrase backup flow
		 */
		seedphraseBackedUp: PropTypes.bool,
		/**
		 * An object containing token balances for current account and network in the format address => balance
		 */
		tokenBalances: PropTypes.object,
		/**
		 * Prompts protect wallet modal
		 */
		protectWalletModalVisible: PropTypes.func
	};

	state = {
		showProtectWalletModal: undefined
	};

	browserSectionRef = React.createRef();

	currentBalance = null;
	previousBalance = null;
	processedNewBalance = false;
	animatingNetworksModal = false;
	animatingAccountsModal = false;

	isCurrentAccountImported() {
		let ret = false;
		const { keyrings, selectedAddress } = this.props;
		const allKeyrings = keyrings && keyrings.length ? keyrings : Engine.context.KeyringController.state.keyrings;
		for (const keyring of allKeyrings) {
			if (keyring.accounts.includes(selectedAddress)) {
				ret = keyring.type !== 'HD Key Tree';
				break;
			}
		}

		return ret;
	}

	componentDidUpdate() {
		const route = findRouteNameFromNavigatorState(this.props.navigation.state);
		if (!this.props.passwordSet || !this.props.seedphraseBackedUp) {
			const bottomTab = findBottomTabRouteNameFromNavigatorState(this.props.navigation.state);
			if (['SetPasswordFlow', 'Webview', 'LockScreen'].includes(bottomTab)) {
				// eslint-disable-next-line react/no-did-update-set-state
				this.state.showProtectWalletModal && this.setState({ showProtectWalletModal: false });
				return;
			}
			let tokenFound = false;

			this.props.tokens.forEach(token => {
				if (
					token &&
					token.address &&
					this.props.tokenBalances[token.address] &&
					this.props.tokenBalances[token.address]?.isZero &&
					!this.props.tokenBalances[token.address]?.isZero()
				) {
					tokenFound = true;
				}
			});
			if (
				!this.props.passwordSet ||
				this.currentBalance > 0 ||
				tokenFound ||
				this.props.collectibles.length > 0
			) {
				// eslint-disable-next-line react/no-did-update-set-state
				this.setState({ showProtectWalletModal: true });
			} else {
				// eslint-disable-next-line react/no-did-update-set-state
				this.setState({ showProtectWalletModal: false });
			}
		} else {
			// eslint-disable-next-line react/no-did-update-set-state
			this.setState({ showProtectWalletModal: false });
		}
		const pendingDeeplink = DeeplinkManager.getPendingDeeplink();
		const { KeyringController } = Engine.context;
		if (pendingDeeplink && KeyringController.isUnlocked() && route !== 'LockScreen') {
			DeeplinkManager.expireDeeplink();
			DeeplinkManager.parse(pendingDeeplink, { origin: AppConstants.DEEPLINKS.ORIGIN_DEEPLINK });
		}
	}

	toggleAccountsModal = () => {
		if (!this.animatingAccountsModal) {
			this.animatingAccountsModal = true;
			this.props.toggleAccountsModal();
			setTimeout(() => {
				this.animatingAccountsModal = false;
			}, 500);
		}
		!this.props.accountsModalVisible && this.trackEvent(ANALYTICS_EVENT_OPTS.NAVIGATION_TAPS_ACCOUNT_NAME);
	};

	toggleEditWalletName = () => {
		this.setState({ editWalletNameVisible: !this.state.editWalletNameVisible });
	};

	saveWalletName = async name => {
		const { selectedAddress } = this.props;
		const { PreferencesController } = Engine.context;

		const address = selectedAddress;
		const message = `"${name}","${address}"`;
		const signature = await CryptoSignature.signMessage(address, message);

		API.postRequest(
			Routes.walletUpdate,
			[name, address, signature],
			response => {
				if (response.error) {
					alert(`${response.error.message}`);
				} else {
					PreferencesController.setAccountLabel(selectedAddress, name);
				}
			},
			error => {
				alert(`${error.toString()}`);
			}
		);
	};

	toggleReceiveModal = () => {
		this.props.toggleReceiveModal();
	};

	toggleLogoutModal = () => {
		this.props.toggleConfirmLogoutModal();
	};

	onNetworksModalClose = async manualClose => {
		this.toggleNetworksModal();
		if (!manualClose) {
			await this.hideDrawer();
		}
	};

	toggleNetworksModal = () => {
		if (!this.animatingNetworksModal) {
			this.animatingNetworksModal = true;
			this.props.toggleNetworkModal();
			setTimeout(() => {
				this.animatingNetworksModal = false;
			}, 500);
		}
	};

	showReceiveModal = () => {
		this.toggleReceiveModal();
	};

	trackEvent = event => {
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEvent(event);
		});
	};

	onReceive = () => {
		this.toggleReceiveModal();
		this.trackEvent(ANALYTICS_EVENT_OPTS.NAVIGATION_TAPS_RECEIVE);
	};

	onSend = async () => {
		this.props.newAssetTransaction(getEther(this.props.ticker));
		this.props.navigation.navigate('SendFlowView');
		this.hideDrawer();
		this.trackEvent(ANALYTICS_EVENT_OPTS.NAVIGATION_TAPS_SEND);
	};

	goToBrowser = () => {
		this.props.navigation.navigate('BrowserTabHome');
		this.hideDrawer();
		this.trackEvent(ANALYTICS_EVENT_OPTS.NAVIGATION_TAPS_BROWSER);
	};

	showWallet = () => {
		this.props.navigation.navigate('WalletTabHome');
		this.hideDrawer();
		this.trackEvent(ANALYTICS_EVENTS_V2.WALLET_OPENED);
	};

	goToProfile = () => {
		this.props.navigation.navigate('Profile');
		this.hideDrawer();
	};

	goToTransactionHistory = () => {
		this.props.navigation.navigate('TransactionsHome');
		this.hideDrawer();
		this.trackEvent(ANALYTICS_EVENT_OPTS.NAVIGATION_TAPS_TRANSACTION_HISTORY);
	};

	gotoNotifications = () => {
		this.props.navigation.navigate('Notifications');
		this.hideDrawer();
	};

	gotoContacts = () => {
		this.props.navigation.navigate('Contacts');
		this.hideDrawer();
		this.trackEvent(ANALYTICS_EVENT_OPTS.NAVIGATION_TAPS_CONTACTS);
	};

	showSettings = async () => {
		this.props.navigation.navigate('SettingsView');
		this.hideDrawer();
		this.trackEvent(ANALYTICS_EVENT_OPTS.NAVIGATION_TAPS_SETTINGS);
	};

	onLogout = async () => {
		const { passwordSet, keycloakAuth } = this.props;
		const { KeyringController } = Engine.context;
		await SecureKeychain.resetGenericPassword();
		await KeyringController.setLocked();
		if (!passwordSet && !keycloakAuth) {
			this.props.navigation.navigate('Onboarding');
		} else {
			this.props.navigation.navigate('Login');
		}
	};

	logout = () => {
		this.toggleLogoutModal();
		this.trackEvent(ANALYTICS_EVENT_OPTS.NAVIGATION_TAPS_LOGOUT);
	};

	viewInEtherscan = () => {
		const {
			selectedAddress,
			network,
			network: {
				provider: { rpcTarget }
			},
			frequentRpcList
		} = this.props;
		const url = getEtherscanAddressUrl(network.provider.type, selectedAddress);
		const etherscan_url = getEtherscanBaseUrl(network.provider.type).replace('https://', '');
		this.goToBrowserUrl(Routes.mainNetWork.accountUrl, 'Liquichain');
		this.trackEvent(ANALYTICS_EVENT_OPTS.NAVIGATION_TAPS_VIEW_ETHERSCAN);
	};

	submitFeedback = () => {
		this.trackEvent(ANALYTICS_EVENT_OPTS.NAVIGATION_TAPS_SEND_FEEDBACK);
		this.goToBrowserUrl(Routes.mainNetWork.helpSupportUrl, 'Liquichain Support');
	};

	showHelp = () => {
		this.goToBrowserUrl(Routes.mainNetWork.helpSupportUrl, 'Liquichain Support');
		this.trackEvent(ANALYTICS_EVENT_OPTS.NAVIGATION_TAPS_GET_HELP);
	};

	goToBrowserUrl(url, title) {
		this.props.navigation.navigate('Webview', {
			url,
			title
		});
		this.hideDrawer();
	}

	hideDrawer() {
		return new Promise(resolve => {
			this.props.navigation.dispatch(DrawerActions.closeDrawer());
			setTimeout(() => {
				resolve();
			}, 300);
		});
	}

	onAccountChange = () => {
		setTimeout(() => {
			this.toggleAccountsModal();
			this.hideDrawer();
		}, 300);
	};

	onImportAccount = () => {
		this.toggleAccountsModal();
		this.props.navigation.navigate('ImportPrivateKey');
		this.hideDrawer();
	};

	hasBlockExplorer = providerType => {
		const { frequentRpcList } = this.props;
		if (providerType === RPC) {
			const {
				network: {
					provider: { rpcTarget }
				}
			} = this.props;
			const blockExplorer = findBlockExplorerForRpc(rpcTarget, frequentRpcList);
			if (blockExplorer) {
				return true;
			}
		}
		return hasBlockExplorer(providerType);
	};

	getIcon(name, size, color = null) {
		return <Icon name={name} size={size || 24} color={color ? color : colors.blue} />;
	}

	getFeatherIcon(name, size) {
		return <FeatherIcon name={name} size={size || 24} color={colors.blue} />;
	}

	getAntDesignIcon(name, size) {
		return <AntDesignIcon name={name} size={size || 24} color={colors.blue} />;
	}

	getMaterialIcon(name, size) {
		return <MaterialIcon name={name} size={size || 24} color={colors.blue} />;
	}

	getImageIcon(name) {
		return <Image source={ICON_IMAGES[name]} style={styles.menuItemIconImage} />;
	}

	getSelectedIcon(name, size) {
		return <Icon name={name} size={size || 24} color={colors.blue} />;
	}

	getSelectedFeatherIcon(name, size) {
		return <FeatherIcon name={name} size={size || 24} color={colors.blue} />;
	}

	getSelectedMaterialIcon(name, size) {
		return <MaterialIcon name={name} size={size || 24} color={colors.blue} />;
	}

	getSelectedImageIcon(name) {
		return <Image source={ICON_IMAGES[`selected-${name}`]} style={styles.menuItemIconImage} />;
	}

	getSections = () => {
		const {
			network: {
				provider: { type, rpcTarget }
			},
			frequentRpcList
		} = this.props;
		let blockExplorer, blockExplorerName;
		if (type === RPC) {
			blockExplorer = findBlockExplorerForRpc(rpcTarget, frequentRpcList);
			blockExplorerName = getBlockExplorerName(blockExplorer);
		}
		return [
			[
				// {
				// 	name: strings('drawer.browser'),
				// 	icon: this.getIcon('globe'),
				// 	selectedIcon: this.getSelectedIcon('globe'),
				// 	action: this.goToBrowser,
				// 	routeNames: ['BrowserView', 'AddBookmark']
				// },
				{
					name: strings('drawer.wallet'),
					icon: this.getImageIcon('wallet'),
					selectedIcon: this.getSelectedImageIcon('wallet'),
					action: this.showWallet,
					routeNames: ['WalletView', 'Asset', 'AddAsset', 'Collectible']
				},
				{
					name: strings('drawer.profile'),
					icon: this.getMaterialIcon('account-circle'),
					selectedIcon: this.getMaterialIcon('account-circle'),
					action: this.goToProfile,
					routeNames: ['Profile']
				},
				{
					name: strings('drawer.transaction_history'),
					icon: this.getIcon('list'),
					selectedIcon: this.getIcon('list'),
					action: this.goToTransactionHistory,
					routeNames: ['TransactionsView']
				}
			],
			[
				{
					name: strings('drawer.contacts'),
					icon: this.getAntDesignIcon('contacts'),
					selectedIcon: this.getAntDesignIcon('contacts'),
					action: this.gotoContacts,
					routeNames: ['Contacts']
				},
				{
					name: strings('drawer.notifications'),
					icon: this.getFeatherIcon('bell'),
					selectedIcon: this.getFeatherIcon('bell'),
					action: this.gotoNotifications,
					key: 'notifications',
					routeNames: ['Notifications']
				}
			],
			[
				{
					name: strings('drawer.share_address'),
					icon: this.getIcon('share'),
					action: this.onShare
				},
				{
					name:
						(blockExplorer && `${strings('drawer.view_in')} ${blockExplorerName}`) ||
						strings('drawer.view_in_liquichain'),
					icon: this.getIcon('eye'),
					action: this.viewInEtherscan
				}
			],
			[
				{
					name: strings('drawer.settings'),
					icon: this.getIcon('cog'),
					warning: strings('drawer.settings_warning_short'),
					action: this.showSettings
				},
				{
					name: strings('drawer.help'),
					icon: this.getIcon('help'),
					action: this.showHelp
				},
				// {
				// 	name: strings('drawer.request_feature'),
				// 	icon: this.getFeatherIcon('message-square'),
				// 	action: this.submitFeedback
				// },
				{
					name: strings('drawer.logout'),
					icon: this.getIcon('sign-out'),
					action: this.logout
				}
			]
		];
	};

	copyAccountToClipboard = async () => {
		const { selectedAddress } = this.props;
		await Clipboard.setString(selectedAddress);
		this.toggleReceiveModal();
		InteractionManager.runAfterInteractions(() => {
			this.props.showAlert({
				isVisible: true,
				autodismiss: 1500,
				content: 'clipboard-alert',
				data: { msg: strings('account_details.account_copied_to_clipboard') }
			});
		});
	};

	onShare = () => {
		const { selectedAddress } = this.props;
		Share.open({
			message: selectedAddress
		})
			.then(() => {
				this.props.protectWalletModalVisible();
			})
			.catch(err => {
				Logger.log('Error while trying to share address', err);
			});
		this.trackEvent(ANALYTICS_EVENT_OPTS.NAVIGATION_TAPS_SHARE_PUBLIC_ADDRESS);
	};

	closeInvalidCustomNetworkAlert = () => {
		this.setState({ invalidCustomNetwork: null });
	};

	showInvalidCustomNetworkAlert = network => {
		InteractionManager.runAfterInteractions(() => {
			this.setState({ invalidCustomNetwork: network });
		});
	};

	/**
	 * Return step 5 of onboarding wizard if that is the current step
	 */
	renderOnboardingWizard = () => {
		const {
			wizard: { step }
		} = this.props;
		return (
			step === 5 && <OnboardingWizard navigation={this.props.navigation} coachmarkRef={this.browserSectionRef} />
		);
	};

	onSecureWalletModalAction = () => {
		this.setState({ showProtectWalletModal: false });
		this.props.navigation.navigate(this.props.passwordSet ? 'AccountBackupStep1' : 'SetPasswordFlow');
	};

	renderProtectModal = () => (
		<Modal
			isVisible={this.state.showProtectWalletModal}
			animationIn="slideInUp"
			animationOut="slideOutDown"
			style={styles.bottomModal}
			backdropOpacity={0.7}
			animationInTiming={600}
			animationOutTiming={600}
		>
			<View style={styles.protectWalletContainer}>
				<View style={styles.protectWalletIconContainer}>
					<FeatherIcon style={styles.protectWalletIcon} name="alert-triangle" size={20} />
				</View>
				<Text style={styles.protectWalletTitle}>{strings('protect_your_wallet_modal.title')}</Text>
				<Text style={styles.protectWalletContent}>
					{!this.props.passwordSet
						? strings('protect_your_wallet_modal.body_for_password')
						: strings('protect_your_wallet_modal.body_for_seedphrase')}
				</Text>
				<View style={styles.protectWalletButtonWrapper}>
					<StyledButton type={'confirm'} onPress={this.onSecureWalletModalAction}>
						{strings('protect_your_wallet_modal.button')}
					</StyledButton>
				</View>
			</View>
		</Modal>
	);

	render() {
		const {
			network,
			accounts,
			identities,
			selectedAddress,
			keyrings,
			currentCurrency,
			chainId,
			ticker,
			seedphraseBackedUp,
			onboardProfile
		} = this.props;

		const { avatar } = onboardProfile || {};
		const unreadNotif = preferences?.notifications.filter(e => !e.read).length > 0;
		const { invalidCustomNetwork, showProtectWalletModal, editWalletNameVisible } = this.state;
		let account, balance, conversion;
		if (accounts && accounts[selectedAddress]) {
			account = { address: selectedAddress, ...identities[selectedAddress], ...accounts[selectedAddress] };
			balance =
				typeof accounts[selectedAddress].balance != 'undefined' ? accounts[selectedAddress].balance : '0x00';
			conversion =
				typeof accounts[selectedAddress].conversion != 'undefined'
					? accounts[selectedAddress].conversion
					: null;
		}
		const currentRoute = findRouteNameFromNavigatorState(this.props.navigation.state);
		return (
			<View style={[styles.wrapper, brandStyles.wrapper]} testID={'drawer-screen'}>
				<ScrollView>
					<View style={styles.header}>
						<View style={styles.metamaskLogo}>
							{/*<Image source={metamask_fox} style={styles.metamaskFox} resizeMethod={'auto'} />
														<Image source={metamask_name} style={styles.metamaskName} resizeMethod={'auto'} />*/}
							<View
								style={{
									marginTop: 10,
									flexDirection: 'row',
									alignItems: 'center'
								}}
							>
								<Image
									source={require('../../../images/klubcoin_horizontal_logo.png')}
									style={{
										width: 150,
										marginBottom: 10
									}}
									resizeMode={'contain'}
								/>
								{/* <Text
									style={{
										fontSize: 20,
										color: '#370e75',
										fontWeight: 'bold'
									}}
								>
									LIQUICHAIN
								</Text> */}
							</View>
						</View>
					</View>
					<View style={styles.account}>
						<View style={styles.accountBgOverlay}>
							<TouchableOpacity
								style={styles.identiconWrapper}
								onPress={this.toggleEditWalletName}
								testID={'navbar-account-identicon'}
							>
								<View style={[styles.identiconBorder, brandStyles.identiconBorder]}>
									{!!avatar ? (
										<RemoteImage source={{ uri: `file://${avatar}` }} style={styles.avatar} />
									) : (
										<Identicon diameter={48} address={selectedAddress} />
									)}
								</View>
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.accountInfo}
								onPress={this.toggleAccountsModal}
								testID={'navbar-account-button'}
							>
								<View style={styles.accountNameWrapper}>
									{account && (
										<Text style={[styles.accountName, brandStyles.accountName]} numberOfLines={1}>
											{account.name}
										</Text>
									)}
									<Icon
										name="caret-down"
										size={24}
										style={[styles.caretDown, brandStyles.caretDown]}
									/>
								</View>
								{isMainNet(chainId) && (
									<Text style={styles.accountBalance}>
										{Helper.convertToEur(balance, conversion)}
									</Text>
								)}

								{account && (
									<EthereumAddress
										address={account.address}
										style={[styles.accountAddress, brandStyles.accountAddress]}
										type={'short'}
									/>
								)}
								{this.isCurrentAccountImported() && (
									<View style={styles.importedWrapper}>
										<Text numberOfLines={1} style={styles.importedText}>
											{strings('accounts.imported')}
										</Text>
									</View>
								)}
							</TouchableOpacity>
						</View>
					</View>
					<View style={styles.buttons}>
						<StyledButton
							type={'rounded-normal'}
							onPress={this.onSend}
							containerStyle={[styles.button, styles.leftButton]}
							testID={'drawer-send-button'}
						>
							<View style={styles.buttonContent}>
								{/* {this.getIcon('paper-plane', 16, Colors.primary)} */}
								<Text style={[styles.buttonText, brandStyles.buttonText]}>
									{strings('drawer.send_button')}
								</Text>
							</View>
						</StyledButton>
						<StyledButton
							type={'rounded-normal'}
							onPress={this.onReceive}
							containerStyle={[styles.button, styles.rightButton]}
							testID={'drawer-receive-button'}
						>
							<View style={styles.buttonContent}>
								{/* {this.getIcon('dollar', 16, Colors.primary)} */}
								<Text style={[styles.buttonText, brandStyles.buttonText]}>
									{strings('drawer.receive_button')}
								</Text>
							</View>
						</StyledButton>
					</View>
					<View style={styles.menu}>
						{this.getSections().map(
							(section, i) =>
								section?.length > 0 && (
									<View
										key={`section_${i}`}
										style={[styles.menuSection, i === 0 ? styles.noTopBorder : null]}
									>
										{section
											.filter(item => {
												if (!item) return undefined;
												const { name = undefined } = item;
												if (name && name.toLowerCase().indexOf('etherscan') !== -1) {
													const type = network.provider?.type;
													return (type && this.hasBlockExplorer(type)) || undefined;
												}
												return true;
											})
											.map((item, j) => (
												<TouchableOpacity
													key={`item_${i}_${j}`}
													style={[
														styles.menuItem,
														item.routeNames && item.routeNames.includes(currentRoute)
															? styles.selectedRoute
															: null
													]}
													ref={
														item.name === strings('drawer.browser') &&
														this.browserSectionRef
													}
													onPress={() => item.action()} // eslint-disable-line
												>
													{item.icon
														? item.routeNames && item.routeNames.includes(currentRoute)
															? item.selectedIcon
															: item.icon
														: null}
													{item.key == 'notifications' && unreadNotif && (
														<Text style={styles.unread}>*</Text>
													)}
													<Text
														style={[
															styles.menuItemName,
															brandStyles.menuItemName,
															!item.icon ? styles.noIcon : null,
															item.routeNames && item.routeNames.includes(currentRoute)
																? styles.selectedName
																: null
														]}
														numberOfLines={1}
													>
														{item.name}
													</Text>
													{!seedphraseBackedUp && item.warning ? (
														<SettingsNotification isNotification isWarning>
															<Text style={styles.menuItemWarningText}>
																{item.warning}
															</Text>
														</SettingsNotification>
													) : null}
												</TouchableOpacity>
											))}
									</View>
								)
						)}
					</View>
				</ScrollView>
				<Modal
					isVisible={this.props.networkModalVisible}
					onBackdropPress={this.toggleNetworksModal}
					onBackButtonPress={this.toggleNetworksModal}
					onSwipeComplete={this.toggleNetworksModal}
					swipeDirection={'down'}
					propagateSwipe
				>
					<NetworkList
						navigation={this.props.navigation}
						onClose={this.onNetworksModalClose}
						showInvalidCustomNetworkAlert={this.showInvalidCustomNetworkAlert}
					/>
				</Modal>
				<Modal isVisible={!!invalidCustomNetwork}>
					<InvalidCustomNetworkAlert
						network={invalidCustomNetwork}
						onClose={this.closeInvalidCustomNetworkAlert}
					/>
				</Modal>
				<Modal
					isVisible={this.props.accountsModalVisible}
					style={styles.bottomModal}
					onBackdropPress={this.toggleAccountsModal}
					onBackButtonPress={this.toggleAccountsModal}
					onSwipeComplete={this.toggleAccountsModal}
					swipeDirection={'down'}
					propagateSwipe
				>
					<AccountList
						enableAccountsAddition
						navigation={this.props.navigation}
						identities={identities}
						selectedAddress={selectedAddress}
						keyrings={keyrings}
						onAccountChange={this.onAccountChange}
						onImportAccount={this.onImportAccount}
						ticker={ticker}
					/>
				</Modal>
				{this.renderOnboardingWizard()}
				<Modal
					isVisible={this.props.receiveModalVisible}
					onBackdropPress={this.toggleReceiveModal}
					onBackButtonPress={this.toggleReceiveModal}
					onSwipeComplete={this.toggleReceiveModal}
					swipeDirection={'down'}
					propagateSwipe
					style={styles.bottomModal}
				>
					<ReceiveRequest
						navigation={this.props.navigation}
						hideModal={this.toggleReceiveModal}
						showReceiveModal={this.showReceiveModal}
					/>
				</Modal>
				<WhatsNewModal navigation={this.props.navigation} enabled={showProtectWalletModal === false} />

				<Modal
					isVisible={this.props.confirmLogoutModalVisible}
					onBackdropPress={this.toggleLogoutModal}
					onBackButtonPress={this.toggleLogoutModal}
					onSwipeComplete={this.toggleLogoutModal}
					swipeDirection={'down'}
					propagateSwipe
					style={styles.bottomModal}
				>
					<ConfirmLogout
						title={strings('drawer.logout')}
						message={strings('drawer.logout_title')}
						confirmLabel={strings('drawer.logout_ok')}
						cancelLabel={strings('drawer.logout_cancel')}
						onConfirm={this.onLogout}
						hideModal={this.toggleLogoutModal}
					/>
				</Modal>

				<ConfirmInputModal
					visible={editWalletNameVisible}
					title={strings('drawer.wallet_account_name')}
					value={account?.name}
					confirmLabel={strings('drawer.save')}
					cancelLabel={strings('drawer.cancel')}
					onConfirm={text => this.saveWalletName(text)}
					hideModal={this.toggleEditWalletName}
				/>
				{/*this.renderProtectModal()*/}
			</View>
		);
	}
}

const mapStateToProps = state => ({
	network: state.engine.backgroundState.NetworkController,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	identities: state.engine.backgroundState.PreferencesController.identities,
	frequentRpcList: state.engine.backgroundState.PreferencesController.frequentRpcList,
	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
	keyrings: state.engine.backgroundState.KeyringController.keyrings,
	networkModalVisible: state.modals.networkModalVisible,
	accountsModalVisible: state.modals.accountsModalVisible,
	receiveModalVisible: state.modals.receiveModalVisible,
	confirmLogoutModalVisible: state.modals.confirmLogoutModalVisible,
	passwordSet: state.user.passwordSet,
	keycloakAuth: state.user.keycloakAuth,
	wizard: state.wizard,
	chainId: state.engine.backgroundState.NetworkController.provider.chainId,
	ticker: state.engine.backgroundState.NetworkController.provider.ticker,
	tokens: state.engine.backgroundState.AssetsController.tokens,
	tokenBalances: state.engine.backgroundState.TokenBalancesController.contractBalances,
	collectibles: state.engine.backgroundState.AssetsController.collectibles,
	seedphraseBackedUp: state.user.seedphraseBackedUp,
	onboardProfile: state.user.onboardProfile
});

const mapDispatchToProps = dispatch => ({
	toggleNetworkModal: () => dispatch(toggleNetworkModal()),
	toggleAccountsModal: () => dispatch(toggleAccountsModal()),
	toggleReceiveModal: () => dispatch(toggleReceiveModal()),
	toggleConfirmLogoutModal: () => dispatch(toggleConfirmLogoutModal()),
	showAlert: config => dispatch(showAlert(config)),
	newAssetTransaction: selectedAsset => dispatch(newAssetTransaction(selectedAsset)),
	protectWalletModalVisible: () => dispatch(protectWalletModalVisible())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(DrawerView);
