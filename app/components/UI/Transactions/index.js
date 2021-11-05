import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { makeObservable, observable } from 'mobx';
import {
	ScrollView,
	ActivityIndicator,
	RefreshControl,
	StyleSheet,
	Text,
	View,
	FlatList,
	Dimensions,
	InteractionManager
} from 'react-native';
import { colors, fontStyles, baseStyles } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import TransactionElement from '../TransactionElement';
import Engine from '../../../core/Engine';
import { showAlert } from '../../../actions/alert';
import NotificationManager from '../../../core/NotificationManager';
import { CANCEL_RATE, SPEED_UP_RATE, WalletDevice } from '@metamask/controllers';
import { renderFromWei } from '../../../util/number';
import Device from '../../../util/Device';
import TransactionActionModal from '../TransactionActionModal';
import { validateTransactionActionBalance } from '../../../util/transactions';
import APIService from 'services/APIService';
import Routes from 'common/routes';
import moment from 'moment';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import { styles } from './styles/index';
import { brandStyles } from './styles/brand';

const ROW_HEIGHT = (Device.isIos() ? 95 : 100) + StyleSheet.hairlineWidth;

/**
 * View that renders a list of transactions for a specific asset
 */
class Transactions extends PureComponent {
	static propTypes = {
		assetSymbol: PropTypes.string,
		/**
		 * Map of accounts to information objects including balances
		 */
		accounts: PropTypes.object,
		/**
		 * Object containing token exchange rates in the format address => exchangeRate
		 */
		contractExchangeRates: PropTypes.object,
		/**
		/* navigation object required to push new views
		*/
		navigation: PropTypes.object,
		/**
		 * An array that represents the user collectible contracts
		 */
		collectibleContracts: PropTypes.array,
		/**
		 * An array that represents the user tokens
		 */
		tokens: PropTypes.object,
		/**
		 * An array of transactions objects
		 */
		transactions: PropTypes.array,
		/**
		 * An array of transactions objects that have been submitted
		 */
		submittedTransactions: PropTypes.array,
		/**
		 * An array of transactions objects that have been confirmed
		 */
		confirmedTransactions: PropTypes.array,
		/**
		 * A string that represents the selected address
		 */
		selectedAddress: PropTypes.string,
		/**
		 * ETH to current currency conversion rate
		 */
		conversionRate: PropTypes.number,
		/**
		 * Currency code of the currently-active currency
		 */
		currentCurrency: PropTypes.string,
		/**
		 * Loading flag from an external call
		 */
		loading: PropTypes.bool,
		/**
		 * Pass the flatlist ref to the parent
		 */
		onRefSet: PropTypes.func,
		/**
		 * Optional header component
		 */
		header: PropTypes.object,
		/**
		 * Optional header height
		 */
		headerHeight: PropTypes.number,
		exchangeRate: PropTypes.number,
		/**
		 * Indicates whether third party API mode is enabled
		 */
		thirdPartyApiMode: PropTypes.bool
	};

	static defaultProps = {
		headerHeight: 0
	};

	state = {
		selectedTx: (new Map(): Map<string, boolean>),
		ready: false,
		refreshing: false,
		cancelIsOpen: false,
		cancelConfirmDisabled: false,
		speedUpIsOpen: false,
		speedUpConfirmDisabled: false
	};

	existingGasPriceDecimal = null;
	cancelTxId = null;
	speedUpTxId = null;

	selectedTx = null;

	uses3rdPartyAPI = false;
	transactions = [];
	flatList = React.createRef();

	constructor(props) {
		super(props);
		makeObservable(this, {
			uses3rdPartyAPI: observable,
			transactions: observable
		});
	}

