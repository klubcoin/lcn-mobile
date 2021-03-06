import React, { PureComponent } from 'react';
import { colors, fontStyles } from '../../../../styles/common';
import {
	StyleSheet,
	Text,
	SafeAreaView,
	View,
	TouchableOpacity,
	KeyboardAvoidingView,
	FlatList,
	InteractionManager
} from 'react-native';
import { connect } from 'react-redux';
import { setSelectedAsset, prepareTransaction, setTransactionObject } from '../../../../actions/transaction';
import { getSendFlowTitle } from '../../../UI/Navbar';
import StyledButton from '../../../UI/StyledButton';
import PropTypes from 'prop-types';
import Ionicons from 'react-native-vector-icons/Ionicons';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Modal from 'react-native-modal';
import TokenImage from '../../../UI/TokenImage';
import {
	renderFromTokenMinimalUnit,
	balanceToFiat,
	renderFromWei,
	weiToFiat,
	fromWei,
	toWei,
	isDecimal,
	toTokenMinimalUnit,
	fiatNumberToWei,
	fiatNumberToTokenMinimalUnit,
	weiToFiatNumber,
	balanceToFiatNumber,
	getCurrencySymbol,
	handleWeiNumber,
	fromTokenMinimalUnitString
} from '../../../../util/number';
import { getTicker, generateTransferData, getEther } from '../../../../util/transactions';
import { util } from '@metamask/controllers';
import ErrorMessage from '../ErrorMessage';
import { getGasPriceByChainId } from '../../../../util/custom-gas';
import Engine from '../../../../core/Engine';
import CollectibleMedia from '../../../UI/CollectibleMedia';
import collectiblesTransferInformation from '../../../../util/collectibles-transfer';
import { strings } from '../../../../../locales/i18n';
import Device from '../../../../util/Device';
import { BN } from 'ethereumjs-util';
import Analytics from '../../../../core/Analytics';
import { ANALYTICS_EVENT_OPTS } from '../../../../util/analytics';
import dismissKeyboard from 'react-native/Libraries/Utilities/dismissKeyboard';
import NetworkMainAssetLogo from '../../../UI/NetworkMainAssetLogo';
import { isMainNet } from '../../../../util/networks';
import { toLowerCaseCompare } from '../../../../util/general';
import Helper from 'common/Helper';
import Routes from 'common/routes';
import { BaseController } from '@metamask/controllers';
import API from 'services/api';
import OnboardingScreenWithBg from '../../../UI/OnboardingScreenWithBg';
import styles from './styles/index';
import Erc20Service from '../../../../core/Erc20Service';
import TrackingTextInput from '../../../UI/TrackingTextInput';
import TrackingScrollView from '../../../UI/TrackingScrollView';

const { hexToBN, BNToHex } = util;

const KEYBOARD_OFFSET = Device.isSmallDevice() ? 80 : 120;

/**
 * View that wraps the wraps the "Send" screen
 */
class Amount extends PureComponent {
	static navigationOptions = ({ navigation, screenProps }) =>
		getSendFlowTitle('send.amount', navigation, screenProps);

