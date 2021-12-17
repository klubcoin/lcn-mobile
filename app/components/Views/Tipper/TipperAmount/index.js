import React, { PureComponent } from 'react';
import {
    SafeAreaView,
    TextInput,
    Text,
    StyleSheet,
    View,
    TouchableOpacity,
    KeyboardAvoidingView,
    InteractionManager
} from 'react-native';
import { connect } from 'react-redux';
import { getPaymentRequestOptionsTitle } from '../../../UI/Navbar';
import FeatherIcon from 'react-native-vector-icons/Feather';
import contractMap from '@metamask/contract-metadata';
import Fuse from 'fuse.js';
import AssetList from '../../../UI/PaymentRequest/AssetList';
import PropTypes from 'prop-types';
import {
    weiToFiat,
    toWei,
    balanceToFiat,
    renderFromWei,
    fiatNumberToWei,
    fromWei,
    isDecimal,
    fiatNumberToTokenMinimalUnit,
    renderFromTokenMinimalUnit,
    fromTokenMinimalUnit,
    toTokenMinimalUnit
} from '../../../../util/number';
import { strings } from '../../../../../locales/i18n';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import StyledButton from '../../../UI/StyledButton';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { generateETHLink, generateERC20Link, generateUniversalLinkRequest } from '../../../../util/payment-link-generator';
import Device from '../../../../util/Device';
import currencySymbols from '../../../../util/currency-symbols.json';
import { NetworksChainId } from '@metamask/controllers';
import { getTicker } from '../../../../util/transactions';
import { toLowerCaseCompare } from '../../../../util/general';
import styles from './styles/index';
import { baseStyles } from '../../../../styles/common';
import { colors, fontStyles } from '../../../../styles/common';
import TipperModal from '../TipperModal';
import CryptoSignature from '../../../../core/CryptoSignature';
import base64 from 'base-64';
import RNFS from 'react-native-fs';
import routes from '../../../../common/routes';

const KEYBOARD_OFFSET = 120;

const contractList = Object.entries(contractMap)
    .map(([address, tokenData]) => {
        tokenData.address = address;
        return tokenData;
    })
    .filter(tokenData => Boolean(tokenData.erc20));

const fuse = new Fuse(contractList, {
    shouldSort: true,
    threshold: 0.45,
    location: 0,
    distance: 100,
    maxPatternLength: 32,
    minMatchCharLength: 1,
    keys: [{ name: 'name', weight: 0.5 }, { name: 'symbol', weight: 0.5 }]
});

const defaultEth = {
    symbol: 'ETH',
    name: 'Ether',
    isETH: true
};
const defaultAssets = [
    defaultEth,
    {
        address: '0x89d24A6b4CcB1B6fAA2625fE562bDD9a23260359',
        decimals: 18,
        erc20: true,
        logo: 'sai.svg',
        name: 'Sai Stablecoin v1.0',
        symbol: 'SAI'
    }
];

const MODE_SELECT = 'select';
const MODE_AMOUNT = 'amount';

/**
 * View to generate a payment request link
 */
class TipperAmount extends PureComponent {
    static navigationOptions = ({ navigation }) =>
        getPaymentRequestOptionsTitle(strings('tipper.tipper'), navigation);

    static propTypes = {
        /**
         * Object that represents the navigator
         */
        navigation: PropTypes.object,
        /**
         * ETH-to-current currency conversion rate from CurrencyRateController
         */
        conversionRate: PropTypes.number,
        /**
         * Currency code for currently-selected currency from CurrencyRateController
         */
        currentCurrency: PropTypes.string,
        /**
         * Object containing token exchange rates in the format address => exchangeRate
         */
        contractExchangeRates: PropTypes.object,
        /**
         * Primary currency, either ETH or Fiat
         */
        primaryCurrency: PropTypes.string,
        /**
         * A string that represents the selected address
         */
        selectedAddress: PropTypes.string,
        /**
         * Array of ERC20 assets
         */
        tokens: PropTypes.array,
        /**
         * A string representing the chainId
         */
        chainId: PropTypes.string,
        /**
         * Current provider ticker
         */
        ticker: PropTypes.string
    };

    amountInput = React.createRef();

