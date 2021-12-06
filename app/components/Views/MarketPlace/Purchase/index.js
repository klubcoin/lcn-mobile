import React, { PureComponent } from 'react';
import { colors, fontStyles } from '../../../../styles/common';
import { getSendFlowTitle } from '../../../UI/Navbar';
import PropTypes from 'prop-types';
import { makeObservable, observable } from 'mobx';
import {
	StyleSheet,
	View,
	SafeAreaView,
	InteractionManager,
	ScrollView,
	ActivityIndicator,
	Alert,
	DeviceEventEmitter,
	TouchableOpacity
} from 'react-native';
import { AddressFrom, AddressTo } from '../../SendFlow/AddressInputs';
import Modal from 'react-native-modal';
import AccountList from '../../../UI/AccountList';
import { connect } from 'react-redux';
import { isDecimal, renderFromWei, toTokenMinimalUnit, toWei } from '../../../../util/number';
import Engine from '../../../../core/Engine';
import { doENSReverseLookup } from '../../../../util/ENSUtils';
import { setSelectedAsset } from '../../../../actions/transaction';
import { rawEncode } from 'ethereumjs-abi';
import { addHexPrefix } from 'ethereumjs-util';
import { getTicker, getEther, TRANSFER_FUNCTION_SIGNATURE } from '../../../../util/transactions';
import { strings } from '../../../../../locales/i18n';
import WarningMessage from '../../SendFlow/WarningMessage';
import { util } from '@metamask/controllers';
import Analytics from '../../../../core/Analytics';
import { ANALYTICS_EVENT_OPTS } from '../../../../util/analytics';
import { allowedToBuy } from '../../../UI/FiatOrders';
import Text from '../../../Base/Text';
import Helper from 'common/Helper';
import MarketOrderSummary from '../OrderSummary';
import StyledButton from '../../../UI/StyledButton';
import APIService from '../../../../services/APIService';
import NotificationManager from '../../../../core/NotificationManager';
import { getGasPriceByChainId } from '../../../../util/custom-gas';
import styles from './styles/index';
import { BNToHex } from '@metamask/controllers/dist/util';
import TransactionTypes from '../../../../core/TransactionTypes';
import { WalletDevice } from '@metamask/swaps-controller/node_modules/@metamask/controllers';
import { showError, showSuccess } from '../../../../util/notify';
import analyticsV2 from '../../../../util/analyticsV2';
import * as sha3JS from 'js-sha3';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { RFValue } from 'react-native-responsive-fontsize';
import { refStoreService } from '../store/StoreService';
import { StoreOrder } from '../store/StoreMessages';

const { hexToBN } = util;
/**
 * View that wraps the wraps the "PayQR" screen
 */
class MarketPurchase extends PureComponent {
	static navigationOptions = ({ navigation, screenProps }) =>
		getSendFlowTitle('payQR.order_summary', navigation, screenProps);

	static propTypes = {
		/**
		 * Map of accounts to information objects including balances
		 */
		accounts: PropTypes.object,
		/**
		 * Network id
		 */
		network: PropTypes.string,
		/**
		 * Object that represents the navigator
		 */
		navigation: PropTypes.object,
		/**
		 * Selected address as string
		 */
		selectedAddress: PropTypes.string,
		/**
		 * List of accounts from the PreferencesController
		 */
		identities: PropTypes.object,
		/**
		 * List of keyrings
		 */
		keyrings: PropTypes.array,
		/**
		 * Current provider ticker
		 */
		ticker: PropTypes.string,
		/**
		 * Set selected in transaction state
		 */
		setSelectedAsset: PropTypes.func,
		/**
		 * Network provider type as mainnet
		 */
		providerType: PropTypes.string
	};

	processing = false;
	addressToInputRef = React.createRef();


	state = {
		balanceIsZero: false,
		fromAccountModalVisible: false,
		fromSelectedAddress: this.props.selectedAddress,
		fromAccountName: this.props.identities[this.props.selectedAddress].name,
		fromAccountBalance: undefined,
	};

	constructor(props) {
		super(props)
		makeObservable(this, {
			processing: observable
		})
	}