	static propTypes = {
		/**
		 * Map of accounts to information objects including balances
		 */
		accounts: PropTypes.object,
		/**
		 * Array of collectible objects
		 */
		collectibles: PropTypes.array,
		/**
		 * An array that represents the user collectible contracts
		 */
		collectibleContracts: PropTypes.array,
		/**
		 * Object containing token balances in the format address => balance
		 */
		contractBalances: PropTypes.object,
		/**
		 * ETH to current currency conversion rate
		 */
		conversionRate: PropTypes.number,
		/**
		 * Currency code of the currently-active currency
		 */
		currentCurrency: PropTypes.string,
		/**
		 * Object containing token exchange rates in the format address => exchangeRate
		 */
		contractExchangeRates: PropTypes.object,
		/**
		 * Object that represents the navigator
		 */
		navigation: PropTypes.object,
		/**
		 * A string that represents the selected address
		 */
		selectedAddress: PropTypes.string,
		/**
		 * An array that represents the user tokens
		 */
		tokens: PropTypes.array,
		/**
		 * Chain Id
		 */
		chainId: PropTypes.string,
		/**
		 * Current provider ticker
		 */
		ticker: PropTypes.string,
		/**
		 * Set selected in transaction state
		 */
		setSelectedAsset: PropTypes.func,
		/**
		 * Set transaction object to be sent
		 */
		prepareTransaction: PropTypes.func,
		/**
		 * Primary currency, either ETH or Fiat
		 */
		primaryCurrency: PropTypes.string,
		/**
		 * Selected asset from current transaction state
		 */
		selectedAsset: PropTypes.object,
		/**
		 * Current transaction state
		 */
		transactionState: PropTypes.object,
		/**
		 * Network provider type as mainnet
		 */
		providerType: PropTypes.string,
		/**
		 * Action that sets transaction attributes from object to a transaction
		 */
		setTransactionObject: PropTypes.func,
		/**
		 * function to call when the 'Next' button is clicked
		 */
		onConfirm: PropTypes.func
	};

	state = {
		amountError: undefined,
		inputValue: undefined,
		inputValueConversion: undefined,
		renderableInputValueConversion: undefined,
		assetsModalVisible: false,
		internalPrimaryCurrencyIsCrypto: this.props.primaryCurrency === 'ETH',
		estimatedTotalGas: undefined,
		hasExchangeRate: false,
		conversion: null,
		currentConversion: null,
		currentBalance: null
	};

	amountInput = React.createRef();
	tokens = [];
	collectibles = [];

	componentDidMount = async () => {
		const {
			tokens,
			ticker,
			transactionState: { readableValue },
			navigation,
			providerType,
			selectedAsset
		} = this.props;
		// For analytics
		navigation.setParams({ providerType });

		this.getCurrentConversion();
		this.getBalance();

		// this.tokens = [getEther(ticker), ...tokens];
		this.tokens = [...tokens];
		this.collectibles = this.processCollectibles();
		this.amountInput && this.amountInput.current && this.amountInput.current.focus();
		this.onInputChange && this.onInputChange(readableValue);

		const estimatedTotalGas = await this.estimateTransactionTotalGas();
		this.setState({
			estimatedTotalGas,
			inputValue: readableValue
		});
	};

	getCurrentConversion = () => {
		API.getRequest(
			Routes.getConversions,
			response => {
				if (response.data.length > 0) {
					console.log({
						currentConversion: response.data[1].to
					});
					this.setState({
						currentConversion: response.data[1].to
					});
				}
			},
			error => {
				console.log(error);
			}
		);
	};

	getBalance = async () => {
		const { selectedAsset } = this.props;
		// const { accounts, selectedAddress, identities, selectedAsset } = this.props;
		// // for(const account in accounts){
		// let params = [selectedAddress];
		// await API.postRequest(
		// 	Routes.getBalance,
		// 	params,
		// 	response => {
		// 		// console.log(parseInt(response.result, 16))
		// 		const balance = response.result;
		// 		accounts[selectedAddress] = {
		// 			balance: balance
		// 		};
		// 		const { AccountTrackerController } = Engine.context;
		// 		AccountTrackerController.update({ accounts: Object.assign({}, accounts) });
		// 		this.handleSelectedAssetBalance(selectedAsset);
		// 	},
		// 	error => {
		// 		console.log(error.message);
		// 	}
		// );
		// }
		this.handleSelectedAssetBalance(selectedAsset);
	};

	validateCollectibleOwnership = async () => {
		const { AssetsContractController } = Engine.context;
		const {
			transactionState: {
				selectedAsset: { address, tokenId }
			},
			selectedAddress
		} = this.props;
		try {
			const owner = await AssetsContractController.getOwnerOf(address, tokenId);
			const isOwner = toLowerCaseCompare(owner, selectedAddress);
			if (!isOwner) {
				return strings('transaction.invalid_collectible_ownership');
			}
			return undefined;
		} catch (e) {
			return false;
		}
	};

