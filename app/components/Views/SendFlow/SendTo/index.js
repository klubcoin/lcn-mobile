import React, { PureComponent } from 'react';
import { colors, baseStyles } from '../../../../styles/common';
import { getSendFlowTitle } from '../../../UI/Navbar';
import AddressList from '../AddressList';
import PropTypes from 'prop-types';
import { View, TouchableOpacity, SafeAreaView, InteractionManager, Modal as ReactNativeModal } from 'react-native';
import { AddressFrom, AddressTo } from '../AddressInputs';
import Modal from 'react-native-modal';
import AccountList from '../../../UI/AccountList';
import { connect } from 'react-redux';
import {
	fromTokenMinimalUnit,
	fromTokenMinimalUnitString,
	renderFromTokenMinimalUnit,
	renderFromWei
} from '../../../../util/number';
import ActionModal from '../../../UI/ActionModal';
import Engine from '../../../../core/Engine';
import { isValidAddress, toChecksumAddress } from 'ethereumjs-util';
import { doENSLookup, doENSReverseLookup } from '../../../../util/ENSUtils';
import StyledButton from '../../../UI/StyledButton';
import { setSelectedAsset, setRecipient, newAssetTransaction } from '../../../../actions/transaction';
import { isENS } from '../../../../util/address';
import { getTicker, getEther } from '../../../../util/transactions';
import ErrorMessage from '../ErrorMessage';
import { strings } from '../../../../../locales/i18n';
import WarningMessage from '../WarningMessage';
import { util } from '@metamask/controllers';
import Analytics from '../../../../core/Analytics';
import { ANALYTICS_EVENT_OPTS } from '../../../../util/analytics';
import { allowedToBuy } from '../../../UI/FiatOrders';
import NetworkList from '../../../../util/networks';
import Text from '../../../Base/Text';
import Icon from 'react-native-vector-icons/FontAwesome';
import { collectConfusables, hasZeroWidthPoints } from '../../../../util/validators';
import Helper from 'common/Helper';
import Routes from '../../../../common/routes';
import OnboardingScreenWithBg from '../../../UI/OnboardingScreenWithBg';
import styles from './styles/index';
import { displayName } from '../../../../../app.json';
import { fromWei } from 'web3-utils';
import QRScanner from '../../../UI/QRScanner';
import { parse } from 'eth-url-parser';
import { showError } from '../../../../util/notify';
import SharedDeeplinkManager from '../../../../core/DeeplinkManager';
import AppConstants from '../../../../core/AppConstants';
import TrackingTextInput from '../../../UI/TrackingTextInput';
import TrackingScrollView from '../../../UI/TrackingScrollView';

const { hexToBN } = util;
const dummy = () => true;

/**
 * View that wraps the wraps the "Send" screen
 */
class SendFlow extends PureComponent {
	static navigationOptions = ({ navigation, screenProps }) => getSendFlowTitle('send.title', navigation, screenProps);

	static propTypes = {
		/**
		 * Map of accounts to information objects including balances
		 */
		accounts: PropTypes.object,
		/**
		 * Map representing the address book
		 */
		addressBook: PropTypes.object,
		/**
		 * Network id
		 */
		network: PropTypes.string,
		/**
		 * Object that represents the navigator
		 */
		navigation: PropTypes.object,
		/**
		 * Start transaction with asset
		 */
		newAssetTransaction: PropTypes.func.isRequired,
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
		 * Action that sets transaction to and ensRecipient in case is available
		 */
		setRecipient: PropTypes.func,
		/**
		 * Set selected in transaction state
		 */
		setSelectedAsset: PropTypes.func,
		/**
		 * Network provider type as mainnet
		 */
		providerType: PropTypes.string
	};

	addressToInputRef = React.createRef();

