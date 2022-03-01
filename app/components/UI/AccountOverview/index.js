import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
	ScrollView,
	TextInput,
	StyleSheet,
	Text,
	View,
	TouchableOpacity,
	InteractionManager,
	Alert
} from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { swapsUtils } from '@metamask/swaps-controller';
import { connect } from 'react-redux';
import Engine from '../../../core/Engine';
import Analytics from '../../../core/Analytics';
import AppConstants from '../../../core/AppConstants';
import { strings } from '../../../../locales/i18n';
import APIService from '../../../services/APIService';

import { swapsLivenessSelector } from '../../../reducers/swaps';
import { showAlert } from '../../../actions/alert';
import { protectWalletModalVisible } from '../../../actions/user';
import { toggleAccountsModal, toggleReceiveModal } from '../../../actions/modals';
import { newAssetTransaction } from '../../../actions/transaction';

import Device from '../../../util/Device';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import { renderFiat, balanceToFiat, hexToBN, weiToFiat } from '../../../util/number';
import { showInfo } from '../../../util/notify';

import { renderAccountName } from '../../../util/address';
import { isMainNet } from '../../../util/networks';
import { getEther } from '../../../util/transactions';
import { isSwapsAllowed } from '../Swaps/utils';

import Identicon from '../Identicon';
import AssetActionButton from '../AssetActionButton';
import EthereumAddress from '../EthereumAddress';
import { colors, fontStyles, baseStyles } from '../../../styles/common';
import { allowedToBuy } from '../FiatOrders';
import AssetSwapButton from '../Swaps/components/AssetSwapButton';
import Helper from 'common/Helper';
import RemoteImage from '../../Base/RemoteImage';
import styles from './styles/index';

/**
 * View that's part of the <Wallet /> component
 * which shows information about the selected account
 */
class AccountOverview extends PureComponent {
	static propTypes = {
		/**
		 * String that represents the selected address
		 */
		selectedAddress: PropTypes.string,
		/**
		/* Identities object required to get account name
		*/
		identities: PropTypes.object,
		/**
		 * Object that represents the selected account
		 */
		account: PropTypes.object,
		/**
		/* Selected currency
		*/
		currentCurrency: PropTypes.string,
		/**
		/* Triggers global alert
		*/
		showAlert: PropTypes.func,
		/**
		 * Action that toggles the accounts modal
		 */
		toggleAccountsModal: PropTypes.func,
		/**
		 * whether component is being rendered from onboarding wizard
		 */
		onboardingWizard: PropTypes.bool,
		/**
		 * Used to get child ref
		 */
		onRef: PropTypes.func,
		/**
		 * Prompts protect wallet modal
		 */
		protectWalletModalVisible: PropTypes.func,
		/**
		 * Start transaction with asset
		 */
		newAssetTransaction: PropTypes.func,
		/**
		/* navigation object required to access the props
		/* passed by the parent component
		*/
		navigation: PropTypes.object,
		/**
		 * Action that toggles the receive modal
		 */
		toggleReceiveModal: PropTypes.func,
		/**
		 * Chain id
		 */
		chainId: PropTypes.string,
		/**
		 * Wether Swaps feature is live or not
		 */
		swapsIsLive: PropTypes.bool,
		/**
		 * Current provider ticker
		 */
		ticker: PropTypes.string
	};

	state = {
		accountLabelEditable: false,
		accountLabel: '',
		originalAccountLabel: ''
	};

	editableLabelRef = React.createRef();
	scrollViewContainer = React.createRef();
	mainView = React.createRef();

	animatingAccountsModal = false;
	date = new Date();

	toggleAccountsModal = () => {
		const { onboardingWizard } = this.props;
		if (!onboardingWizard && !this.animatingAccountsModal) {
			this.animatingAccountsModal = true;
			this.props.toggleAccountsModal();
			setTimeout(() => {
				this.animatingAccountsModal = false;
			}, 500);
		}
	};

	input = React.createRef();

	componentDidMount = () => {
		const { identities, selectedAddress, onRef } = this.props;
		const accountLabel = renderAccountName(selectedAddress, identities);
		this.setState({ accountLabel });
		onRef && onRef(this);
	};

