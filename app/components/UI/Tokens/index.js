import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Alert, TouchableOpacity, StyleSheet, Text, View, InteractionManager } from 'react-native';
import TokenImage from '../TokenImage';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors, fontStyles } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import contractMap from '@metamask/contract-metadata';
import ActionSheet from 'react-native-actionsheet';
import { renderFromTokenMinimalUnit, balanceToFiat, renderFromWei, fromTokenMinimalUnit, fromTokenMinimalUnitString } from '../../../util/number';
import Engine from '../../../core/Engine';
import AssetElement from '../AssetElement';
import { connect } from 'react-redux';
import { safeToChecksumAddress } from '../../../util/address';
import Analytics from '../../../core/Analytics';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import StyledButton from '../StyledButton';
import { allowedToBuy } from '../FiatOrders';
import NetworkMainAssetLogo from '../NetworkMainAssetLogo';
import { isMainNet } from '../../../util/networks';
import Helper from 'common/Helper';
import Routes from '../../../common/routes';
import preferences, { kAppList } from '../../../store/preferences';
import styles from './styles/index';

const TokenRoutes = {
	Liquichat: 'MessageApp',
	LiquiShare: 'FilesManager',
	Liquimart: 'MarketPlaceApp',
	Tipper: 'TipperApp'
};

/**
 * View that renders a list of ERC-20 Tokens
 */
class Tokens extends PureComponent {
	static propTypes = {
		/**
		 * Navigation object required to push
		 * the Asset detail view
		 */
		accounts: PropTypes.object,
		selectedAddress: PropTypes.string,
		navigation: PropTypes.object,
		/**
		 * Array of assets (in this case ERC20 tokens)
		 */
		tokens: PropTypes.array,
		/**
		 * ETH to current currency conversion rate
		 */
		conversionRate: PropTypes.number,
		/**
		 * Currency code of the currently-active currency
		 */
		currentCurrency: PropTypes.string,
		/**
		 * Object containing token balances in the format address => balance
		 */
		tokenBalances: PropTypes.object,
		/**
		 * Object containing token exchange rates in the format address => exchangeRate
		 */
		tokenExchangeRates: PropTypes.object,
		/**
		 * Array of transactions
		 */
		transactions: PropTypes.array,
		/**
		 * Primary currency, either ETH or Fiat
		 */
		primaryCurrency: PropTypes.string,
		/**
		 * Chain id
		 */
		chainId: PropTypes.string,
		/**
		 * A bool that represents if the user wants to hide zero balance token
		 */
		hideZeroBalanceTokens: PropTypes.bool
	};

	savedApps = [];
	actionSheet = null;

	tokenToRemove = null;

	componentDidMount() {
		this.fetchApps();
	}

	componentDidUpdate(prevProps) {
		if (this.props != prevProps) {
			this.fetchApps();
		}
	}

	async fetchApps() {
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

		await preferences.fetch(kAppList);
		this.savedApps = await preferences.getSavedAppList();
		this.savedApps.unshift(tipper);
		this.setState({});
	}

	renderEmpty = () => (
		<View style={styles.emptyView}>
			<Text style={styles.text}>{strings('wallet.no_tokens')}</Text>
			{/* {this.renderFooter()} */}
		</View>
	);

	onItemPress = async token => {
		const app = this.savedApps.find(e => e.address == `${token.address}`.toLowerCase());
		if (app) {
			await preferences.setCurentAppId(app.address);
			if (TokenRoutes[app.instance.name]) {
				this.props.navigation.navigate(TokenRoutes[app.instance.name], { app });
			} else {
				this.props.navigation.navigate('VotingApp', { app });
			}
		} else {
			this.props.navigation.navigate('Asset', { ...token, transactions: this.props.transactions });
		}
	};

	renderFooter = () => (
		<View style={styles.footer} key={'tokens-footer'}>
			<TouchableOpacity style={styles.add} onPress={this.goToAddToken} testID={'add-token-button'}>
				<Icon name="plus" size={16} color={colors.blue} />
				<Text style={styles.addText}>{strings('wallet.add_tokens')}</Text>
			</TouchableOpacity>
		</View>
	);