	componentDidMount() {
		this.mounted = true;
		this.props.onRefSet && this.props.onRefSet(this.flatList);
		this.retrieveTransactions();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.selectedAddress != this.props.selectedAddress) {
			this.setState({ ready: false, loading: true });
			this.retrieveTransactions();
		}
	}

	init() {
		this.mounted && this.setState({ ready: true });
		const txToView = NotificationManager.getTransactionToView();
		if (txToView) {
			setTimeout(() => {
				const index = this.props.transactions.findIndex(tx => txToView === tx.id);
				if (index >= 0) {
					this.toggleDetailsView(txToView, index);
				}
			}, 1000);
		}
	}

	static map3rdPartyTransaction = e => {
		const { mainNetWork } = Routes;
		const { NetworkController } = Engine.context;
		const network = NetworkController.state.network;

		return {
			id: e.hash,
			networkID: network,
			chainId: mainNetWork.chainId,
			origin: mainNetWork.name,
			status: e.blockNumber && e.blockNumber != 'null' ? 'confirmed' : 'pending',
			time: moment(e.timeStamp).unix() * 1000,
			transaction: {
				from: e.from,
				gas: e.gas,
				gasPrice: e.gasPrice,
				nonce: e.nonce,
				to: e.to,
				value: e.value
			},
			deviceConfirmedOn: WalletDevice.MM_MOBILE,
			rawTransaction: '',
			transactionHash: e.hash
		};
	};

	async retrieveTransactions() {
		const transactions = this.props.transactions || [];
		const { selectedAddress } = this.props;
		const { NetworkController } = Engine.context;
		const network = NetworkController.state.network;

		this.uses3rdPartyAPI = network == '7';
		if (!selectedAddress || !this.uses3rdPartyAPI) return;

		await new Promise((resolve, reject) => {
			APIService.getTransactionHistory(selectedAddress, (success, response) => {
				this.setState({ ready: true, loading: false });
				if (success && response) {
					this.transactions = response.result.map(e => {
						const transaction = transactions.find(t => t.transactionHash == e.hash);
						if (transaction) return transaction;

						return Transactions.map3rdPartyTransaction(e);
					});
					resolve(response);
				} else {
					reject(response);
				}
			});
		});
	}

	componentWillUnmount() {
		this.mounted = false;
	}

	scrollToIndex = index => {
		if (!this.scrolling && (this.props.headerHeight || index)) {
			this.scrolling = true;
			// eslint-disable-next-line no-unused-expressions
			this.flatList?.current?.scrollToIndex({ index, animated: true });
			setTimeout(() => {
				this.scrolling = false;
			}, 300);
		}
	};

	toggleDetailsView = (id, index) => {
		const oldId = this.selectedTx && this.selectedTx.id;
		const oldIndex = this.selectedTx && this.selectedTx.index;

		if (this.selectedTx && oldId !== id && oldIndex !== index) {
			this.selectedTx = null;
			this.toggleDetailsView(oldId, oldIndex);
			InteractionManager.runAfterInteractions(() => {
				this.toggleDetailsView(id, index);
			});
		} else {
			this.setState(state => {
				const selectedTx = new Map(state.selectedTx);
				const show = !selectedTx.get(id);
				selectedTx.set(id, show);
				if (show && (this.props.headerHeight || index)) {
					InteractionManager.runAfterInteractions(() => {
						this.scrollToIndex(index);
					});
				}
				this.selectedTx = show ? { id, index } : null;
				return { selectedTx };
			});
		}
	};

	onRefresh = async () => {
		this.setState({ refreshing: true });
		if (this.uses3rdPartyAPI) await this.retrieveTransactions();
		else this.props.thirdPartyApiMode && (await Engine.refreshTransactionHistory());
		this.setState({ refreshing: false });
	};

	renderLoader = () => (
		<OnboardingScreenWithBg screen="a">
			<View style={[styles.emptyContainer, brandStyles.emptyContainer]}>
				<ActivityIndicator style={styles.loader} size="small" />
			</View>
		</OnboardingScreenWithBg>
	);

	renderEmpty = () => (
		<OnboardingScreenWithBg screen="a">
			<ScrollView
				refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />}
			>
				{this.props.header ? this.props.header : null}
				<View style={[styles.emptyContainer, brandStyles.emptyContainer]}>
					<Text style={styles.text}>{strings('wallet.no_transactions')}</Text>
				</View>
			</ScrollView>
		</OnboardingScreenWithBg>
	);

	getItemLayout = (data, index) => ({
		length: ROW_HEIGHT,
		offset: this.props.headerHeight + ROW_HEIGHT * index,
		index
	});

	keyExtractor = item => item.id.toString();

	onSpeedUpAction = (speedUpAction, existingGasPriceDecimal, tx) => {
		this.setState({ speedUpIsOpen: speedUpAction });
		this.existingGasPriceDecimal = existingGasPriceDecimal;
		this.speedUpTxId = tx.id;
		const speedUpConfirmDisabled = validateTransactionActionBalance(tx, SPEED_UP_RATE, this.props.accounts);
		this.setState({ speedUpIsOpen: speedUpAction, speedUpConfirmDisabled });
	};

	onSpeedUpCompleted = () => {
		this.setState({ speedUpIsOpen: false });
		this.existingGasPriceDecimal = null;
		this.speedUpTxId = null;
	};

	onCancelAction = (cancelAction, existingGasPriceDecimal, tx) => {
		this.existingGasPriceDecimal = existingGasPriceDecimal;
		this.cancelTxId = tx.id;
		const cancelConfirmDisabled = validateTransactionActionBalance(tx, CANCEL_RATE, this.props.accounts);
		this.setState({ cancelIsOpen: cancelAction, cancelConfirmDisabled });
	};
	onCancelCompleted = () => {
		this.setState({ cancelIsOpen: false });
		this.existingGasPriceDecimal = null;
		this.cancelTxId = null;
	};

	speedUpTransaction = () => {
		try {
			Engine.context.TransactionController.speedUpTransaction(this.speedUpTxId);
		} catch (e) {
			// ignore because transaction already went through
		}
		this.onSpeedUpCompleted();
	};

	cancelTransaction = () => {
		try {
			Engine.context.TransactionController.stopTransaction(this.cancelTxId);
		} catch (e) {
			// ignore because transaction already went through
		}
		this.onCancelCompleted();
	};

	renderItem = ({ item, index }) => (
		<TransactionElement
			tx={item}
			i={index}
			assetSymbol={this.props.assetSymbol}
			onSpeedUpAction={this.onSpeedUpAction}
			onCancelAction={this.onCancelAction}
			testID={'txn-item'}
			onPressItem={this.toggleDetailsView}
			selectedAddress={this.props.selectedAddress}
			tokens={this.props.tokens}
			collectibleContracts={this.props.collectibleContracts}
			contractExchangeRates={this.props.contractExchangeRates}
			exchangeRate={this.props.exchangeRate}
			conversionRate={this.props.conversionRate}
			currentCurrency={this.props.currentCurrency}
			navigation={this.props.navigation}
		/>
	);

	render = () => {
		if (!this.state.ready || this.props.loading) {
			return this.renderLoader();
		}
		if (!this.props.transactions.length) {
			return this.renderEmpty();
		}
		const { submittedTransactions, confirmedTransactions, header } = this.props;
		const { cancelConfirmDisabled, speedUpConfirmDisabled } = this.state;
		const transactions = this.uses3rdPartyAPI
			? this.transactions
			: submittedTransactions && submittedTransactions.length
			? submittedTransactions.concat(confirmedTransactions)
			: this.props.transactions;

		return (
			<OnboardingScreenWithBg screen="a">
				<View style={[styles.wrapper, brandStyles.wrapper]} testID={'transactions-screen'}>
					<FlatList
						ref={this.flatList}
						getItemLayout={this.getItemLayout}
						data={transactions}
						extraData={this.state}
						keyExtractor={this.keyExtractor}
						refreshControl={
							<RefreshControl refreshing={this.state.refreshing} onRefresh={this.onRefresh} />
						}
						renderItem={this.renderItem}
						initialNumToRender={10}
						maxToRenderPerBatch={2}
						onEndReachedThreshold={0.5}
						ListHeaderComponent={header}
						style={baseStyles.flexGrow}
						scrollIndicatorInsets={{ right: 1 }}
					/>

					<TransactionActionModal
						isVisible={this.state.cancelIsOpen}
						confirmDisabled={cancelConfirmDisabled}
						onCancelPress={this.onCancelCompleted}
						onConfirmPress={this.cancelTransaction}
						confirmText={strings('transaction.lets_try')}
						confirmButtonMode={'info'}
						cancelText={strings('transaction.nevermind')}
						feeText={`${renderFromWei(Math.floor(this.existingGasPriceDecimal * CANCEL_RATE))} ${strings(
							'unit.eth'
						)}`}
						titleText={strings('transaction.cancel_tx_title')}
						gasTitleText={strings('transaction.gas_cancel_fee')}
						descriptionText={strings('transaction.cancel_tx_message')}
					/>

					<TransactionActionModal
						isVisible={this.state.speedUpIsOpen}
						confirmDisabled={speedUpConfirmDisabled}
						onCancelPress={this.onSpeedUpCompleted}
						onConfirmPress={this.speedUpTransaction}
						confirmText={strings('transaction.lets_try')}
						confirmButtonMode={'info'}
						cancelText={strings('transaction.nevermind')}
						feeText={`${renderFromWei(Math.floor(this.existingGasPriceDecimal * SPEED_UP_RATE))} ${strings(
							'unit.eth'
						)}`}
						titleText={strings('transaction.speedup_tx_title')}
						gasTitleText={strings('transaction.gas_speedup_fee')}
						descriptionText={strings('transaction.speedup_tx_message')}
					/>
				</View>
			</OnboardingScreenWithBg>
		);
	};
}

const mapStateToProps = state => ({
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	collectibleContracts: state.engine.backgroundState.AssetsController.collectibleContracts,
	contractExchangeRates: state.engine.backgroundState.TokenRatesController.contractExchangeRates,
	conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate,
	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	thirdPartyApiMode: state.privacy.thirdPartyApiMode,
	tokens: state.engine.backgroundState.AssetsController.tokens.reduce((tokens, token) => {
		tokens[token.address] = token;
		return tokens;
	}, {})
});

const mapDispatchToProps = dispatch => ({
	showAlert: config => dispatch(showAlert(config))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Transactions);

export const { map3rdPartyTransaction } = Transactions;