    state = {
        searchInputValue: '',
        results: [],
        selectedAsset: undefined,
        mode: MODE_SELECT,
        internalPrimaryCurrency: '',
        cryptoAmount: undefined,
        amount: undefined,
        secondaryAmount: undefined,
        symbol: undefined,
        showError: false,
        inputWidth: { width: '99%' },
        viewTipModal: false,
        tipData: {},
    };

    /**
     * Set chainId, internalPrimaryCurrency and receiveAssets, if there is an asset set to this payment request chose it automatically, to state
     */
    componentDidMount = () => {
        const { primaryCurrency, navigation } = this.props;
        const receiveAsset = navigation && navigation.getParam('receiveAsset', undefined);
        const tipData = navigation && navigation.getParam('tipData');

        if (tipData) {
            const parsedTipData = JSON.parse(base64.decode(tipData))
            const viewModal = Object.keys(parsedTipData).length > 0;
            this.setState({
                tipData: parsedTipData,
                viewTipModal: viewModal
            })
        }

        this.setState({
            internalPrimaryCurrency: primaryCurrency,
            inputWidth: { width: '100%' },
        });

        if (receiveAsset) {
            this.goToAmountInput(receiveAsset);
        }
    };

    componentDidUpdate = () => {
        InteractionManager.runAfterInteractions(() => {
            this.amountInput.current && this.amountInput.current.focus();
        });
    };

    /**
     * Go to asset selection view and modify navbar accordingly
     */
    goToAssetSelection = () => {
        const { navigation } = this.props;
        navigation && navigation.setParams({ mode: MODE_SELECT, dispatch: undefined });
        this.setState({
            mode: MODE_SELECT,
            amount: undefined,
            cryptoAmount: undefined,
            secondaryAmount: undefined,
            symbol: undefined
        });
    };

    /**
     * Go to enter amount view, with selectedAsset and modify navbar accordingly
     *
     * @param {object} selectedAsset - Asset selected to build the payment request
     */
    goToAmountInput = async selectedAsset => {
        const { navigation } = this.props;
        navigation && navigation.setParams({ mode: MODE_AMOUNT, dispatch: this.goToAssetSelection });
        await this.setState({ selectedAsset, mode: MODE_AMOUNT });
        this.updateAmount();
    };

    /**
     * Handle search input result
     *
     * @param {string} searchInputValue - String containing assets query
     */
    handleSearch = searchInputValue => {
        if (typeof searchInputValue !== 'string') {
            searchInputValue = this.state.searchInputValue;
        }

        const fuseSearchResult = fuse.search(searchInputValue);
        const addressSearchResult = contractList.filter(token => toLowerCaseCompare(token.address, searchInputValue));
        const results = [...addressSearchResult, ...fuseSearchResult];
        this.setState({ searchInputValue, results });
    };

    /**
     * Renders a view that allows user to select assets to build the payment request
     * Either top picks and user's assets are available to select
     */
    renderSelectAssets = () => {
        const { tokens, chainId, ticker } = this.props;
        const { inputWidth } = this.state;
        let results;

        if (chainId === '1') {
            results = this.state.searchInputValue ? this.state.results : defaultAssets;
        } else if (Object.values(NetworksChainId).find(value => value === chainId)) {
            results = [defaultEth];
        } else {
            results = [{ ...defaultEth, symbol: getTicker(ticker), name: '' }];
        }

        const userTokens = tokens.map(token => {
            const contract = contractList.find(contractToken => contractToken.address === token.address);
            if (contract) return contract;
            return token;
        });

        return (
            <View style={baseStyles.flexGrow} testID={'request-screen'}>
                <View>
                    <Text style={styles.title}>{strings('payment_request.choose_asset')}</Text>
                </View>
                {chainId === '1' && (
                    <View style={styles.searchWrapper}>
                        <TextInput
                            style={[styles.searchInput, inputWidth]}
                            autoCapitalize="none"
                            autoCorrect={false}
                            clearButtonMode="while-editing"
                            onChangeText={this.handleSearch}
                            onSubmitEditing={this.handleSearch}
                            placeholder={strings('payment_request.search_assets')}
                            placeholderTextColor={colors.grey400}
                            returnKeyType="go"
                            value={this.state.searchInputValue}
                            blurOnSubmit
                            testID={'request-search-asset-input'}
                        />
                        <FeatherIcon
                            onPress={this.focusInput}
                            name="search"
                            size={18}
                            color={colors.grey400}
                            style={styles.searchIcon}
                        />
                    </View>
                )}
                <View style={styles.assetsWrapper} testID={'searched-asset-results'}>
                    <Text style={styles.assetsTitle}>
                        {this.state.searchInputValue
                            ? strings('payment_request.search_results')
                            : strings('payment_request.search_top_picks')}
                    </Text>
                    <AssetList
                        searchResults={results}
                        handleSelectAsset={this.goToAmountInput}
                        selectedAsset={this.state.selectedAsset}
                        searchQuery={this.state.searchInputValue}
                        emptyMessage={strings('payment_request.search_no_tokens_found')}
                    />
                </View>
                {userTokens.length > 0 && (
                    <View style={styles.assetsWrapper}>
                        <Text style={styles.assetsTitle}>{strings('payment_request.your_tokens')}</Text>
                        <AssetList
                            searchResults={userTokens}
                            handleSelectAsset={this.goToAmountInput}
                            selectedAsset={this.state.selectedAsset}
                            searchQuery={this.state.searchInputValue}
                        />
                    </View>
                )}
            </View>
        );
    };

