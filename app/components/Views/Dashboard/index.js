/* eslint-disable react-native/no-inline-styles */
import React, { PureComponent } from 'react';
import { RefreshControl, InteractionManager, ActivityIndicator, Text, View, TouchableOpacity } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { colors, baseStyles } from '../../../styles/common';
import { stripHexPrefix } from 'ethereumjs-util';
import { getWalletNavbarOptions } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import { weiToFiat, hexToBN, BNToHex, sumFloat, fromWei } from '../../../util/number';
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
import styles from './styles/index';
import CustomTabBar from '../../UI/CustomTabBar';
import Icon from 'react-native-vector-icons/FontAwesome';
import routes from '../../../common/routes';
import { toChecksumAddress } from 'ethereumjs-util';
import Erc20Service from '../../../core/Erc20Service';
import CryptoSignature from '../../../core/CryptoSignature';
import { Chart, VerticalAxis, HorizontalAxis, Line, Area } from 'react-native-responsive-linechart';
import moment from 'moment';
import infuraCurrencies from '../../../util/infura-conversion.json';
import Modal from 'react-native-modal';
import BigNumber from 'bignumber.js';
import TrackingScrollView from '../../UI/TrackingScrollView';

/**
 * Main view for the wallet
 */

// TODO: Remove this hardcode data.

export const SIGN_KEY = '0xb5b1870957d373ef0eeffecc6e4812c0fd08f554b37b233526acc331bf1544f7';