	componentDidMount = async () => {
		const { selectedAddress, accounts, network, navigation, providerType, ticker } = this.props;
		const { fromAccountName } = this.state;
		// For analytics
		navigation.setParams({ providerType });
		const ens = await doENSReverseLookup(selectedAddress, network);
		const fromAccountBalance = `${Helper.demosToLiquichain(accounts[selectedAddress].balance)} ${ticker}`;

		this.setState({
			fromAccountName: ens || fromAccountName,
			fromAccountBalance,
			balanceIsZero: hexToBN(accounts[selectedAddress].balance).isZero(),
		});

	};

	toggleFromAccountModal = () => {
		const { fromAccountModalVisible } = this.state;
		this.setState({ fromAccountModalVisible: !fromAccountModalVisible });
	};

	onAccountChange = async accountAddress => {
		const { identities, ticker, accounts } = this.props;
		const { name } = identities[accountAddress];
		const { PreferencesController } = Engine.context;
		const fromAccountBalance = `${renderFromWei(accounts[accountAddress].balance)} ${getTicker(ticker)}`;
		const ens = await doENSReverseLookup(accountAddress);
		const fromAccountName = ens || name;
		PreferencesController.setSelectedAddress(accountAddress);
		// If new account doesn't have the asset
		this.props.setSelectedAsset(getEther(ticker));
		this.setState({
			fromAccountName,
			fromAccountBalance,
			fromSelectedAddress: accountAddress,
			balanceIsZero: hexToBN(accounts[accountAddress].balance).isZero()
		});
		this.toggleFromAccountModal();
	};

	renderFromAccountModal = () => {
		const { identities, keyrings, ticker } = this.props;
		const { fromAccountModalVisible, fromSelectedAddress } = this.state;
		return (
			<Modal
				isVisible={fromAccountModalVisible}
				style={styles.bottomModal}
				onBackdropPress={this.toggleFromAccountModal}
				onBackButtonPress={this.toggleFromAccountModal}
				onSwipeComplete={this.toggleFromAccountModal}
				swipeDirection={'down'}
				propagateSwipe
			>
				<AccountList
					enableAccountsAddition={false}
					identities={identities}
					selectedAddress={fromSelectedAddress}
					keyrings={keyrings}
					onAccountChange={this.onAccountChange}
					ticker={ticker}
				/>
			</Modal>
		);
	};

	prepareTransactionToSend = () => {
		const { selectedAddress } = Engine.state.PreferencesController;
		const order = this.props.navigation.getParam('order');
		const amount = BNToHex(toWei(order.amount));

		const hexData = TRANSFER_FUNCTION_SIGNATURE + Array.prototype.map
			.call(rawEncode(
				['address', 'uint256', 'string'],
				[
					order.to,
					addHexPrefix(amount),
					JSON.stringify(order),
				]),
				x => ('00' + x.toString(16)).slice(-2)
			)
			.join('');

		return {
			data: hexData,
			from: selectedAddress,
			gas: BNToHex(0),
			gasPrice: BNToHex(0),
			to: order.to,
			value: BNToHex(toWei(order.amount))
		};
	};

	amountErrorMessage = () => {
		//TODO: add gas price to check valid
		const { accounts, contractBalances, selectedAddress, ticker } = this.props;
		const { amount } = this.props.navigation.getParam('order');
		const selectedAsset = getEther(ticker)

		let weiBalance, weiInput, amountError;
		if (isDecimal(amount)) {
			if (selectedAsset.isETH) {
				weiBalance = hexToBN(accounts[selectedAddress].balance);
				weiInput = toWei(amount);
			} else {
				weiBalance = contractBalances[selectedAsset.address];
				weiInput = toTokenMinimalUnit(amount, selectedAsset.decimals);
			}
			amountError = weiBalance?.gte(weiInput) ? undefined : strings('transaction.insufficient');
		}
		else {
			amountError = weiBalance?.gte(weiInput) ? undefined : strings('transaction.invalid_amount');
		}
		return amountError;
	};

	onPay = async () => {
		if (this.processing) return;
		this.processing = true;

		const { navigation } = this.props;
		const order = navigation.getParam('order');

		const storeService = refStoreService();
		const hash = storeService?.sendOrder(order);

		storeService.addListener(data => {
			if (data.action == StoreOrder().action && data.hash == hash) {
				this.pendingOrder = data;
				this.sendTransaction();
			}
		});
	}

