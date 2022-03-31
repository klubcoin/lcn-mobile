import React, { PureComponent } from 'react';
import {
	RefreshControl,
	ScrollView,
	InteractionManager,
	ActivityIndicator,
	Text,
	View,
	TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { colors, baseStyles } from '../../../styles/common';
import { stripHexPrefix } from 'ethereumjs-util';
import { getWalletNavbarOptions } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import {
	weiToFiat,
	hexToBN,
	BNToHex,
	renderFromTokenMinimalUnitNumber,
	fromTokenMinimalUnit,
	sumFloat,
	fromWei
} from '../../../util/number';
import Engine from '../../../core/Engine';
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
import CustomTabBar from '../../UI/CustomTabBar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { LineChart } from 'react-native-chart-kit';
import routes from '../../../common/routes';
import { toChecksumAddress } from 'ethereumjs-util';
import Erc20Service from '../../../core/Erc20Service';
import CryptoSignature from '../../../core/CryptoSignature';

/**
 * Main view for the wallet
 */

// TODO: Remove this hardcode data.
const DummyData = [
	10 * 100,
	20 * 100,
	40 * 100,
	40 * 100,
	40 * 100,
	14 * 100,
	40 * 100,
	40 * 100,
	40 * 100,
	50 * 100,
	40 * 100,
	100 * 100,
	40 * 100,
	40 * 100
];
const CurrenIndex = 5;
export const SIGN_KEY = '0xb5b1870957d373ef0eeffecc6e4812c0fd08f554b37b233526acc331bf1544f7';

class Dashboard extends PureComponent {
	static navigationOptions = ({ navigation }) => getWalletNavbarOptions('dashboard.title', navigation);

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
		currentConversion: null,
		totalToken: 0
	};

	accountOverviewRef = React.createRef();

	mounted = false;

	fetchTotalTokens() {
		const accounts = this.getAccounts();
		let totalToken = '0';
		for (let account of accounts) {
			totalToken = sumFloat(totalToken, account?.balance ? fromWei(hexToBN(account?.balance)) : '0');
		}
		this.setState({
			totalToken
		});
	}

	componentWillUpdate() {
		this.fetchTotalTokens();
	}

	componentWillUnmount() {
		this.clearBalanceInterval();
	}

	clearBalanceInterval = () => {
		if (this.pollTokens) clearInterval(this.pollTokens);
	};

	pollTokenBalances = async () => {
		const { TokenBalancesController, AssetsContractController } = Engine.context;
		await TokenBalancesController.updateBalances();
		const { accounts } = this.props;
		Object.keys(accounts).forEach(accountAddress => {
			AssetsContractController.getBalanceOf(routes.klubToken.address, accountAddress)
				.then(balance => {
					if (accounts[accountAddress].balance !== BNToHex(balance)) {
						accounts[accountAddress].balance = BNToHex(balance);
					}
				})
				.catch(err => console.error(err));
		});
	};

	getAccounts() {
		const { accounts, identities, keyrings, getBalanceError } = this.props;
		const allKeyrings = keyrings && keyrings.length ? keyrings : Engine.context.KeyringController.state.keyrings;

		const accountsOrdered = allKeyrings.reduce((list, keyring) => list.concat(keyring.accounts), []);

		if (accounts) {
			return accountsOrdered
				.filter(address => !!identities[toChecksumAddress(address)])
				.map((addr, index) => {
					const checksummedAddress = toChecksumAddress(addr);
					const identity = identities[checksummedAddress];
					const { address } = identity;
					const identityAddressChecksummed = toChecksumAddress(address);
					let balance = 0x0;
					if (accounts[identityAddressChecksummed]) {
						balance = accounts[identityAddressChecksummed]
							? accounts[identityAddressChecksummed]?.balance
							: null;
					}

					const balanceError = getBalanceError ? getBalanceError(balance) : null;
					return {
						index,
						address: identityAddressChecksummed,
						balance,
						balanceError
					};
				});
		}
	}

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
		this.addDefaultToken();
		this.addDefaultRpcList();
		this.pollTokens = setInterval(() => this.pollTokenBalances(), 300);
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

	componentDidUpdate = prevProps => {
		if (this.props != prevProps) {
			this.addDefaultToken();
		}
	};

	addDefaultToken = async () => {
		const { AssetsController } = Engine.context;
		const { tokens } = Engine.state.AssetsController;
		const { address, symbol, decimals, image } = routes.klubToken;
		const exists = tokens.find(e => e.address == address);
		if (!exists) await AssetsController.addToken(address, symbol, decimals, image);
	};

	addDefaultRpcList = () => {
		const { PreferencesController } = Engine.context;
		const { rpcUrl, chainId, symbol } = routes.klubToken;
		const { name, blockExplorerUrl } = routes.mainNetWork;

		PreferencesController.addToFrequentRpcList(rpcUrl, chainId, symbol, name, { blockExplorerUrl });
	};

	async getWalletInfo() {
		const accounts = this.getAccounts();
		const selectedAddress = accounts[0].address;
		const { PreferencesController } = Engine.context;
		const message = `walletInfo,${selectedAddress},${new Date().getTime()}`;
		const sign = await CryptoSignature.signStringMessage(selectedAddress, message)
		API.postRequest(
			Routes.walletInfo,
			[selectedAddress, sign, message],
			response => {
				if (response.result) {
					const { name } = response.result;

					const { name: name2 } = response.result?.publicInfo ? JSON.parse(response.result?.publicInfo) : {};
					const { emailAddress, phoneNumber } = response.result?.privateInfo
						? JSON.parse(response.result?.privateInfo)
						: {};
					PreferencesController.setAccountLabel(selectedAddress, name);
					preferences
						.getOnboardProfile()
						.then(value => {
							preferences.setOnboardProfile(
								Object.assign(value, {
									firstname: name2 ? name2.split(' ')[0] : '',
									lastname: name2
										? name2
												.split(' ')
												.slice(1, name2.split(' ').length)
												.join(' ')
										: '',
									email: emailAddress?.value,
									phone: phoneNumber?.value,
									emailVerified: emailAddress?.verified === 'true',
									phoneVerified: phoneNumber?.verified
								})
							);
						})
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
		const { AccountTrackerController } = Engine.context;
		const { accounts, selectedAddress } = this.props;

		const balance = await new Erc20Service().getBalance(selectedAddress);
		accounts[selectedAddress] = {
			balance,
			conversion: this.state.currentConversion
		};
		AccountTrackerController.update({ accounts: { ...accounts } });

		// const { accounts, selectedAddress, identities } = this.props;
		// // for(const account in accounts){
		// let params = [selectedAddress];
		// await API.postRequest(
		// 	Routes.getBalance,
		// 	params,
		// 	response => {
		// 		// console.log(parseInt(response.result, 16))
		// 		const balance = response.result;
		// 		accounts[selectedAddress] = {
		// 			balance: balance,
		// 			conversion: this.state.currentConversion
		// 		};
		// 		const { AccountTrackerController } = Engine.context;
		// 		AccountTrackerController.update({ accounts: Object.assign({}, accounts) });
		// 	},
		// 	error => {
		// 		console.log(error.message);
		// 	}
		// );
		// // }
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

	renderTitle = title => {
		return (
			<View style={styles.title}>
				<Text style={styles.titleText}>{title}</Text>
			</View>
		);
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
			image:
				'https://user-images.githubusercontent.com/16066404/77041853-a2044100-69e0-11ea-8da6-d64822a2c72a.jpg',
			name: 'Tipper',
			address: '0x8a61a394-7813-1234-9797-ee8016b1356d-test',
			application: {
				creationDate: 1636070400000,
				description: 'Tipper app',
				hexCode: '4321123412341234123412341234123412344366-test',
				iconUrl:
					'https://user-images.githubusercontent.com/16066404/77041853-a2044100-69e0-11ea-8da6-d64822a2c72a.jpg',
				name: 'Tipper',
				shortCode: 'Tipper',
				uuid: '7fe9443a-203a-48a2-a8f4-61118fafe738-test',
				version: '1.0'
			},
			description: 'Get a tip from community',
			iconUrl:
				'https://user-images.githubusercontent.com/16066404/77041853-a2044100-69e0-11ea-8da6-d64822a2c72a.jpg',
			instance: {
				description: 'Get a tip from community',
				iconUrl: 'https://docs.liquichain.io/media/app/liquimart.png',
				name: 'Tipper',
				uuid: '8a61a394-7813-4046-9797-ee8016b1356d-test'
			},
			name: 'Tipper',
			uuid: '8a61a394-7813-4046-9797-ee8016b1356d-test'
		};

		let balance = 0;
		let assets = tokens;
		if (selectedAddress && accounts) {
			balance = accounts[selectedAddress]?.balance;
			// balance = "0x00"
			assets = [
				{
					name: 'Liquichain',
					symbol: getTicker(ticker),
					isETH: true,
					balance,
					balanceFiat: weiToFiat(hexToBN(balance), currentConversion?.value, currentConversion?.currency),
					logo: '../images/klubcoin.png'
				},
				tipper,
				...tokens
			];
		} else {
			assets = tokens;
		}

		// const account = { address: selectedAddress, ...identities[selectedAddress], ...accounts[selectedAddress] };
		const balanceFiat = weiToFiat(hexToBN(balance || 0), conversionRate, currentCurrency);

		return (
			<View style={styles.wrapper}>
				{/* Dashboard */}
				{this.renderTitle(strings('dashboard.title'))}

				{/* Dashboard Content */}
				<View style={styles.row}>
					<View style={styles.card}>
						<View style={styles.row}>
							<Text style={styles.cardTitle}>{strings('watch_asset_request.token')}</Text>
							{/* <Text style={styles.extraCardTitle}>+2,4%</Text> */}
						</View>
						<View style={styles.cardContent}>
							<Text style={styles.balance}>
								{`${this.state.totalToken} `}
								<Text style={styles.currency}>{Routes.klubToken.symbol}</Text>
							</Text>
						</View>
					</View>

					<View style={[styles.card, { marginRight: 0 }]}>
						<View style={styles.row}>
							<Text style={styles.cardTitle}>{strings('watch_asset_request.balance')}</Text>
							{/* <Text style={styles.extraCardTitle}>+2,4%</Text> */}
						</View>
						<View style={[styles.cardContent, styles.row]}>
							{/* <Text style={[styles.balance, { paddingRight: 15 }]}>
                                $100,000,000
                            </Text>
                            <Icon name="chevron-down" size={12} color={colors.white} style={styles.arrowIcon} /> */}
							{/* <Text style={styles.comingSoon}>{balanceFiat}</Text> */}
							<Text style={styles.comingSoon}>{strings('coming_soon.coming_soon')}</Text>
						</View>
					</View>
				</View>

				{/* Chart */}
				{this.renderTitle(strings('dashboard.chart'))}

				{/* //TODO: Wait to implement API for real data and feature */}
				<View style={styles.chartBox}>
					<Text style={styles.comingSoon}>{strings('receive_request.coming_soon')}</Text>
					{/* <LineChart
						onDataPointClick={({ index, dateSet }) => {
							console.log(
								'🚀 ~ file: index.js ~ line 415 ~ Dashboard ~ renderContent ~ dateSet',
								dateSet
							);
							console.log(index);
						}}
						data={{
							datasets: [
								{
									data: DummyData
								}
							]
						}}
						width={Device.getDeviceWidth() - 35 * 2}
						height={Device.getDeviceWidth() - 35 * 2}
						withOuterLines={false}
						withHorizontalLabels={false}
						fromZero={true}
						segments={Math.round(DummyData.length / 2)}
						hidePointsAtIndex={[...Array(DummyData.length).keys()].filter(i => i != CurrenIndex)}
						chartConfig={{
							color: (opacity = 1) => colors.blue,
							labelColor: (opacity = 1) => `rgba(255, 255, 255, ${opacity})`,
							backgroundGradientFrom: colors.purple,
							backgroundGradientTo: colors.purple,
							fillShadowGradient: colors.blue,
							fillShadowGradientOpacity: 0.4,
							strokeWidth: 1.4,
							propsForDots: {
								stroke: colors.white,
								strokeWidth: 2,
								fill: colors.black
							},
							propsForBackgroundLines: {
								strokeDasharray: 5,
								strokeDashoffset: 1,
								stroke: colors.white000
							}
						}}
						style={{
							paddingRight: 5,
							paddingBottom: -35 * 2
						}}
					/> */}
				</View>

				{/* Action button */}
				<View style={styles.btnWrapper}>
					<TouchableOpacity
						style={styles.btn}
						activeOpacity={0.7}
						onPress={() => {
							this.props.navigation.navigate('ComingSoon');
						}}
					>
						<Text style={styles.btnText}>{strings('dashboard.buy_more')}</Text>
					</TouchableOpacity>
				</View>

				<View style={styles.btnWrapper}>
					<TouchableOpacity
						style={styles.btn}
						activeOpacity={0.7}
						onPress={() => {
							this.props.navigation.navigate('Partners');
						}}
					>
						<Text style={styles.btnText}>{strings('dashboard.spend_coin')}</Text>
					</TouchableOpacity>
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
				{/* {this.renderOnboardingWizard()} */}
			</View>
		</ErrorBoundary>
	);
}

const mapStateToProps = state => ({
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate,
	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
	keyrings: state.engine.backgroundState.KeyringController.keyrings,
	identities: state.engine.backgroundState.PreferencesController.identities,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	tokens: state.engine.backgroundState.AssetsController.tokens,
	collectibles: state.engine.backgroundState.AssetsController.collectibles,
	ticker: state.engine.backgroundState.NetworkController.provider.ticker,
	tokenBalances: state.engine.backgroundState.TokenBalancesController.contractBalances,
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
)(Dashboard);