    /**
     * Handles payment request parameters for ETH as primaryCurrency
     *
     * @param {string} amount - String containing amount number from input, as token value
     * @returns {object} - Object containing respective symbol, secondaryAmount and cryptoAmount according to amount and selectedAsset
     */
    handleETHPrimaryCurrency = amount => {
        const { conversionRate, currentCurrency, contractExchangeRates } = this.props;
        const { selectedAsset } = this.state;
        let secondaryAmount;
        const symbol = selectedAsset.symbol;
        const undefAmount = (isDecimal(amount) && amount) || 0;
        const cryptoAmount = amount;
        const exchangeRate = selectedAsset && selectedAsset.address && contractExchangeRates[selectedAsset.address];

        if (selectedAsset.symbol !== 'ETH') {
            secondaryAmount = exchangeRate
                ? balanceToFiat(undefAmount, conversionRate, exchangeRate, currentCurrency)
                : undefined;
        } else {
            secondaryAmount = weiToFiat(toWei(undefAmount), conversionRate, currentCurrency);
        }
        return { symbol, secondaryAmount, cryptoAmount };
    };

    /**
     * Handles payment request parameters for Fiat as primaryCurrency
     *
     * @param {string} amount - String containing amount number from input, as fiat value
     * @returns {object} - Object containing respective symbol, secondaryAmount and cryptoAmount according to amount and selectedAsset
     */
    handleFiatPrimaryCurrency = amount => {
        const { conversionRate, currentCurrency, contractExchangeRates } = this.props;
        const { selectedAsset } = this.state;
        const symbol = currentCurrency;
        const exchangeRate = selectedAsset && selectedAsset.address && contractExchangeRates[selectedAsset.address];
        const undefAmount = (isDecimal(amount) && amount) || 0;
        let secondaryAmount, cryptoAmount;
        if (selectedAsset.symbol !== 'ETH' && (exchangeRate && exchangeRate !== 0)) {
            const secondaryMinimalUnit = fiatNumberToTokenMinimalUnit(
                undefAmount,
                conversionRate,
                exchangeRate,
                selectedAsset.decimals
            );
            secondaryAmount =
                renderFromTokenMinimalUnit(secondaryMinimalUnit, selectedAsset.decimals) + ' ' + selectedAsset.symbol;
            cryptoAmount = fromTokenMinimalUnit(secondaryMinimalUnit, selectedAsset.decimals);
        } else {
            secondaryAmount = renderFromWei(fiatNumberToWei(undefAmount, conversionRate)) + ' ' + strings('unit.eth');
            cryptoAmount = fromWei(fiatNumberToWei(undefAmount, conversionRate));
        }
        return { symbol, secondaryAmount, cryptoAmount };
    };