	onNext = async () => {
		const {
			navigation,
			selectedAsset,
			setSelectedAsset,
			transactionState: { transaction },
			providerType,
			onConfirm
		} = this.props;
		const {
			inputValue,
			inputValueConversion,
			internalPrimaryCurrencyIsCrypto,
			hasExchangeRate,
			maxFiatInput
		} = this.state;

		const convertInputValue =
			inputValue.split('.')[0] +
			(inputValue.split('.').length > 1 ? '.' + inputValue.split('.')[1].replace(/0*$/, '') : '');
		let value;
		if (internalPrimaryCurrencyIsCrypto || !hasExchangeRate) {
			value = convertInputValue;
		} else {
			value = inputValueConversion;
			if (maxFiatInput) {
				value = `${renderFromWei(
					fiatNumberToWei(handleWeiNumber(maxFiatInput), this.props.conversionRate),
					18
				)}`;
			}
		}
		if (value && value.includes(',')) {
			value = convertInputValue.replace(',', '.');
		}

		if (!selectedAsset.tokenId && this.validateAmount(value)) {
			return;
		} else if (selectedAsset.tokenId) {
			const invalidCollectibleOwnership = await this.validateCollectibleOwnership();
			if (invalidCollectibleOwnership) {
				this.setState({ amountError: invalidCollectibleOwnership });
				dismissKeyboard();
			}
		}
		if (transaction.value !== undefined) {
			this.updateTransaction(value);
		} else {
			await this.prepareTransaction(value);
		}

		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEventWithParameters(ANALYTICS_EVENT_OPTS.SEND_FLOW_ADDS_AMOUNT, { network: providerType });
		});

		setSelectedAsset(selectedAsset);
		if (onConfirm) {
			onConfirm();
		} else {
			navigation.navigate('Confirm');
		}
	};

	getCollectibleTranferTransactionProperties() {
		const {
			selectedAsset,
			transactionState: { transaction, transactionTo }
		} = this.props;

		const collectibleTransferTransactionProperties = {};

		const collectibleTransferInformation = collectiblesTransferInformation[selectedAsset.address.toLowerCase()];
		if (
			!collectibleTransferInformation ||
			(collectibleTransferInformation.tradable && collectibleTransferInformation.method === 'transferFrom')
		) {
			collectibleTransferTransactionProperties.data = generateTransferData('transferFrom', {
				fromAddress: transaction.from,
				toAddress: transactionTo,
				tokenId: selectedAsset.tokenId
			});
		} else if (collectibleTransferInformation.tradable && collectibleTransferInformation.method === 'transfer') {
			collectibleTransferTransactionProperties.data = generateTransferData('transfer', {
				toAddress: transactionTo,
				amount: selectedAsset.tokenId.toString(16)
			});
		}
		collectibleTransferTransactionProperties.to = selectedAsset.address;
		collectibleTransferTransactionProperties.value = '0x0';

		return collectibleTransferTransactionProperties;
	}

	updateTransaction = (value = 0) => {
		const {
			selectedAsset,
			transactionState: { transaction, transactionTo },
			setTransactionObject,
			selectedAddress
		} = this.props;
		const { networkFee } = this.state;

		const transactionObject = {
			...transaction,
			value: BNToHex(toWei(value)),
			selectedAsset,
			from: selectedAddress
		};

		if (networkFee) {
			const { gas, gasPrice } = networkFee;
			transactionObject.gas = gas;
			transactionObject.gasPrice = gasPrice;
		}

		if (selectedAsset.tokenId) {
			const collectibleTransferTransactionProperties = this.getCollectibleTranferTransactionProperties();
			transactionObject.data = collectibleTransferTransactionProperties.data;
			transactionObject.to = collectibleTransferTransactionProperties.to;
			transactionObject.value = collectibleTransferTransactionProperties.value;
		} else if (!selectedAsset.isETH) {
			const tokenAmount = toTokenMinimalUnit(value, selectedAsset.decimals);
			transactionObject.data = generateTransferData('transfer', {
				toAddress: transactionTo,
				amount: BNToHex(tokenAmount)
			});
			transactionObject.value = '0x0';
		}

		if (selectedAsset.erc20) {
			transactionObject.readableValue = value;
		}

		setTransactionObject(transactionObject);
	};

	prepareTransaction = async value => {
		const {
			prepareTransaction,
			selectedAsset,
			transactionState: { transaction, transactionTo }
		} = this.props;
		const { networkFee } = this.state;

		if (selectedAsset.isETH) {
			transaction.data = undefined;
			transaction.to = transactionTo;
			transaction.value = BNToHex(toWei(value));
		} else if (selectedAsset.tokenId) {
			const collectibleTransferTransactionProperties = this.getCollectibleTranferTransactionProperties();
			transaction.data = collectibleTransferTransactionProperties.data;
			transaction.to = collectibleTransferTransactionProperties.to;
			transaction.value = collectibleTransferTransactionProperties.value;
		} else {
			const tokenAmount = toTokenMinimalUnit(value, selectedAsset.decimals);
			transaction.data = generateTransferData('transfer', {
				toAddress: transactionTo,
				amount: BNToHex(tokenAmount)
			});
			transaction.to = selectedAsset.address;
			transaction.value = '0x0';
		}
		if (networkFee) {
			const { gas, gasPrice } = networkFee;
			transaction.gas = gas;
			transaction.gasPrice = gasPrice;
		}
		prepareTransaction(transaction);
	};

	/**
	 * Validates crypto value only
	 * Independent of current internalPrimaryCurrencyIsCrypto
	 *
	 * @param {string} - Crypto value
	 * @returns - Whether there is an error with the amount
	 */
	validateAmount = inputValue => {
		const { accounts, selectedAddress, contractBalances, selectedAsset } = this.props;
		const { estimatedTotalGas } = this.state;
		let weiBalance, weiInput, amountError;
		if (inputValue.split('.').length > 1 && inputValue.split('.')[1].replace(/0*$/, '').length > 18) {
			this.setState({ amountError: strings('transaction.error_decimal_amount') });
			return true;
		}
		try {
			if (isDecimal(inputValue)) {
				if (selectedAsset.isETH) {
					weiBalance = hexToBN(accounts[selectedAddress].balance);
					weiInput = toWei(inputValue).add(estimatedTotalGas);
				} else {
					weiBalance = contractBalances[selectedAsset.address];
					weiInput = toTokenMinimalUnit(inputValue, selectedAsset.decimals);
				}
				amountError = weiBalance.gte(weiInput) ? undefined : strings('transaction.insufficient');

				if (weiInput == '0') {
					amountError = strings('transaction.invalid_amount');
				}
			} else {
				amountError = strings('transaction.invalid_amount');
			}
			if (amountError) {
				this.setState({ amountError });
				dismissKeyboard();
			}
			return !!amountError;
		} catch (error) {
			amountError = error.toString();
			this.setState({ amountError });
			return !!amountError;
		}
	};

	getNetworkFee = async ({ from, to }) => {
		const { selectedAsset } = this.props;
		const result = await new Erc20Service().getFixedFee();
		const base = Math.pow(10, selectedAsset.decimals);
		const networkFee = {
			gas: hexToBN('0x1'),
			gasPrice: toWei(parseFloat(result) / base)
		};
		this.setState({ networkFee });
		return networkFee;
	};
	/**
	 * Estimate transaction gas with information available
	 */
	estimateTransactionTotalGas = async () => {
		const {
			transaction: { from },
			transactionTo
		} = this.props.transactionState;
		const { gas, gasPrice } = await this.getNetworkFee({
			from,
			to: transactionTo
		});

		return gas.mul(gasPrice);
	};

	useMax = () => {
		const {
			accounts,
			selectedAddress,
			contractBalances,
			selectedAsset,
			conversionRate,
			contractExchangeRates
		} = this.props;
		const { internalPrimaryCurrencyIsCrypto, estimatedTotalGas } = this.state;
		let input;
		if (selectedAsset.isETH) {
			const balanceBN = hexToBN(accounts[selectedAddress].balance);
			const realMaxValue = balanceBN.sub(estimatedTotalGas);
			const maxValue = balanceBN.isZero() || realMaxValue.isNeg() ? new BN(0) : realMaxValue;
			if (internalPrimaryCurrencyIsCrypto) {
				input = fromWei(maxValue);
			} else {
				input = `${weiToFiatNumber(maxValue, conversionRate)}`;
				this.setState({ maxFiatInput: `${weiToFiatNumber(maxValue, conversionRate, 12)}` });
			}
		} else {
			const exchangeRate = contractExchangeRates[selectedAsset.address];
			if (internalPrimaryCurrencyIsCrypto || !exchangeRate) {
				input = fromTokenMinimalUnitString(
					contractBalances[selectedAsset.address]?.toString(10),
					selectedAsset.decimals
				);
			} else {
				input = `${balanceToFiatNumber(
					fromTokenMinimalUnitString(
						contractBalances[selectedAsset.address]?.toString(10),
						selectedAsset.decimals
					),
					conversionRate,
					exchangeRate
				)}`;
			}
		}
		this.onInputChange(input, undefined, true);
	};

	onInputChange = (inputValue, selectedAsset, useMax) => {
		const { contractExchangeRates, conversionRate, currentCurrency, chainId, ticker } = this.props;
		const { internalPrimaryCurrencyIsCrypto, currentConversion } = this.state;
		let inputValueConversion, renderableInputValueConversion, hasExchangeRate, comma;
		// Remove spaces, text, special charactor,... from input
		inputValue =
			inputValue &&
			inputValue
				.replace(/[^\w.,]|_|[a-zA-Z]/g, '')
				.replace(/,/g, '.')
				.replace(/\./, '#')
				.replace(/\./g, '')
				.replace(/#/, '.');
		// Handle semicolon for other languages
		if (inputValue && inputValue.includes(',')) {
			comma = true;
			inputValue = inputValue.replace(',', '.');
		}
		const processedTicker = getTicker(ticker);
		const processedInputValue = inputValue && isDecimal(inputValue) ? handleWeiNumber(inputValue) : '0';
		selectedAsset = selectedAsset || this.props.selectedAsset;
		if (selectedAsset.isETH) {
			hasExchangeRate = isMainNet(chainId) ? !!conversionRate : false;
			if (internalPrimaryCurrencyIsCrypto) {
				// inputValueConversion = `${weiToFiatNumber(toWei(processedInputValue), conversionRate)}`;
				// renderableInputValueConversion = `${weiToFiat(
				// 	toWei(processedInputValue),
				// 	conversionRate,
				// 	currentCurrency
				// )}`;
			} else {
				// inputValueConversion = `${renderFromWei(fiatNumberToWei(processedInputValue, conversionRate))}`;
				// renderableInputValueConversion = `${inputValueConversion} ${processedTicker}`;
			}
		} else {
			const exchangeRate = contractExchangeRates[selectedAsset.address];
			hasExchangeRate = isMainNet(chainId) ? !!exchangeRate : false;
			// If !hasExchangeRate we have to handle crypto amount
			if (internalPrimaryCurrencyIsCrypto || !hasExchangeRate) {
				// inputValueConversion = `${balanceToFiatNumber(processedInputValue, conversionRate, exchangeRate)}`;
				// renderableInputValueConversion = `${balanceToFiat(
				// 	processedInputValue,
				// 	conversionRate,
				// 	exchangeRate,
				// 	currentCurrency
				// )}`;
			} else {
				// inputValueConversion = `${renderFromTokenMinimalUnit(
				// 	fiatNumberToTokenMinimalUnit(
				// 		processedInputValue,
				// 		conversionRate,
				// 		exchangeRate,
				// 		selectedAsset.decimals
				// 	),
				// 	selectedAsset.decimals
				// )}`;
				// renderableInputValueConversion = `${inputValueConversion} ${selectedAsset.symbol}`;
			}
		}

		if (comma) inputValue = inputValue && inputValue.replace('.', ',');
		inputValueConversion = inputValueConversion === '0' ? undefined : inputValueConversion;

		console.log({
			currentConversion
		});
		const conversionValue = currentConversion?.value || 2;
		this.setState({
			inputValue,
			inputValueConversion,
			renderableInputValueConversion: 'EUR ' + ((inputValue || 0) / conversionValue).toFixed(2),
			amountError: undefined,
			hasExchangeRate,
			maxFiatInput: !useMax && undefined
		});
	};

	toggleAssetsModal = () => {
		const { assetsModalVisible } = this.state;
		// this.setState({ assetsModalVisible: !assetsModalVisible });
	};

	handleSelectedAssetBalance = selectedAsset => {
		// const { accounts, selectedAddress, contractBalances, selectedAsset } = this.props;
		// if (accounts && accounts[selectedAddress]) {
		// 	this.setState({
		// 		currentBalance: `${Helper.demosToLiquichain(accounts[selectedAddress].balance)} ${selectedAsset.symbol}`
		// 	});
		const { accounts, selectedAddress, contractBalances } = this.props;
		const { address, decimals, symbol, isETH } = selectedAsset;
		let currentBalance;
		if (isETH) {
			currentBalance = `${renderFromWei(accounts[selectedAddress].balance)} ${symbol}`;
		} else {
			currentBalance = `${fromTokenMinimalUnitString(
				contractBalances[selectedAsset.address]?.toString(10),
				decimals
			)} ${symbol}`;
		}
		this.setState({ currentBalance: currentBalance });
	};

	pickSelectedAsset = selectedAsset => {
		this.toggleAssetsModal();
		this.props.setSelectedAsset(selectedAsset);
		if (!selectedAsset.tokenId) {
			this.onInputChange(undefined, selectedAsset);
			this.handleSelectedAssetBalance(selectedAsset);
			// Wait for input to mount first
			setTimeout(() => this.amountInput && this.amountInput.current && this.amountInput.current.focus(), 500);
		}
	};

	assetKeyExtractor = asset => {
		if (asset.tokenId) {
			return asset.address + asset.tokenId;
		}
		return asset.address;
	};

	renderToken = (token, index) => {
		const {
			accounts,
			chainId,
			selectedAddress,
			conversionRate,
			currentCurrency,
			contractBalances,
			contractExchangeRates
		} = this.props;
		let balance, balanceFiat;
		const { address, decimals, symbol } = token;
		if (token.isETH) {
			balance = renderFromWei(accounts[selectedAddress].balance);
			balanceFiat = isMainNet(chainId)
				? weiToFiat(hexToBN(accounts[selectedAddress].balance), conversionRate, currentCurrency)
				: null;
		} else {
			balance = renderFromTokenMinimalUnit(contractBalances[address], decimals);
			const exchangeRate = contractExchangeRates[address];
			balanceFiat = isMainNet(chainId)
				? balanceToFiat(balance, conversionRate, exchangeRate, currentCurrency)
				: null;
		}
		return (
			<TouchableOpacity
				key={index}
				style={styles.assetElementWrapper}
				// eslint-disable-next-line react/jsx-no-bind
				onPress={() => this.pickSelectedAsset(token)}
			>
				<View style={styles.assetElement}>
					{token.isETH ? (
						<NetworkMainAssetLogo big />
					) : (
						<TokenImage asset={token} iconStyle={styles.tokenImage} containerStyle={styles.tokenImage} />
					)}
					<View style={styles.assetInformationWrapper}>
						<Text style={styles.textAssetTitle}>{symbol}</Text>
						<View style={styles.assetBalanceWrapper}>
							<Text style={styles.textAssetBalance}>{balance}</Text>
							{!!balanceFiat && <Text style={styles.textAssetFiat}>{balanceFiat}</Text>}
						</View>
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	renderCollectible = (collectible, index) => {
		const { name } = collectible;
		return (
			<TouchableOpacity
				key={index}
				style={styles.assetElementWrapper}
				// eslint-disable-next-line react/jsx-no-bind
				onPress={() => this.pickSelectedAsset(collectible)}
			>
				<View style={styles.assetElement}>
					<CollectibleMedia
						small
						collectible={collectible}
						iconStyle={styles.tokenImage}
						containerStyle={styles.tokenImage}
					/>
					<View style={styles.assetInformationWrapper}>
						<Text style={styles.textAssetTitle}>{name}</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	renderAsset = props => {
		const { item: asset, index } = props;
		if (!asset.tokenId) {
			return this.renderToken(asset, index);
		}
		return this.renderCollectible(asset, index);
	};

	processCollectibles = () => {
		const { collectibleContracts } = this.props;
		const collectibles = [];
		this.props.collectibles
			.sort((a, b) => a.address < b.address)
			.forEach(collectible => {
				const address = collectible.address.toLowerCase();
				const isTradable =
					!collectiblesTransferInformation[address] || collectiblesTransferInformation[address].tradable;
				if (!isTradable) return;
				const collectibleContract = collectibleContracts.find(
					contract => contract.address.toLowerCase() === address
				);
				if (!collectible.name) collectible.name = collectibleContract.name;
				if (!collectible.image) collectible.image = collectibleContract.logo;
				collectibles.push(collectible);
			});
		return collectibles;
	};

	renderAssetsModal = () => {
		const { assetsModalVisible } = this.state;

		return (
			<Modal
				isVisible={assetsModalVisible}
				style={styles.bottomModal}
				onBackdropPress={this.toggleAssetsModal}
				onBackButtonPress={this.toggleAssetsModal}
				onSwipeComplete={this.toggleAssetsModal}
				swipeDirection={'down'}
				propagateSwipe
			>
				<SafeAreaView style={styles.assetsModalWrapper}>
					<View style={styles.titleWrapper}>
						<View style={styles.dragger} />
					</View>
					<FlatList
						data={[...this.tokens, ...this.collectibles]}
						keyExtractor={this.assetKeyExtractor}
						renderItem={this.renderAsset}
					/>
				</SafeAreaView>
			</Modal>
		);
	};

	switchCurrency = async () => {
		const { internalPrimaryCurrencyIsCrypto, inputValueConversion } = this.state;
		await this.setState({ internalPrimaryCurrencyIsCrypto: !internalPrimaryCurrencyIsCrypto });
		this.onInputChange(inputValueConversion);
	};

	renderTokenInput = () => {
		const {
			inputValue,
			renderableInputValueConversion,
			amountError,
			hasExchangeRate,
			internalPrimaryCurrencyIsCrypto,
			currentBalance
		} = this.state;
		// console.log({
		// 	currentBalance
		// });

		const { currentCurrency } = this.props;
		return (
			<View>
				<View style={styles.inputContainerWrapper}>
					<View style={styles.inputContainer}>
						{!internalPrimaryCurrencyIsCrypto && !!inputValue && (
							<Text style={styles.inputCurrencyText}>{`${getCurrencySymbol(currentCurrency)} `}</Text>
						)}
						<TrackingTextInput
							ref={this.amountInput}
							style={styles.textInput}
							placeholderTextColor={colors.fontSecondary}
							value={inputValue}
							onChangeText={this.onInputChange}
							keyboardType={'numeric'}
							placeholder={'0'}
							maxLength={256}
							testID={'txn-amount-input'}
						/>
					</View>
				</View>
				{hasExchangeRate && (
					<View style={styles.actionsWrapper}>
						<View style={styles.action}>
							<TouchableOpacity style={styles.actionSwitch} onPress={this.switchCurrency}>
								<Text style={styles.textSwitch} numberOfLines={1}>
									{renderableInputValueConversion}
								</Text>
								<View styles={styles.switchWrapper}>
									<MaterialCommunityIcons
										name="swap-vertical"
										size={16}
										color={colors.blue}
										style={styles.switch}
									/>
								</View>
							</TouchableOpacity>
						</View>
					</View>
				)}
				{currentBalance && (
					<View style={styles.balanceWrapper}>
						<Text style={styles.balanceText}>{`${strings('transaction.balance')}: ${currentBalance}`}</Text>
					</View>
				)}

				{amountError && (
					<View style={styles.errorMessageWrapper} testID={'amount-error'}>
						<ErrorMessage errorMessage={amountError} />
					</View>
				)}
			</View>
		);
	};

	renderCollectibleInput = () => {
		const { selectedAsset } = this.props;
		return (
			<View style={styles.collectibleInputWrapper}>
				<View style={styles.collectibleInputImageWrapper}>
					<CollectibleMedia
						small
						containerStyle={styles.CollectibleMedia}
						iconStyle={styles.CollectibleMedia}
						collectible={selectedAsset}
					/>
				</View>
				<View style={styles.collectibleInputInformationWrapper}>
					<Text style={styles.collectibleName}>{selectedAsset.name}</Text>
					<Text style={styles.collectibleId}>{`#${selectedAsset.tokenId}`}</Text>
				</View>
			</View>
		);
	};

	render = () => {
		const { estimatedTotalGas } = this.state;
		const {
			selectedAsset,
			transactionState: { isPaymentRequest }
		} = this.props;

		return (
			<OnboardingScreenWithBg screen="a">
				<SafeAreaView style={styles.wrapper} testID={'amount-screen'}>
					<TrackingScrollView style={styles.scrollWrapper}>
						<View style={styles.inputWrapper}>
							<View style={styles.actionsWrapper}>
								<View style={styles.actionBorder} />
								<View style={styles.action}>
									<TouchableOpacity
										style={styles.actionDropdown}
										disabled={isPaymentRequest}
										onPress={this.toggleAssetsModal}
									>
										<Text style={styles.textDropdown}>
											{selectedAsset.symbol || strings('wallet.collectible')}
										</Text>
										<View styles={styles.arrow}>
											<Ionicons
												name="ios-arrow-down"
												size={16}
												color={colors.white}
												style={styles.iconDropdown}
											/>
										</View>
									</TouchableOpacity>
								</View>
								<View style={[styles.actionBorder, styles.actionMax]}>
									{!selectedAsset.tokenId && (
										<TouchableOpacity
											style={styles.actionMaxTouchable}
											disabled={!estimatedTotalGas}
											onPress={this.useMax}
										>
											<Text style={styles.maxText}>{strings('transaction.use_max')}</Text>
										</TouchableOpacity>
									)}
								</View>
							</View>
							{selectedAsset.tokenId ? this.renderCollectibleInput() : this.renderTokenInput()}
						</View>
					</TrackingScrollView>

					<KeyboardAvoidingView
						style={styles.nextActionWrapper}
						behavior={'padding'}
						keyboardVerticalOffset={KEYBOARD_OFFSET}
						enabled={Device.isIos()}
					>
						<View style={styles.buttonNextWrapper}>
							<StyledButton
								type={'normal'}
								containerStyle={styles.buttonNext}
								disabled={!estimatedTotalGas}
								onPress={this.onNext}
								testID={'txn-amount-next-button'}
							>
								{strings('transaction.next')}
							</StyledButton>
						</View>
					</KeyboardAvoidingView>
					{this.renderAssetsModal()}
				</SafeAreaView>
			</OnboardingScreenWithBg>
		);
	};
}

const mapStateToProps = (state, ownProps) => ({
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	contractBalances: state.engine.backgroundState.TokenBalancesController.contractBalances,
	contractExchangeRates: state.engine.backgroundState.TokenRatesController.contractExchangeRates,
	collectibles: state.engine.backgroundState.AssetsController.collectibles,
	collectibleContracts: state.engine.backgroundState.AssetsController.collectibleContracts,
	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
	conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate,
	providerType: state.engine.backgroundState.NetworkController.provider.type,
	primaryCurrency: state.settings.primaryCurrency,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	chainId: state.engine.backgroundState.NetworkController.provider.chainId,
	ticker: state.engine.backgroundState.NetworkController.provider.ticker,
	tokens: state.engine.backgroundState.AssetsController.tokens,
	transactionState: ownProps.transaction || state.transaction,
	selectedAsset: state.transaction.selectedAsset
});

const mapDispatchToProps = dispatch => ({
	setTransactionObject: transaction => dispatch(setTransactionObject(transaction)),
	prepareTransaction: transaction => dispatch(prepareTransaction(transaction)),
	setSelectedAsset: selectedAsset => dispatch(setSelectedAsset(selectedAsset))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Amount);