	state = {
		addressError: undefined,
		balanceIsZero: false,
		fromAccountModalVisible: false,
		addToAddressBookModalVisible: false,
		fromSelectedAddress: this.props.selectedAddress,
		fromAccountName: this.props.identities[this.props.selectedAddress].name,
		fromAccountBalance: undefined,
		toSelectedAddress: undefined,
		toSelectedAddressName: undefined,
		toSelectedAddressReady: false,
		toEnsName: undefined,
		addToAddressToAddressBook: false,
		alias: undefined,
		confusableCollection: [],
		inputWidth: { width: '99%' },
		isScanQR: false,
		isValidInputAddress: true
	};

	componentDidMount = async () => {
		const {
			addressBook,
			selectedAddress,
			accounts,
			ticker,
			network,
			navigation,
			providerType,
			selectedAsset
		} = this.props;
		const { fromAccountName, fromSelectedAddress } = this.state;
		// For analytics
		navigation.setParams({ providerType });
		const networkAddressBook = addressBook[network] || {};
		const ens = await doENSReverseLookup(selectedAddress, network);
		// const fromAccountBalance = `${Helper.demosToLiquichain(accounts[selectedAddress].balance)} ${
		// 	Routes.mainNetWork.ticker
		// }`;
		const fromAccountBalance = `${fromTokenMinimalUnitString(
			accounts[fromSelectedAddress].balance?.toString(10),
			selectedAsset.decimals
		)} ${getTicker(ticker)}`;

		setTimeout(() => {
			this.setState({
				fromAccountName: ens || fromAccountName,
				fromAccountBalance,
				balanceIsZero: hexToBN(accounts[selectedAddress].balance).isZero(),
				inputWidth: { width: '100%' }
			});
		}, 100);
		if (!Object.keys(networkAddressBook).length) {
			this.addressToInputRef && this.addressToInputRef.current && this.addressToInputRef.current.focus();
		}
		//Fills in to address and sets the transaction if coming from QR code scan
		const targetAddress = navigation.getParam('txMeta', null)?.target_address;
		if (targetAddress) {
			this.props.newAssetTransaction(getEther(ticker));
			this.onToSelectedAddressChange(targetAddress);
		}
	};

	// 	1. Get address
	// 2. Get the current network
	// 3. check if selectedAddress is valid? Since get only transaction from backend
	// 4. if address response is correct, then addToaddress = true
	// 5. else,
	// get networkid, which is not necessary since we only have 1 network
	// create new method on on selectAddress

	onToSelectedAddressChangeDirect = async toSelectedAddress => {
		const { AssetsContractController } = Engine.context;
		const { addressBook, network, identities, providerType } = this.props;
		const networkAddressBook = addressBook[network] || {};
		let addressError, toAddressName, toEnsName, errorContinue, isOnlyWarning, confusableCollection;
		let [addToAddressToAddressBook, toSelectedAddressReady] = [false, false];
		if (isValidAddress(toSelectedAddress)) {
			const checksummedToSelectedAddress = toChecksumAddress(toSelectedAddress);
			toSelectedAddressReady = true;
			const ens = await doENSReverseLookup(toSelectedAddress);
			if (ens) {
				toAddressName = ens;
				if (!networkAddressBook[checksummedToSelectedAddress] && !identities[checksummedToSelectedAddress]) {
					addToAddressToAddressBook = true;
				}
			} else if (networkAddressBook[checksummedToSelectedAddress] || identities[checksummedToSelectedAddress]) {
				toAddressName =
					(networkAddressBook[checksummedToSelectedAddress] &&
						networkAddressBook[checksummedToSelectedAddress].name) ||
					(identities[checksummedToSelectedAddress] && identities[checksummedToSelectedAddress].name);
			} else {
				// If not in address book nor user accounts
				addToAddressToAddressBook = true;
			}
		} else if (isENS(toSelectedAddress)) {
			toEnsName = toSelectedAddress;
			confusableCollection = collectConfusables(toEnsName);
			const resolvedAddress = await doENSLookup(toSelectedAddress, network);
			if (resolvedAddress) {
				const checksummedResolvedAddress = toChecksumAddress(resolvedAddress);
				toAddressName = toSelectedAddress;
				toSelectedAddress = resolvedAddress;
				toSelectedAddressReady = true;
				if (!networkAddressBook[checksummedResolvedAddress] && !identities[checksummedResolvedAddress]) {
					addToAddressToAddressBook = true;
				}
			} else {
				addressError = strings('transaction.could_not_resolve_ens');
			}
		} else if (toSelectedAddress && toSelectedAddress.length >= 42) {
			addressError = strings('transaction.invalid_address');
		}
		this.setState({
			addressError,
			toSelectedAddress,
			addToAddressToAddressBook,
			toSelectedAddressReady,
			toSelectedAddressName: toAddressName,
			toEnsName,
			errorContinue,
			isOnlyWarning,
			confusableCollection
		});
	};