    /**
     * Handles amount update, setting amount related state parameters, it handles state according to internalPrimaryCurrency
     *
     * @param {string} amount - String containing amount number from input
     */
    updateAmount = amount => {
        const { internalPrimaryCurrency, selectedAsset } = this.state;
        const { conversionRate, contractExchangeRates, currentCurrency } = this.props;
        const currencySymbol = currencySymbols[currentCurrency];
        const exchangeRate = selectedAsset && selectedAsset.address && contractExchangeRates[selectedAsset.address];
        let res;
        // If primary currency is not crypo we need to know if there are conversion and exchange rates to handle0,
        // fiat conversion for the payment request
        if (internalPrimaryCurrency !== 'ETH' && conversionRate && (exchangeRate || selectedAsset.isETH)) {
            res = this.handleFiatPrimaryCurrency(amount && amount.replace(',', '.'));
        } else {
            res = this.handleETHPrimaryCurrency(amount && amount.replace(',', '.'));
        }
        const { cryptoAmount, symbol } = res;
        if (amount && amount[0] === currencySymbol) amount = amount.substr(1);
        if (res.secondaryAmount && res.secondaryAmount[0] === currencySymbol)
            res.secondaryAmount = res.secondaryAmount.substr(1);
        if (amount && amount === '0') amount = undefined;
        this.setState({ amount, cryptoAmount, secondaryAmount: res.secondaryAmount, symbol, showError: false });
    };

    /**
     * Updates internalPrimaryCurrency
     */
    switchPrimaryCurrency = async () => {
        const { internalPrimaryCurrency, secondaryAmount } = this.state;
        const primarycurrencies = {
            ETH: 'Fiat',
            Fiat: 'ETH'
        };
        await this.setState({ internalPrimaryCurrency: primarycurrencies[internalPrimaryCurrency] });
        this.updateAmount(secondaryAmount.split(' ')[0]);
    };

    /**
     * Resets amount on payment request
     */
    onReset = () => {
        this.updateAmount();
    };

    /**
     * Generates payment request link and redirects to PaymentRequestSuccess view with it
     * If there is an error, an error message will be set to display on the view
     */
    onNext = async () => {
        const { selectedAddress, identities, navigation, chainId } = this.props;
        const { cryptoAmount, selectedAsset } = this.state;
        const onRequest = navigation && navigation.getParam('onRequest', false);
        const account = identities[selectedAddress] || {};

        try {
            // let eth_link;
            // if (selectedAsset.isETH) {
            //     const amount = toWei(cryptoAmount).toString();
            //     eth_link = generateETHLink(selectedAddress, amount, chainId);
            // } else {
            //     const amount = toTokenMinimalUnit(cryptoAmount, selectedAsset.decimals).toString();
            //     eth_link = generateERC20Link(selectedAddress, selectedAsset.address, amount, chainId);
            // }

            // // Convert to universal link / app link
            // const link = generateUniversalLinkRequest(eth_link);
            const data = {
                recipient: account,
                amount: cryptoAmount,
                symbol: selectedAsset.symbol,
                meta: {
                    title: routes.mainNetWork.name,
                    chainId: routes.mainNetWork.chainId,
                    url: routes.mainNetWork.blockExploreUrl,
                    icon: 'logo.png',
                },
            };
            data.signature = await CryptoSignature.signMessage(selectedAddress, JSON.stringify(data));

            const base64Content = base64.encode(JSON.stringify(data));
            const link = `liquichain://tip?q=${base64Content}`

            const request = {
                link,
                qrLink: link,
                amount: cryptoAmount,
                symbol: selectedAsset.symbol
            };

            if (onRequest) {
                onRequest(request);
                navigation.pop();
            } else {
                navigation && navigation.replace('TipperDetails', request);
            }
        } catch (e) {
            this.setState({ showError: true });
        }
    };