	renderItem = asset => {
		const {
			chainId,
			conversionRate,
			currentCurrency,
			tokenBalances,
			tokenExchangeRates,
			primaryCurrency,
			selectedAddress,
			accounts
		} = this.props;
		// const account = state.engine.backgroundState.PreferencesController.identities;
		const itemAddress = safeToChecksumAddress(asset.address);
		const logo = asset.logo || ((contractMap[itemAddress] && contractMap[itemAddress].logo) || undefined);
		const exchangeRate = itemAddress in tokenExchangeRates ? tokenExchangeRates[itemAddress] : undefined;
		const balance =
			asset.balance ? renderFromWei(asset.balance):
			(itemAddress in tokenBalances ? fromTokenMinimalUnitString(tokenBalances[itemAddress]?.toString(10), asset.decimals) : 0);
		// const balanceFiat =
		// 	isMainNet(chainId) || asset.symbol == Routes.mainNetWork.ticker
		// 		? asset.balanceFiat || balanceToFiat(balance, conversionRate, exchangeRate, currentCurrency)
		// 		: null;
		const balanceFiat = asset.balanceFiat || balanceToFiat(balance, conversionRate, exchangeRate, currentCurrency);
		const balanceValue = `${balance} ${asset.symbol}`;
		// let account = null;
		// if (selectedAddress && typeof accounts[selectedAddress] != 'undefined') {
		// 	account = accounts[selectedAddress];
		// 	balance = accounts[selectedAddress].balance;
		// }

		// balance = Helper.demosToLiquichain(balance || 0);

		// const balanceValue = `${balance} ${Routes.mainNetWork.ticker}`;
		//TODO: remove this condition
		if (asset.name == "Tipper")
			var app = asset;
		else
			var app = this.savedApps.find(e => e.address == `${asset.address}`.toLowerCase());
		// render balances according to primary currency
		let mainBalance, secondaryBalance;
		if (app && app.name) {
			const { application, instance } = app;
			mainBalance = instance?.name || application.name;
			secondaryBalance = instance?.description || application.description;
		} else if (primaryCurrency === 'ETH') {
			mainBalance = balanceValue;
			secondaryBalance = balanceFiat;
		} else {
			mainBalance = !balanceFiat ? balanceValue : balanceFiat;
			secondaryBalance = !balanceFiat ? balanceFiat : balanceValue;
		}

		if (!app && asset?.balanceError) {
			mainBalance = asset.symbol;
			secondaryBalance = strings('wallet.unable_to_load');
		}

		asset = { ...asset, ...{ logo, balance, balanceFiat } };
		return (
			<AssetElement
				key={itemAddress || '0x'}
				testID={'asset'}
				onPress={this.onItemPress}
				onLongPress={asset.isETH ? null : this.showRemoveMenu}
				asset={asset}
			>
				{
					app ? (
						<View style={styles.row}>
							<TokenImage asset={asset} containerStyle={styles.ethLogo} />
							<View style={styles.app}>
								<Text style={styles.name}>{mainBalance}</Text>
								<Text style={styles.desc}>{secondaryBalance}</Text>
							</View>
						</View>
					) : (
						<View style={styles.row}>
							{asset.isETH ? (
								<NetworkMainAssetLogo big style={styles.ethLogo} testID={'eth-logo'} />
							) : (
								<TokenImage asset={asset} containerStyle={styles.ethLogo} />
							)}

							<View style={styles.balances} testID={'balance'}>
								<Text style={styles.balance}>{mainBalance}</Text>
								<Text style={[styles.balanceFiat, asset?.balanceError && styles.balanceFiatTokenError]}>
									{secondaryBalance}
								</Text>
							</View>
						</View>
					)}
			</AssetElement>
		);
	};

	goToBuy = () => {
		this.props.navigation.navigate('PurchaseMethods');
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_BUY_ETH);
		});
	};

	renderBuyLCN() {
		const { tokens, chainId, tokenBalances } = this.props;
		if (!allowedToBuy(chainId)) {
			return null;
		}
		const eth = tokens.find(token => token.isETH);
		const ethBalance = eth && eth.balance !== '0';
		const hasTokens = eth ? tokens.length > 1 : tokens.length > 0;
		const hasTokensBalance =
			hasTokens &&
			tokens.some(
				token => !token.isETH && tokenBalances[token.address] && !tokenBalances[token.address]?.isZero?.()
			);

		return (
			<View style={styles.tokensHome}>
				{!ethBalance && !hasTokensBalance && (
					<Text style={styles.tokensHomeText}>{strings('wallet.ready_to_explore')}</Text>
				)}
				<StyledButton type="normal" onPress={this.goToBuy} containerStyle={styles.tokensHomeButton}>
					Buy {Routes.mainNetWork.ticker}
				</StyledButton>
			</View>
		);
	}

	renderList() {
		const { tokens, hideZeroBalanceTokens, tokenBalances } = this.props;
		const tokensToDisplay = hideZeroBalanceTokens
			? tokens.filter(token => {
					const { address, isETH } = token;
					return (tokenBalances[address] && !tokenBalances[address]?.isZero?.()) || isETH;
					// eslint-disable-next-line no-mixed-spaces-and-tabs
			  })
			: tokens;

		return (
			<View>
				{tokensToDisplay.map(item => this.renderItem(item))}
				{/* {this.renderBuyLCN()} */}
				{/* {this.renderFooter()} */}
			</View>
		);
	}

	goToAddToken = () => {
		this.props.navigation.push('AddAsset', { assetType: 'token' });
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_ADD_TOKENS);
		});
	};

	showRemoveMenu = token => {
		this.tokenToRemove = token;
		this.actionSheet.show();
	};

	removeToken = () => {
		const { AssetsController } = Engine.context;
		AssetsController.removeAndIgnoreToken(this.tokenToRemove.address);
		Alert.alert(strings('wallet.token_removed_title'), strings('wallet.token_removed_desc'));
	};

	createActionSheetRef = ref => {
		this.actionSheet = ref;
	};

	onActionSheetPress = index => (index === 0 ? this.removeToken() : null);

	render = () => {
		const { tokens } = this.props;
		return (
			<View style={styles.wrapper} testID={'tokens'}>
				{tokens && tokens.length ? this.renderList() : this.renderEmpty()}
				<ActionSheet
					ref={this.createActionSheetRef}
					title={strings('wallet.remove_token_title')}
					options={[strings('wallet.remove'), strings('wallet.cancel')]}
					cancelButtonIndex={1}
					destructiveButtonIndex={0}
					onPress={this.onActionSheetPress}
				/>
			</View>
		);
	};
}

const mapStateToProps = state => ({
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	chainId: state.engine.backgroundState.NetworkController.provider.chainId,
	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
	conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate,
	primaryCurrency: state.settings.primaryCurrency,
	tokenBalances: state.engine.backgroundState.TokenBalancesController.contractBalances,
	tokenExchangeRates: state.engine.backgroundState.TokenRatesController.contractExchangeRates,
	hideZeroBalanceTokens: state.settings.hideZeroBalanceTokens
});

export default connect(mapStateToProps)(Tokens);
