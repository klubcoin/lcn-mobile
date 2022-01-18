import React, { PureComponent } from 'react';
import {
    RefreshControl,
    ScrollView,
    InteractionManager,
    ActivityIndicator,
    StyleSheet,
    View,
    ImageBackground
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import DefaultTabBar from 'react-native-scrollable-tab-view/DefaultTabBar';
import { colors, fontStyles, baseStyles } from '../../../styles/common';
import AccountOverview from '../../UI/AccountOverview';
import Tokens from '@UI/Tokens';
import { stripHexPrefix } from 'ethereumjs-util';
import { getWalletNavbarOptions } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import { renderFromWei, weiToFiat, hexToBN } from '../../../util/number';
import Engine from '../../../core/Engine';
import CollectibleContracts from '../../UI/CollectibleContracts';
import Analytics from '../../../core/Analytics';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import { getTicker } from '../../../util/transactions';
import OnboardingWizard from '../../UI/OnboardingWizard';
import { showTransactionNotification, hideCurrentNotification } from '../../../actions/notification';
import ErrorBoundary from '../ErrorBoundary';
import API from 'services/api';
import Routes from 'common/routes';
import APIService from '../../../services/APIService';
import { setOnlinePeerWallets } from '../../../actions/contacts';
import messageStore from '../Message/store';
import preferences from '../../../store/preferences';
import Device from '../../../util/Device';
import styles from './styles/index';
import CustomTabBar from '../../UI/CustomTabBar'

/**
 * Main view for the wallet
 */
class Wallet extends PureComponent {
	static navigationOptions = ({ navigation }) => getWalletNavbarOptions('wallet.title', navigation);

    static propTypes = {
        /**
         * Map of accounts to information objects including balances
         */
        accounts: PropTypes.object,
        /**
         * ETH to current currency conversion rate
         */
        conversionRate: PropTypes.number,
        /**
         * Currency code of the currently-active currency
         */
        currentCurrency: PropTypes.string,
        /**
        /* navigation object required to push new views
        */
        navigation: PropTypes.object,
        /**
         * An object containing each identity in the format address => account
         */
        identities: PropTypes.object,
        /**
         * A string that represents the selected address
         */
        selectedAddress: PropTypes.string,
        /**
         * An array that represents the user tokens
         */
        tokens: PropTypes.array,
        /**
         * An array that represents the user collectibles
         */
        collectibles: PropTypes.array,
        /**
         * Current provider ticker
         */
        ticker: PropTypes.string,
        /**
         * Current onboarding wizard step
         */
        wizardStep: PropTypes.number
    };

    state = {
        refreshing: false,
        currentConversion: null
    };

    accountOverviewRef = React.createRef();

    mounted = false;

    componentDidMount = () => {
        messageStore.setActiveChatPeerId(null);
        requestAnimationFrame(async () => {
            const { AssetsDetectionController, AccountTrackerController } = Engine.context;
            AssetsDetectionController.detectAssets();
            // AccountTrackerController.refresh();
            this.getBalance();
            this.getWalletInfo();
            this.mounted = true;
        });
        this.getCurrentConversion();
        this.announceOnline();
    };

    announceOnline() {
        const { selectedAddress, updateOnlinePeerWallets } = this.props;
        const peerId = stripHexPrefix(selectedAddress);

        APIService.announcePeerOnlineStatus(peerId, (success, json) => {
            if (success && json.peers) {
                updateOnlinePeerWallets(json.peers);
            }
        });
    }

    async getWalletInfo() {
        const { selectedAddress } = this.props;
        const { PreferencesController } = Engine.context;

        API.postRequest(
            Routes.walletInfo,
            [selectedAddress],
            response => {
                if (response.result) {
                    const { name, publicInfo } = response.result;
                    PreferencesController.setAccountLabel(selectedAddress, name);
                    preferences.getOnboardProfile()
                        .then(value => preferences.setOnboardProfile(Object.assign(value, { publicInfo })))
                        .catch(e => console.log('profile onboarding error', e));
                }
            },
            error => {
                console.warn('error wallet info', error);
            }
        );
    }

    getCurrentConversion = () => {
        API.getRequest(
            Routes.getConversions,
            response => {
                if (response.data.length > 0) {
                    this.setState({
                        currentConversion: response.data[0].to
                    });
                }
            },
            error => {
                console.log(error);
            }
        );
    };

    onRefresh = async () => {
        requestAnimationFrame(async () => {
            this.setState({ refreshing: true });
            const {
                AssetsDetectionController,
                AccountTrackerController,
                CurrencyRateController,
                TokenRatesController
            } = Engine.context;
            const actions = [
                AssetsDetectionController.detectAssets(),
                AccountTrackerController.refresh(),
                CurrencyRateController.start(),
                TokenRatesController.poll()
            ];
            await Promise.all(actions);
            this.setState({ refreshing: false });
        });
    };

    getBalance = async () => {
        const { accounts, selectedAddress, identities } = this.props;
        // for(const account in accounts){
        let params = [selectedAddress];
        await API.postRequest(
            Routes.getBalance,
            params,
            response => {
                // console.log(parseInt(response.result, 16))
                const balance = response.result;
                accounts[selectedAddress] = {
                    balance: balance,
                    conversion: this.state.currentConversion
                };
                const { AccountTrackerController } = Engine.context;
                AccountTrackerController.update({ accounts: Object.assign({}, accounts) });
            },
            error => {
                console.log(error.message);
            }
        );
        // }
    };

    componentWillUnmount() {
        this.mounted = false;
    }

    renderTabBar() {
        return (
            <CustomTabBar
                underlineStyle={styles.tabUnderlineStyle}
                activeTextColor={colors.white}
                inactiveTextColor={colors.fontTertiary}
                backgroundColor={colors.transparent}
                tabStyle={styles.tabStyle}
                textStyle={styles.textStyle}
            />
        );
    }

    onChangeTab = obj => {
        InteractionManager.runAfterInteractions(() => {
            if (obj.ref.props.tabLabel === strings('wallet.tokens')) {
                Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_TOKENS);
            } else {
                Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_COLLECTIBLES);
            }
        });

    };

    onRef = ref => {
        this.accountOverviewRef = ref;
    };

    renderContent() {
        const {
            accounts,
            conversionRate,
            currentCurrency,
            identities,
            selectedAddress,
            tokens,
            collectibles,
            navigation,
            ticker
        } = this.props;

        const { currentConversion } = this.state;

        //TODO: need to remove fixed code for TIPPER app
        const tipper = {
            "image": "https://user-images.githubusercontent.com/16066404/77041853-a2044100-69e0-11ea-8da6-d64822a2c72a.jpg",
            "name": "Tipper",
            "address": "0x8a61a394-7813-1234-9797-ee8016b1356d-test",
            "application": {
                "creationDate": 1636070400000,
                "description": "Tipper app",
                "hexCode": "4321123412341234123412341234123412344366-test",
                "iconUrl": "https://user-images.githubusercontent.com/16066404/77041853-a2044100-69e0-11ea-8da6-d64822a2c72a.jpg",
                "name": "Tipper",
                "shortCode": "Tipper",
                "uuid": "7fe9443a-203a-48a2-a8f4-61118fafe738-test",
                "version": "1.0"
            },
            "description": "Get a tip from community",
            "iconUrl": "https://user-images.githubusercontent.com/16066404/77041853-a2044100-69e0-11ea-8da6-d64822a2c72a.jpg",
            "instance": {
                "description": "Get a tip from community",
                "iconUrl": "https://docs.liquichain.io/media/app/liquimart.png",
                "name": "Tipper",
                "uuid": "8a61a394-7813-4046-9797-ee8016b1356d-test"
            },
            "name": "Tipper",
            "uuid": "8a61a394-7813-4046-9797-ee8016b1356d-test"
        };

        let balance = 0;
        let assets = tokens;
        if (selectedAddress && accounts) {
            balance = accounts[selectedAddress].balance;
            // balance = "0x00"
            assets = [
                {
                    name: 'Liquichain',
                    symbol: getTicker(ticker),
                    isETH: true,
                    balance,
                    balanceFiat: weiToFiat(hexToBN(balance), currentConversion?.value, currentConversion?.currency),
                    logo: '../images/logo.png'
                },
                tipper,
                ...tokens
            ];
        } else {
            assets = tokens;
        }

        console.log({
            accounts
        });

        const account = { address: selectedAddress, ...identities[selectedAddress], ...accounts[selectedAddress] };

        return (
            <View style={styles.wrapper}>
                {selectedAddress && account && (
                    <AccountOverview account={account} navigation={navigation} onRef={this.onRef} />
                )}
                <View style={styles.tabWrapper}>
                    <ScrollableTabView
                        renderTabBar={this.renderTabBar}
                        // eslint-disable-next-line react/jsx-no-bind
                        onChangeTab={obj => this.onChangeTab(obj)}
                    >
                        <Tokens navigation={navigation} tabLabel={'TOKENS'} tokens={assets} />
                        <CollectibleContracts
                            navigation={navigation}
                            tabLabel={strings('wallet.collectibles')}
                            collectibles={collectibles}
                        />
                    </ScrollableTabView>
                </View>

            </View>
        );
    }

    renderLoader() {
        return (
            <View style={styles.loader}>
                <ActivityIndicator size="small" />
            </View>
        );
    }

    /**
     * Return current step of onboarding wizard if not step 5 nors 0
     */
    renderOnboardingWizard = () => {
        const { wizardStep } = this.props;
        return (
            [1, 2, 3, 4].includes(wizardStep) && (
                <OnboardingWizard navigation={this.props.navigation} coachmarkRef={this.accountOverviewRef} />
            )
        );
    };

    render = () => (
        <ErrorBoundary view="Wallet">
            <View style={baseStyles.flexGrow} testID={'wallet-screen'}>
                <ScrollView
                    style={styles.wrapper}
                    refreshControl={<RefreshControl refreshing={this.state.refreshing} onRefresh={this.getBalance} />}
                >
                    {this.props.selectedAddress && this.props.accounts ? this.renderContent() : this.renderLoader()}
                </ScrollView>
                {this.renderOnboardingWizard()}
            </View>
        </ErrorBoundary>
    );
}

const mapStateToProps = state => ({
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate,
	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
	identities: state.engine.backgroundState.PreferencesController.identities,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	tokens: state.engine.backgroundState.AssetsController.tokens,
	collectibles: state.engine.backgroundState.AssetsController.collectibles,
	ticker: state.engine.backgroundState.NetworkController.provider.ticker,
	wizardStep: state.wizard.step
});

const mapDispatchToProps = dispatch => ({
	showTransactionNotification: args => dispatch(showTransactionNotification(args)),
	hideCurrentNotification: () => dispatch(hideCurrentNotification()),
	updateOnlinePeerWallets: peers => dispatch(setOnlinePeerWallets(peers))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Wallet);