    /**
     * Renders a view that allows user to set payment request amount
     */
    renderEnterAmount = () => {
        const { conversionRate, contractExchangeRates, currentCurrency, navigation } = this.props;
        const {
            amount,
            secondaryAmount,
            symbol,
            cryptoAmount,
            showError,
            selectedAsset,
            internalPrimaryCurrency
        } = this.state;
        const onRequest = navigation && navigation.getParam('onRequest', false);
        const currencySymbol = currencySymbols[currentCurrency];
        const exchangeRate = selectedAsset && selectedAsset.address && contractExchangeRates[selectedAsset.address];
        let switchable = true;
        if (!conversionRate) {
            switchable = false;
        } else if (selectedAsset.symbol !== 'ETH' && !exchangeRate) {
            switchable = false;
        }
        return (
            <View style={styles.enterAmountWrapper} testID={'request-amount-screen'}>
                <View>
                    <Text style={styles.title}>{strings('payment_request.enter_amount')}</Text>
                </View>
                <View style={styles.searchWrapper}>
                    <View style={styles.container}>
                        <View style={styles.ethContainer}>
                            <View style={styles.amounts}>
                                <View style={styles.split}>
                                    {internalPrimaryCurrency !== 'ETH' && (
                                        <Text style={styles.currencySymbol}>{currencySymbol}</Text>
                                    )}
                                    <TextInput
                                        autoCapitalize="none"
                                        autoCorrect={false}
                                        keyboardType="numeric"
                                        numberOfLines={1}
                                        onChangeText={this.updateAmount}
                                        placeholder={strings('payment_request.amount_placeholder')}
                                        placeholderTextColor={colors.grey100}
                                        spellCheck={false}
                                        style={styles.input}
                                        value={amount}
                                        onSubmitEditing={this.onNext}
                                        ref={this.amountInput}
                                        testID={'request-amount-input'}
                                    />
                                    <Text style={styles.eth} numberOfLines={1}>
                                        {symbol}
                                    </Text>
                                </View>
                                <View style={styles.secondaryAmount}>
                                    {secondaryAmount && internalPrimaryCurrency === 'ETH' && (
                                        <Text style={styles.currencySymbolSmall}>{currencySymbol}</Text>
                                    )}
                                    {secondaryAmount && (
                                        <Text style={styles.fiatValue} numberOfLines={1}>
                                            {secondaryAmount}
                                        </Text>
                                    )}
                                </View>
                            </View>
                            {switchable && (
                                <View style={styles.switchContainer}>
                                    <TouchableOpacity
                                        onPress={this.switchPrimaryCurrency}
                                        style={styles.switchTouchable}
                                    >
                                        <FontAwesome
                                            onPress={this.focusInput}
                                            name="exchange"
                                            size={18}
                                            color={colors.grey200}
                                            style={{ transform: [{ rotate: '270deg' }] }}
                                        />
                                    </TouchableOpacity>
                                </View>
                            )}
                        </View>
                    </View>
                    {showError && (
                        <View style={styles.errorWrapper}>
                            <Text style={styles.errorText}>{strings('payment_request.request_error')}</Text>
                        </View>
                    )}
                </View>
                <KeyboardAvoidingView
                    style={styles.buttonsWrapper}
                    behavior={'padding'}
                    keyboardVerticalOffset={KEYBOARD_OFFSET}
                    enabled={Device.isIos()}
                >
                    <View style={styles.buttonsContainer}>
                        <StyledButton type={'normal'} onPress={this.onReset} containerStyle={[styles.button]}>
                            {strings('payment_request.reset')}
                        </StyledButton>
                        <StyledButton
                            type={'blue'}
                            onPress={this.onNext}
                            containerStyle={[styles.button]}
                            disabled={!cryptoAmount || cryptoAmount === '0'}
                        >
                            {!!onRequest ? strings('payment_request.send') : strings('payment_request.next')}
                        </StyledButton>
                    </View>
                </KeyboardAvoidingView>
            </View>
        );
    };

    render() {
        const { mode, tipData, viewTipModal } = this.state;
        
        return (
            <SafeAreaView style={styles.wrapper}>
                <KeyboardAwareScrollView
                    style={styles.contentWrapper}
                    contentContainerStyle={styles.scrollViewContainer}
                >
                    {!viewTipModal && (mode === MODE_SELECT ? this.renderSelectAssets() : this.renderEnterAmount())}
                    <TipperModal 
                        visible={viewTipModal}
                        hideModal={()=> this.setState({viewTipModal: false})}
                        title={strings('contacts.friend_request')}
                        confirmLabel={strings('tipper.tip')}
                        cancelLabel={strings('contacts.reject')}
                        data={tipData}
                    />
                </KeyboardAwareScrollView>
            </SafeAreaView>
        );
    }
}

const mapStateToProps = state => ({
    conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate,
    currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
    contractExchangeRates: state.engine.backgroundState.TokenRatesController.contractExchangeRates,
    searchEngine: state.settings.searchEngine,
    selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
    identities: state.engine.backgroundState.PreferencesController.identities,
    onboardProfile: state.user.onboardProfile,
    tokens: state.engine.backgroundState.AssetsController.tokens,
    primaryCurrency: state.settings.primaryCurrency,
    ticker: state.engine.backgroundState.NetworkController.provider.ticker,
    chainId: state.engine.backgroundState.NetworkController.provider.chainId
});

export default connect(mapStateToProps)(TipperAmount);