	toggleFromAccountModal = () => {
		const { fromAccountModalVisible } = this.state;
		this.setState({ fromAccountModalVisible: !fromAccountModalVisible });
	};

	toggleAddToAddressBookModal = () => {
		const { addToAddressBookModalVisible } = this.state;
		this.setState({ addToAddressBookModalVisible: !addToAddressBookModalVisible });
	};

	onAccountChange = async accountAddress => {
		const { identities, ticker, accounts, selectedAsset } = this.props;
		const { name } = identities[accountAddress];
		const { PreferencesController } = Engine.context;
		const fromAccountBalance = `${fromTokenMinimalUnitString(
			accounts[accountAddress].balance.toString(10),
			selectedAsset.decimals
		)} ${getTicker(ticker)}`;
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

	onToSelectedAddressChange = async toSelectedAddress => {
		/^0x[0-9a-fA-Z]{0,40}$/.test(toSelectedAddress) || toSelectedAddress === '' || toSelectedAddress === '0'
			? this.setState({
					isValidInputAddress: true
			  })
			: this.setState({
					isValidInputAddress: false
			  });
		const { AssetsContractController } = Engine.context;
		const { addressBook, network, identities, providerType } = this.props;
		const networkAddressBook = addressBook[network] || {};
		let addressError, toAddressName, toEnsName, errorContinue, isOnlyWarning, confusableCollection;
		let [addToAddressToAddressBook, toSelectedAddressReady] = [false, false];
		if (isValidAddress(toSelectedAddress)) {
			const checksummedToSelectedAddress = toChecksumAddress(toSelectedAddress);
			toSelectedAddressReady = true;
			const ens = await doENSReverseLookup(toSelectedAddress);
			if (ens) {
				toAddressName = ens;
				if (!networkAddressBook[checksummedToSelectedAddress] && !identities[checksummedToSelectedAddress]) {
					addToAddressToAddressBook = true;
				}
			} else if (networkAddressBook[checksummedToSelectedAddress] || identities[checksummedToSelectedAddress]) {
				toAddressName =
					(networkAddressBook[checksummedToSelectedAddress] &&
						networkAddressBook[checksummedToSelectedAddress].name) ||
					(identities[checksummedToSelectedAddress] && identities[checksummedToSelectedAddress].name);
			} else {
				// If not in address book nor user accounts
				addToAddressToAddressBook = true;
			}

			// Check if it's token contract address on mainnet
			const networkId = NetworkList[providerType].networkId;
			if (networkId === 1) {
				try {
					const symbol = await AssetsContractController.getAssetSymbol(toSelectedAddress);
					if (symbol) {
						addressError = (
							<Text>
								<Text>{strings('transaction.tokenContractAddressWarning_1')}</Text>
								<Text bold>{strings('transaction.tokenContractAddressWarning_2')}</Text>
								<Text>{strings('transaction.tokenContractAddressWarning_3')}</Text>
							</Text>
						);
						errorContinue = true;
					}
				} catch (e) {
					// Not a token address
				}
			}

			/**
			 * Not using this for now; Import isSmartContractAddress from utils/transaction and use this for checking smart contract: await isSmartContractAddress(toSelectedAddress);
			 * Check if it's smart contract address
			 */
			/*
			const smart = false; //

			if (smart) {
				addressError = strings('transaction.smartContractAddressWarning');
				isOnlyWarning = true;
			}
			*/
		} else if (isENS(toSelectedAddress)) {
			toEnsName = toSelectedAddress;
			confusableCollection = collectConfusables(toEnsName);
			const resolvedAddress = await doENSLookup(toSelectedAddress, network);
			if (resolvedAddress) {
				const checksummedResolvedAddress = toChecksumAddress(resolvedAddress);
				toAddressName = toSelectedAddress;
				toSelectedAddress = resolvedAddress;
				toSelectedAddressReady = true;
				if (!networkAddressBook[checksummedResolvedAddress] && !identities[checksummedResolvedAddress]) {
					addToAddressToAddressBook = true;
				}
			} else {
				addressError = strings('transaction.could_not_resolve_ens');
			}
		} else if (toSelectedAddress && toSelectedAddress.length >= 42) {
			addressError = strings('transaction.invalid_address');
		}
		this.setState({
			addressError,
			toSelectedAddress,
			addToAddressToAddressBook,
			toSelectedAddressReady,
			toSelectedAddressName: toAddressName,
			toEnsName,
			errorContinue,
			isOnlyWarning,
			confusableCollection
		});
	};

	validateToAddress = async () => {
		const { toSelectedAddress, fromSelectedAddress } = this.state;
		const { network } = this.props;
		let addressError;
		if (isENS(toSelectedAddress)) {
			const resolvedAddress = await doENSLookup(toSelectedAddress, network);
			if (!resolvedAddress) {
				addressError = strings('transaction.could_not_resolve_ens');
			}
		} else if (!isValidAddress(toSelectedAddress)) {
			addressError = strings('transaction.invalid_address');
		} else if (fromSelectedAddress == toSelectedAddress) {
			addressError = strings('transaction.can_not_send_same_account');
		}
		this.setState({ addressError });
		return addressError;
	};

	onToClear = () => {
		this.onToSelectedAddressChange();
	};

	onChangeAlias = alias => {
		this.setState({ alias });
	};

	onSaveToAddressBook = () => {
		const { network } = this.props;
		const { toSelectedAddress, alias } = this.state;
		const { AddressBookController } = Engine.context;
		AddressBookController.set(toSelectedAddress, alias, network);
		this.toggleAddToAddressBookModal();
		this.setState({ toSelectedAddressName: alias, addToAddressToAddressBook: false, alias: undefined });
	};

	onScan = () => {
		this.setState({ isScanQR: true });
	};

	onQRScan = res => {
		this.setState({ isScanQR: false });
		const content = res.data;
		if (!content) {
			showError(strings('address_book.unrecognized_qr_code'));
			return;
		}
		if (content.split('ethereum:').length > 1 && !parse(content).function_name) {
			let data = parse(content);
			const action = 'send-eth';
			data = { ...data, action };
			if (data.target_address) {
				this.onToSelectedAddressChange(data.target_address);
			}
			return;
		}
		if (content.split('ethereum:').length > 1) {
			const handledByDeeplink = SharedDeeplinkManager.parse(content, {
				origin: AppConstants.DEEPLINKS.ORIGIN_QR_CODE,
				onHandled: () => this.props.navigation.pop(2)
			});
			return;
		}
		showError(strings('address_book.unrecognized_qr_code'));
	};

	onTransactionDirectionSet = async () => {
		const { setRecipient, navigation, providerType } = this.props;
		const {
			fromSelectedAddress,
			toSelectedAddress,
			toEnsName,
			toSelectedAddressName,
			fromAccountName,
			balanceIsZero
		} = this.state;
		const addressError = await this.validateToAddress();
		if (addressError) return;
		if (balanceIsZero) return;
		setRecipient(fromSelectedAddress, toSelectedAddress, toEnsName, toSelectedAddressName, fromAccountName);
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEventWithParameters(ANALYTICS_EVENT_OPTS.SEND_FLOW_ADDS_RECIPIENT, {
				network: providerType
			});
		});
		navigation.navigate('Amount');
	};

	renderAddToAddressBookModal = () => {
		const { addToAddressBookModalVisible, alias } = this.state;
		return (
			<ActionModal
				modalVisible={addToAddressBookModalVisible}
				confirmText={strings('address_book.save')}
				cancelText={strings('address_book.cancel')}
				onCancelPress={this.toggleAddToAddressBookModal}
				onRequestClose={this.toggleAddToAddressBookModal}
				onConfirmPress={this.onSaveToAddressBook}
				cancelButtonMode={'normal'}
				confirmButtonMode={'confirm'}
				confirmDisabled={!alias}
			>
				<View style={styles.addToAddressBookRoot}>
					<View style={styles.addToAddressBookWrapper} testID={'add-address-modal'}>
						<View style={baseStyles.flexGrow}>
							<Text style={styles.addTextTitle}>{strings('address_book.add_to_address_book')}</Text>
							<Text style={styles.addTextSubtitle}>{strings('address_book.enter_an_alias')}</Text>
							<View style={styles.addInputWrapper}>
								<View style={styles.input}>
									<TrackingTextInput
										autoFocus
										autoCapitalize="none"
										autoCorrect={false}
										onChangeText={this.onChangeAlias}
										placeholder={strings('address_book.enter_an_alias_placeholder')}
										placeholderTextColor={colors.grey100}
										spellCheck={false}
										style={styles.addTextInput}
										numberOfLines={1}
										onBlur={this.onBlur}
										onFocus={this.onInputFocus}
										onSubmitEditing={this.onFocus}
										value={alias}
										testID={'address-alias-input'}
									/>
								</View>
							</View>
						</View>
					</View>
				</View>
			</ActionModal>
		);
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

	onToInputFocus = () => {
		const { toInputHighlighted } = this.state;
		this.setState({ toInputHighlighted: !toInputHighlighted });
	};

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
			<>
				{'\n'}
				<Text bold style={styles.buyEth} onPress={this.goToBuy}>
					{strings('fiat_on_ramp.buy_eth', { appName: displayName })}
				</Text>
			</>
		);
	};

	render = () => {
		const { ticker } = this.props;
		const { addressBook, network } = this.props;
		const {
			fromSelectedAddress,
			fromAccountName,
			fromAccountBalance,
			toSelectedAddress,
			toSelectedAddressReady,
			toSelectedAddressName,
			addToAddressToAddressBook,
			addressError,
			balanceIsZero,
			toInputHighlighted,
			inputWidth,
			errorContinue,
			isOnlyWarning,
			confusableCollection,
			isScanQR,
			isValidInputAddress
		} = this.state;

		const checksummedAddress = toSelectedAddress && toChecksumAddress(toSelectedAddress);
		const existingContact = checksummedAddress && addressBook[network] && addressBook[network][checksummedAddress];
		const displayConfusableWarning = !existingContact && confusableCollection && !!confusableCollection.length;
		const displayAsWarning =
			confusableCollection && confusableCollection.length && !confusableCollection.some(hasZeroWidthPoints);

		return (
			<SafeAreaView style={styles.wrapper} testID={'send-screen'}>
				<OnboardingScreenWithBg screen={'a'}>
					<View style={styles.inputWrapper}>
						<AddressFrom
							// onPressIcon={this.toggleFromAccountModal}
							fromAccountAddress={fromSelectedAddress}
							fromAccountName={fromAccountName}
							fromAccountBalance={fromAccountBalance}
						/>
						<AddressTo
							inputRef={this.addressToInputRef}
							highlighted={toInputHighlighted}
							addressToReady={toSelectedAddressReady}
							toSelectedAddress={toSelectedAddress}
							toAddressName={toSelectedAddressName}
							onToSelectedAddressChange={this.onToSelectedAddressChange}
							onScan={this.onScan}
							onClear={this.onToClear}
							onInputFocus={this.onToInputFocus}
							onInputBlur={this.onToInputFocus}
							onSubmit={this.onTransactionDirectionSet}
							inputWidth={inputWidth}
							confusableCollection={(!existingContact && confusableCollection) || []}
						/>
						{!isValidInputAddress && !toSelectedAddressReady && (
							<Text style={styles.warning}>{strings('address_book.unrecognized_public_address')}</Text>
						)}
					</View>
					{!toSelectedAddressReady ? (
						<AddressList
							inputSearch={toSelectedAddress}
							onAccountPress={this.onToSelectedAddressChangeDirect}
							onAccountLongPress={dummy}
						/>
					) : (
						<View style={styles.nextActionWrapper}>
							<TrackingScrollView>
								{addressError && (
									<View style={styles.addressErrorWrapper} testID={'address-error'}>
										<ErrorMessage
											errorMessage={addressError}
											errorContinue={!!errorContinue}
											onContinue={this.onTransactionDirectionSet}
											isOnlyWarning={!!isOnlyWarning}
										/>
									</View>
								)}
								{displayConfusableWarning && (
									<View style={[styles.confusabeError, displayAsWarning && styles.confusabeWarning]}>
										<View style={styles.warningIcon}>
											<Icon
												size={16}
												color={displayAsWarning ? colors.black : colors.red}
												name="exclamation-triangle"
											/>
										</View>
										<View>
											<Text style={[styles.confusableTitle, displayAsWarning && styles.black]}>
												{strings('transaction.confusable_title')}
											</Text>
											<Text style={[styles.confusableMsg, displayAsWarning && styles.black]}>
												{strings('transaction.confusable_msg')}
											</Text>
										</View>
									</View>
								)}
								{addToAddressToAddressBook && (
									<TouchableOpacity
										style={styles.myAccountsTouchable}
										onPress={this.toggleAddToAddressBookModal}
										testID={'add-address-button'}
									>
										<Text style={styles.myAccountsText}>
											{strings('address_book.add_this_address')}
										</Text>
									</TouchableOpacity>
								)}
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
							</TrackingScrollView>
							<View style={styles.footerContainer} testID={'no-eth-message'}>
								{!errorContinue && (
									<View style={styles.buttonNextWrapper}>
										<StyledButton
											type={'normal'}
											containerStyle={styles.buttonNext}
											onPress={this.onTransactionDirectionSet}
											testID={'address-book-next-button'}
											disabled={balanceIsZero}
										>
											{strings('address_book.next')}
										</StyledButton>
									</View>
								)}
							</View>
						</View>
					)}
					<ReactNativeModal visible={isScanQR} style={{ height: '120%' }}>
						<QRScanner
							onBarCodeRead={e => this.onQRScan(e)}
							onClose={() => {
								this.setState({ isScanQR: false });
							}}
						/>
					</ReactNativeModal>
					{this.renderFromAccountModal()}
					{this.renderAddToAddressBookModal()}
				</OnboardingScreenWithBg>
			</SafeAreaView>
		);
	};
}

const mapStateToProps = state => ({
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	addressBook: state.engine.backgroundState.AddressBookController.addressBook,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	selectedAsset: state.transaction.selectedAsset,
	identities: state.engine.backgroundState.PreferencesController.identities,
	keyrings: state.engine.backgroundState.KeyringController.keyrings,
	ticker: state.engine.backgroundState.NetworkController.provider.ticker,
	network: state.engine.backgroundState.NetworkController.network,
	providerType: state.engine.backgroundState.NetworkController.provider.type
});

const mapDispatchToProps = dispatch => ({
	setRecipient: (from, to, ensRecipient, transactionToName, transactionFromName) =>
		dispatch(setRecipient(from, to, ensRecipient, transactionToName, transactionFromName)),
	newAssetTransaction: selectedAsset => dispatch(newAssetTransaction(selectedAsset)),
	setSelectedAsset: selectedAsset => dispatch(setSelectedAsset(selectedAsset))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(SendFlow);