	sendTransaction = async () => {
		const { TransactionController } = Engine.context;

		try {
			const transaction = this.prepareTransactionToSend();

			const { result, transactionMeta } = await TransactionController.addTransaction(
				transaction,
				TransactionTypes.MMM,
				WalletDevice.MM_MOBILE
			);
			await TransactionController.approveTransaction(transactionMeta.id);
			await new Promise(resolve => resolve(result));

			if (transactionMeta.error) {
				throw transactionMeta.error;
			}

			InteractionManager.runAfterInteractions(() => {
				DeviceEventEmitter.emit(`SubmitTransaction`, transactionMeta);
				NotificationManager.watchSubmittedTransaction({
					...transactionMeta,
				});
			});
			this.processing = false;

			this.goBack();
		} catch (error) {
			this.processing = false;
			Alert.alert(strings('transactions.transaction_error'), error && error.message, [
				{ text: strings('navigation.ok') }
			]);
		}
	}

	goToBuy = () => {
		this.props.navigation.navigate('PurchaseMethods');
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_BUY_ETH);
		});
	};

	renderBuyEth = () => {
		if (!allowedToBuy(this.props.network)) {
			return null;
		}

		return (
			<Text bold style={styles.buyEth} onPress={this.goToBuy}>
				{strings('fiat_on_ramp.buy_eth')}
			</Text>
		);
	};

	goBack = () => {
		this.props.navigation.goBack();
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.goBack.bind(this)} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'arrow-left'} size={RFValue(15)} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{strings('market.payment')}</Text>
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	render = () => {
		const { ticker, navigation } = this.props;
		const {
			fromSelectedAddress,
			fromAccountName,
			fromAccountBalance,
			balanceIsZero,
		} = this.state;

		const { products, profile, to, amount, currencyUnit } = navigation.getParam('order');

		return (
			<View style={styles.root}>
				{this.renderNavBar()}
				<View style={styles.wrapper}>
					<View style={styles.inputWrapper}>
						<AddressFrom
							onPressIcon={this.toggleFromAccountModal}
							fromAccountAddress={fromSelectedAddress}
							fromAccountName={fromAccountName}
							fromAccountBalance={fromAccountBalance}
						/>
						<AddressTo
							addressToReady
							toAddressName={profile.storeName}
							toSelectedAddress={to}
						/>
					</View>
					<ScrollView>
						<MarketOrderSummary
							products={products}
							amount={amount}
							currency={currencyUnit}
						/>
						{balanceIsZero && (
							<View style={styles.warningContainer}>
								<WarningMessage
									warningMessage={
										<>
											{strings('transaction.not_enough_for_gas', {
												ticker: getTicker(ticker)
											})}
											{this.renderBuyEth()}
										</>
									}
								/>
							</View>
						)}
					</ScrollView>

					<View style={styles.buttonNextWrapper}>

						<StyledButton
							type={'confirm'}
							disabled={balanceIsZero}
							containerStyle={styles.buttonNext}
							onPress={this.onPay.bind(this)}
						>
							{this.processing ? (
								<ActivityIndicator size="small" color="white" />
							) : (
								strings('asset_overview.pay_button')
							)}
						</StyledButton>
					</View>

					{this.renderFromAccountModal()}
				</View>
			</View>
		);
	};
}

const mapStateToProps = state => ({
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	contractBalances: state.engine.backgroundState.TokenBalancesController.contractBalances,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	selectedAsset: state.transaction.selectedAsset,
	identities: state.engine.backgroundState.PreferencesController.identities,
	keyrings: state.engine.backgroundState.KeyringController.keyrings,
	ticker: state.engine.backgroundState.NetworkController.provider.ticker,
	network: state.engine.backgroundState.NetworkController.network,
	providerType: state.engine.backgroundState.NetworkController.provider.type
});

const mapDispatchToProps = dispatch => ({
	setSelectedAsset: selectedAsset => dispatch(setSelectedAsset(selectedAsset))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(MarketPurchase);