const timeline = ['1d', '1w', '1m', '6m', '1y', 'all'];
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
		totalToken: 0,
		chartData: [],
		selectedTimeline: '1d',
		selectedCurrency: '',
		isChangeCurrency: false,
		totalBalance: '0',
		isFetchingChartData: false
	};

	accountOverviewRef = React.createRef();

	mounted = false;

	fetchTotalTokens() {
		const accounts = this.getAccounts();
		let totalToken = '';
		for (let account of accounts) {
			totalToken = sumFloat(totalToken, account?.balance ? fromWei(hexToBN(account?.balance)) : '0');
		}
		const { chartData, isFetchingChartData } = this.state;
		if (chartData && chartData.length > 0 && !isFetchingChartData) {
			const bigNumberTotalToken = new BigNumber(totalToken);
			const totalBalance = bigNumberTotalToken.multipliedBy(chartData[chartData.length - 1].value);
			this.setState({ totalBalance });
		}
		this.setState({
			totalToken
		});
	}

	componentWillUpdate() {
		// this.fetchTotalTokens();
	}

	componentWillUnmount() {
		this.mounted = false;
		this.clearBalanceInterval();
		this.focusListener.remove();
	}

	clearBalanceInterval = () => {
		if (this.pollTokens) clearInterval(this.pollTokens);
	};

	pollTokenBalances = async () => {
		const { TokenBalancesController, AssetsContractController } = Engine.context;
		await TokenBalancesController.updateBalances();
		const { accounts } = this.props;
		Object.keys(accounts).forEach((accountAddress, index) => {
			AssetsContractController.getBalanceOf(routes.klubToken.address(), accountAddress)
				.then(balance => {
					if (accounts[accountAddress].balance !== BNToHex(balance)) {
						accounts[accountAddress].balance = BNToHex(balance);
					}
				})
				.then(() => {
					if (index === Object.keys(accounts).length - 1) {
						this.fetchTotalTokens();
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

	featchChartData = (selectCurrency, selectedTimeline) => {
		const toDate = new Date();
		let fromDate = null;
		switch (selectedTimeline) {
			case '1d':
				fromDate = new Date(moment().subtract(1, 'days'));
				break;
			case '1w':
				fromDate = new Date(moment().subtract(7, 'days'));
				break;
			case '1m':
				fromDate = new Date(moment().subtract(1, 'months'));
				break;
			case '6m':
				fromDate = new Date(moment().subtract(6, 'months'));
				break;
			case '1y':
				fromDate = new Date(moment().subtract(1, 'years'));
				break;
			case 'all':
				fromDate = new Date(moment().subtract(100, 'years'));
				break;
			default: {
				fromDate = new Date(moment().subtract(7, 'days'));
				break;
			}
		}
		APIService.getChartData('KLC', selectCurrency.toUpperCase(), fromDate, toDate, (success, json) => {
			if (success && json?.data) {
				this.setState({ chartData: json.data, isFetchingChartData: false });
			}
		});
	};

	componentDidMount = () => {
		const { currentCurrency } = this.props;
		const { selectedTimeline } = this.state;
		this.setState({
			selectedCurrency: currentCurrency
		});
		messageStore.setActiveChatPeerId(null);
		requestAnimationFrame(async () => {
			const { AssetsDetectionController, AccountTrackerController } = Engine.context;
			AssetsDetectionController.detectAssets();
			// AccountTrackerController.refresh();
			this.pollTokenBalances();
			this.getWalletInfo();
			this.mounted = true;
		});
		this.getCurrentConversion();
		this.announceOnline();
		this.addDefaultToken();
		this.addDefaultRpcList();
		this.featchChartData(currentCurrency, selectedTimeline);
		this.pollTokens = setInterval(() => this.pollTokenBalances(), 1000);
		this.focusListener = this.props.navigation.addListener('didFocus', () => {
			const { currentCurrency: newCurrentCurrency } = this.props;
			const { selectedTimeline: newSelectedTimeline, selectedCurrency } = this.state;
			if (selectedCurrency !== newCurrentCurrency) {
				this.setState({
					selectedCurrency: newCurrentCurrency,
					isFetchingChartData: true
				});
				this.featchChartData(newCurrentCurrency, newSelectedTimeline);
			}
		});
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
		const { symbol, decimals, image } = routes.klubToken;
		const address = routes.klubToken.address();
		if (address) {
			const exists = tokens.find(e => e.address == address);
			if (!exists) await AssetsController.addToken(address, symbol, decimals, image);
		}
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
		const lowerCaseSelectedAddress = selectedAddress.toLowerCase();
		const { PreferencesController } = Engine.context;
		const message = `walletInfo,${lowerCaseSelectedAddress},${new Date().getTime()}`;
		const sign = await CryptoSignature.signStringMessage(lowerCaseSelectedAddress, message);
		API.postRequest(
			Routes.walletInfo,
			[lowerCaseSelectedAddress, sign, message],
			response => {
				if (response.result) {
					const { name } = response.result;

					const { firstname, lastname, name: name2 } = response.result?.publicInfo
						? JSON.parse(response.result?.publicInfo)
						: {};
					const { emailAddress, phoneNumber } = response.result?.privateInfo
						? JSON.parse(response.result?.privateInfo)
						: {};

					const currentFirstname = firstname ?? name2 ? name2.split(' ')[0] : '';
					const currentLastname =
						lastname ?? name2
							? name2
									.split(' ')
									.slice(1, name2.split(' ').length)
									.join(' ')
							: '';

					PreferencesController.setAccountLabel(selectedAddress, name);
					preferences
						.getOnboardProfile()
						.then(value => {
							preferences.setOnboardProfile(
								Object.assign(value, {
									firstname: currentFirstname,
									lastname: currentLastname,
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

	onCloseModal = () => {
		this.setState({ isChangeCurrency: false });
	};

	sortedCurrencies = infuraCurrencies.objects.sort((a, b) =>
		a.quote.code.toLocaleLowerCase().localeCompare(b.quote.code.toLocaleLowerCase())
	);

	infuraCurrencyOptions = this.sortedCurrencies.map(({ quote: { code, name, symbol } }) => ({
		label: `${code.toUpperCase()} - ${name}`,
		key: code,
		value: code,
		symbol
	}));

	onChangeCurrency = currency => {
		const { selectedTimeline } = this.state;
		this.setState({ selectedCurrency: currency, isChangeCurrency: false, isFetchingChartData: true });
		this.featchChartData(currency, selectedTimeline);
	};

	onChangeTimeline = timeline => {
		const { selectedCurrency } = this.state;
		this.setState({ selectedTimeline: timeline, isFetchingChartData: true });
		this.featchChartData(selectedCurrency, timeline);
	};

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

	renderChart = () => {
		const { chartData, selectedCurrency } = this.state;
		if (!chartData || chartData.length === 0) return;
		const data = chartData.map(e => ({ x: e.timestamp, y: e.value }));
		const minY = Math.min(...data.map(e => e.y));
		const maxY = Math.max(...data.map(e => e.y));
		const CustomTooltip = props => {
			const { position, value: valueData } = props;
			const { x, y } = position;
			const { x: timestamp, y: value } = valueData;
			return (
				<>
					<View style={[styles.dataPointVerticalContainer, { left: x + 20 }]}>
						<View style={styles.dataPointVerticalWrapper}>
							<View style={styles.dataPointVerticalDasher} />
						</View>
					</View>
					<View style={[styles.dataPointWrapper, { top: y + 14, left: x + 14 }]}>
						<Icon name="circle-o" style={styles.dataPointIcon} />
					</View>
					<View
						style={[
							styles.dataViewWrapper,
							{
								top: y > 80 ? y - 80 : y + 40,
								left: x > 135 ? x - 135 : x
							}
						]}
					>
						<Text style={styles.dataViewTime}>{moment(timestamp).format('MMMM DD, YYYY hh:mm A')}</Text>
						<View style={styles.dataViewBalanceWrapper}>
							<Text style={styles.dataViewBalance}>{`${selectedCurrency.toUpperCase()} / ${
								Routes.klubToken.symbol
							}`}</Text>
							<Text style={styles.dataViewValue}>{`${
								this.infuraCurrencyOptions.find(e => e.key === selectedCurrency)?.symbol
							} ${value}`}</Text>
						</View>
					</View>
				</>
			);
		};
		return (
			<Chart
				style={{ width: '100%', height: 260 }}
				xDomain={{
					min: Math.min(...data.map(e => e.x)),
					max: Math.max(...data.map(e => e.x))
				}}
				yDomain={{
					min: minY,
					max: maxY
				}}
				config={{
					insetY: 10
				}}
				padding={{ left: 20, bottom: 20, top: 20 }}
			>
				<VerticalAxis
					tickCount={10}
					theme={{
						axis: { visible: false },
						ticks: { visible: false },
						grid: {
							stroke: {
								color: colors.white000,
								dashArray: [8]
							}
						},
						labels: { visible: false }
					}}
				/>
				<HorizontalAxis
					tickCount={15}
					theme={{
						axis: { visible: false },
						ticks: { visible: false },
						grid: {
							stroke: {
								color: colors.white000,
								dashArray: [8]
							}
						},
						labels: { visible: false }
					}}
				/>
				<Line
					data={data}
					smoothing="cubic-spline"
					theme={{
						stroke: {
							color: colors.blue,
							width: 2
						}
					}}
					tooltipComponent={<CustomTooltip />}
				/>
				<Area
					data={data}
					smoothing="cubic-spline"
					theme={{
						gradient: {
							from: { color: colors.blue, opacity: 0.5 },
							to: { color: colors.blue, opacity: 0 }
						}
					}}
				/>
			</Chart>
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

		const {
			currentConversion,
			selectedTimeline,
			selectedCurrency,
			isChangeCurrency,
			chartData,
			totalBalance,
			isFetchingChartData
		} = this.state;
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

					<View style={styles.totalBalanceCard}>
						<View style={styles.row}>
							<Text style={styles.cardTitle}>{strings('watch_asset_request.balance')}</Text>
							{chartData && chartData.length !== 0 && (
								<Text style={styles.extraCardTitle}>{`${
									chartData[chartData.length - 1].percentChange
								}%`}</Text>
							)}
						</View>
						<View style={[styles.cardContent, styles.row]}>
							<Text style={styles.totalBalanceText}>{`${
								this.infuraCurrencyOptions.find(e => e.key === selectedCurrency)?.symbol
							}${totalBalance}`}</Text>
							<TouchableOpacity
								style={styles.arrowIconButton}
								activeOpacity={0.7}
								onPress={() => {
									this.setState({
										isChangeCurrency: true
									});
								}}
							>
								<Icon name="chevron-down" size={12} color={colors.white} style={styles.arrowIcon} />
							</TouchableOpacity>
							{/* <Text style={styles.comingSoon}>{balanceFiat}</Text> */}
							{/* <Text style={styles.comingSoon}>{strings('coming_soon.coming_soon')}</Text> */}
						</View>
					</View>
				</View>

				{this.renderTitle(strings('dashboard.chart'))}

				{/* //TODO: Wait to implement API for real data and feature */}
				<View style={styles.chartContainer}>
					<View style={styles.chartHeader}>
						<View style={styles.chartTimelineWrapper}>
							{timeline.map(e => (
								<TouchableOpacity
									activeOpacity={0.7}
									style={styles.chartTimelineButton}
									onPress={() => {
										this.onChangeTimeline(e);
									}}
								>
									<Text
										style={[
											styles.chartTimelineText,
											e === selectedTimeline && styles.chartSelectedTimelineText
										]}
									>
										{e}
									</Text>
								</TouchableOpacity>
							))}
						</View>
						<TouchableOpacity
							onPress={() => {
								this.setState({
									isChangeCurrency: true
								});
							}}
							style={styles.currencyWrapper}
							activeOpacity={0.7}
						>
							<Text style={styles.currencyText}>{selectedCurrency.toUpperCase()}</Text>
							<Icon name="chevron-down" style={styles.currencyIcon} />
						</TouchableOpacity>
					</View>
					<View style={styles.chartWrapper}>
						{chartData && chartData.length !== 0 && !isFetchingChartData ? (
							this.renderChart()
						) : (
							<View style={styles.activityIndicatorWrapper}>
								<ActivityIndicator size={'small'} color={'white'} />
							</View>
						)}
					</View>
				</View>

				{/* Action button */}
				<View style={styles.btnWrapper}>
					<TouchableOpacity
						style={styles.btn}
						activeOpacity={0.7}
						onPress={() => {
							this.props.navigation.navigate('PurchaseMethods');
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
				<Modal
					isVisible={isChangeCurrency}
					animationIn="slideInUp"
					animationOut="slideOutDown"
					style={styles.modalContainer}
					backdropOpacity={0.7}
					animationInTiming={600}
					animationOutTiming={600}
					swipeDirection={'down'}
					propagateSwipe
					onBackdropPress={this.onCloseModal}
					onBackButtonPress={this.onCloseModal}
				>
					<View style={styles.modalWrapper}>
						<TrackingScrollView style={styles.modalScrollView}>
							{this.infuraCurrencyOptions.map(e => (
								<TouchableOpacity
									style={styles.modalItemContainer}
									onPress={() => this.onChangeCurrency(e.value)}
								>
									<Text>{e.label}</Text>
									{selectedCurrency === e.value && (
										<Icon style={styles.modalItemIcon} name={'check'} />
									)}
								</TouchableOpacity>
							))}
						</TrackingScrollView>
					</View>
				</Modal>
			</View>
		);
	}

	renderLoader() {
		return (
			<View style={styles.loader}>
				<ActivityIndicator size="small" color={colors.white} />
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
				<TrackingScrollView
					style={styles.wrapper}
					refreshControl={
						<RefreshControl refreshing={this.state.refreshing} onRefresh={this.pollTokenBalances} />
					}
				>
					{this.props.selectedAddress && this.props.accounts ? this.renderContent() : this.renderLoader()}
				</TrackingScrollView>
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