	setAccountLabel = () => {
		const { PreferencesController } = Engine.context;
		const { selectedAddress } = this.props;
		const { accountLabel } = this.state;
		PreferencesController.setAccountLabel(selectedAddress, accountLabel);
		this.setState({ accountLabelEditable: false });
	};

	onAccountLabelChange = accountLabel => {
		this.setState({ accountLabel });
	};

	setAccountLabelEditable = () => {
		const { identities, selectedAddress } = this.props;
		const accountLabel = renderAccountName(selectedAddress, identities);
		this.setState({ accountLabelEditable: true, accountLabel });
		setTimeout(() => {
			this.input && this.input.current && this.input.current.focus();
		}, 100);
	};

	cancelAccountLabelEdition = () => {
		const { identities, selectedAddress } = this.props;
		const accountLabel = renderAccountName(selectedAddress, identities);
		this.setState({ accountLabelEditable: false, accountLabel });
	};

	copyAccountToClipboard = async () => {
		const { selectedAddress } = this.props;
		await Clipboard.setString(selectedAddress);
		this.props.showAlert({
			isVisible: true,
			autodismiss: 1500,
			content: 'clipboard-alert',
			data: { msg: strings('account_details.account_copied_to_clipboard') }
		});
		setTimeout(() => this.props.protectWalletModalVisible(), 2000);
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_COPIED_ADDRESS);
		});
	};

	onReceive = () => this.props.toggleReceiveModal();

	onSend = () => {
		const { newAssetTransaction, navigation, ticker } = this.props;
		newAssetTransaction(getEther(ticker));
		navigation.navigate('SendFlowView');
	};

	fetchOrder = orderId => {
		const { navigation } = this.props;
		APIService.getOrderInfo(orderId, (success, response) => {
			if (success && response.orderNumber) {
				navigation.navigate('PayQR', { orderId, order: response });
			} else {
				Alert.alert(strings('qr_scanner.error'), strings('asset_overview.could_not_fetch_order_info'), [
					{ text: strings('navigation.ok') }
				]);
			}
		});
	};

	onPayQR = () => {
		const { navigation } = this.props;
		navigation.navigate('QRScanner', {
			onScanSuccess: data => {
				if (data.orderId) {
					this.fetchOrder(data.orderId);
				} else {
					Alert.alert(strings('qr_scanner.error'), strings('qr_scanner.invalid_qr_code_title'), [
						{ text: strings('navigation.ok') }
					]);
				}
			}
		});
	};

	onBuy = () => {
		this.props.navigation.navigate('PurchaseMethods');
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_BUY_ETH);
		});
	};

	goToSwaps = () =>
		this.props.navigation.navigate('Swaps', {
			sourceToken: swapsUtils.NATIVE_SWAPS_TOKEN_ADDRESS
		});

	render() {
		const {
			account: { name, address, balance, conversion },
			currentCurrency,
			onboardingWizard,
			chainId,
			swapsIsLive,
			onboardProfile,
			conversionRate,
			tokenExchangeRates,
		} = this.props;

		if (!address) return null;

		const { accountLabelEditable, accountLabel } = this.state;
		const { avatar } = onboardProfile || {};

		const balanceFiat = weiToFiat(hexToBN(balance), conversionRate, currentCurrency) || 0;

		return (
			<View ref={this.scrollViewContainer} collapsable={false}>
				<ScrollView
					bounces={false}
					keyboardShouldPersistTaps={'never'}
					style={styles.scrollView}
					contentContainerStyle={styles.wrapper}
					testID={'account-overview'}
				>
					<View style={styles.info} ref={this.mainView}>
						<View style={styles.accountWrapper}>
							<View style={styles.row}>
								<TouchableOpacity
									style={styles.identiconBorder}
									disabled={onboardingWizard}
									onPress={this.toggleAccountsModal}
									testID={'wallet-account-identicon'}
								>
									{!!avatar ? (
										<RemoteImage
											source={{ uri: `file://${avatar}?v=${this.date.getTime()}` }}
											style={styles.avatar}
										/>
									) : (
										<Identicon address={address} diameter={38} noFadeIn={onboardingWizard} />
									)}
								</TouchableOpacity>
								<View ref={this.editableLabelRef} style={styles.data} collapsable={false}>
									{accountLabelEditable ? (
										<TextInput
											style={[
												styles.label,
												styles.labelInput,
												styles.onboardingWizardLabel,
												onboardingWizard ? { borderColor: colors.blue } : { borderColor: colors.white }
											]}
											editable={accountLabelEditable}
											onChangeText={this.onAccountLabelChange}
											onSubmitEditing={this.setAccountLabel}
											onBlur={this.setAccountLabel}
											testID={'account-label-text-input'}
											value={accountLabel}
											selectTextOnFocus
											ref={this.input}
											returnKeyType={'done'}
											autoCapitalize={'none'}
											autoCorrect={false}
											numberOfLines={1}
										/>
									) : (
										<TouchableOpacity onLongPress={this.setAccountLabelEditable}>
											<Text
												style={[
													styles.label,
													styles.onboardingWizardLabel,
													onboardingWizard
														? { borderColor: colors.blue }
														: { borderColor: colors.transparent }
												]}
												numberOfLines={1}
												testID={'edit-account-label'}
											>
												{name?.name || `${name}`}
											</Text>
										</TouchableOpacity>
									)}
									<Text style={styles.balance}>{balanceFiat}</Text>
								</View>
							</View>

							{/* {isMainNet(chainId) && (
								<Text style={styles.amountFiat}>{Helper.convertToEur(balance, conversion)}</Text>
							)} */}

							<TouchableOpacity style={styles.addressWrapper} onPress={this.copyAccountToClipboard}>
								<EthereumAddress address={address} style={styles.address} type={'short'} />
							</TouchableOpacity>
						</View>

						<View style={styles.actions}>
							<AssetActionButton
								icon="receive"
								onPress={this.onReceive}
								label={strings('asset_overview.receive_button')}
							/>
							{/* {allowedToBuy(chainId) && ( */}
								<AssetActionButton
									icon="buy"
									onPress={this.onBuy}
									label={strings('asset_overview.buy_button')}
								/>
							{/* )} */}
							<AssetActionButton
								testID={'token-send-button'}
								icon="send"
								onPress={this.onSend}
								label={strings('asset_overview.send_button')}
							/>
							<AssetActionButton
								icon="trade"
								onPress={() => {
									// showInfo('This feature in under maintain');
									this.props.navigation.navigate("ComingSoon")
								}}
								label={strings('asset_overview.trade')}
								lastIcon
							/>
							{/* <AssetActionButton
								icon="send"
								onPress={this.onPayQR}
								label={strings('asset_overview.pay_button')}
							/> */}
							{/*AppConstants.SWAPS.ACTIVE && (
								<AssetSwapButton
									isFeatureLive={swapsIsLive}
									isNetworkAllowed={isSwapsAllowed(chainId)}
									onPress={this.goToSwaps}
									isAssetAllowed
								/>
							)*/}
						</View>
					</View>
				</ScrollView>
			</View>
		);
	}
}

const mapStateToProps = state => ({
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	identities: state.engine.backgroundState.PreferencesController.identities,
	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
	chainId: state.engine.backgroundState.NetworkController.provider.chainId,
	ticker: state.engine.backgroundState.NetworkController.provider.ticker,
	swapsIsLive: swapsLivenessSelector(state),
	onboardProfile: state.user.onboardProfile,
	conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate,
});

const mapDispatchToProps = dispatch => ({
	showAlert: config => dispatch(showAlert(config)),
	toggleAccountsModal: () => dispatch(toggleAccountsModal()),
	protectWalletModalVisible: () => dispatch(protectWalletModalVisible()),
	newAssetTransaction: selectedAsset => dispatch(newAssetTransaction(selectedAsset)),
	toggleReceiveModal: asset => dispatch(toggleReceiveModal(asset))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AccountOverview);
