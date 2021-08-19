import React, { PureComponent } from 'react';
import { RefreshControl, ScrollView, InteractionManager, ActivityIndicator, StyleSheet, View } from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import DefaultTabBar from 'react-native-scrollable-tab-view/DefaultTabBar';
import { colors, fontStyles, baseStyles } from '../../../styles/common';
import AccountOverview from '../../UI/AccountOverview';
import Tokens from '@UI/Tokens';
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
import API from 'services/api'
import Routes from 'common/routes';
import { BaseController } from '@metamask/controllers';
import Helper from 'common/Helper'
const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: colors.white
	},
	tabUnderlineStyle: {
		height: 2,
		backgroundColor: colors.blue
	},
	tabStyle: {
		paddingBottom: 0
	},
	textStyle: {
		fontSize: 12,
		letterSpacing: 0.5,
		...fontStyles.bold
	},
	loader: {
		backgroundColor: colors.white,
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
});

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
		requestAnimationFrame(async () => {
			const { AssetsDetectionController, AccountTrackerController } = Engine.context;
			AssetsDetectionController.detectAssets();
			// AccountTrackerController.refresh();
			this.getBalance()
			this.mounted = true;
		});
		this.getCurrentConversion()
	};


	getCurrentConversion = () => {
		API.getRequest(Routes.getConversions, response => {
      if(response.data.length > 0){
      	this.setState({
      		currentConversion: response.data[0].to
      	})
      }
    }, error => {
      console.log(error)
    })
  }

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

	getBalance = async() => {
		const { accounts, selectedAddress, identities } = this.props;
		// for(const account in accounts){
			let params = [selectedAddress]
			await API.postRequest(Routes.getBalance, params, response => {
				// console.log(parseInt(response.result, 16))
				const balance = response.result
				accounts[selectedAddress] = {
					balance: balance,
					conversion: this.state.currentConversion
				}
				const { AccountTrackerController } = Engine.context;
				AccountTrackerController.update({ accounts: Object.assign({}, accounts) })
			}, error => {
				console.log(error.message)
			})
		// }
	};

	componentWillUnmount() {
		this.mounted = false;
	}

	renderTabBar() {
		return (
			<DefaultTabBar
				underlineStyle={styles.tabUnderlineStyle}
				activeTextColor={colors.blue}
				inactiveTextColor={colors.fontTertiary}
				backgroundColor={colors.white}
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


		let balance = 0;
		let assets = tokens;
		if (selectedAddress && accounts) {
			balance = accounts[selectedAddress].balance
			// balance = "0x00"
			assets = [
				{
					name: 'Ether', // FIXME: use 'Ether' for mainnet only, what should it be for custom networks?
					symbol: getTicker(ticker),
					isETH: true,
					balance,
					balanceFiat: weiToFiat(hexToBN(balance), conversionRate, currentCurrency),
					logo: '../images/logo.png'
				},
				...tokens
			];
		} else {
			assets = tokens;
		}

		console.log({
			accounts
		})


		const account = { address: selectedAddress, ...identities[selectedAddress], ...accounts[selectedAddress] };
		
		return (
			<View style={styles.wrapper}>
				{
					(selectedAddress && account) && (
						<AccountOverview account={account} navigation={navigation} onRef={this.onRef} />
					)
				}
				<ScrollableTabView
					renderTabBar={this.renderTabBar}
					// eslint-disable-next-line react/jsx-no-bind
					onChangeTab={obj => this.onChangeTab(obj)}
				>
					<Tokens navigation={navigation} tabLabel={'LCN Tokens'} tokens={assets}  />
					{/*<CollectibleContracts
						navigation={navigation}
						tabLabel={strings('wallet.collectibles')}
						collectibles={collectibles}
					/>*/}
				</ScrollableTabView>
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
	 * Return current step of onboarding wizard if not step 5 nor 0
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
					{(this.props.selectedAddress &&  this.props.accounts) ? this.renderContent() : this.renderLoader()}
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
	hideCurrentNotification: () => dispatch(hideCurrentNotification())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Wallet);
