import React, { PureComponent } from 'react';
import { colors, fontStyles } from '../../../../styles/common';
import { getSendFlowTitle } from '../../../UI/Navbar';
import PropTypes from 'prop-types';
import { makeObservable, observable } from 'mobx';
import { StyleSheet, View, SafeAreaView, InteractionManager, ScrollView, ActivityIndicator, Alert } from 'react-native';
import { AddressFrom } from '../../SendFlow/AddressInputs';
import Modal from 'react-native-modal';
import AccountList from '../../../UI/AccountList';
import { connect } from 'react-redux';
import { renderFromWei } from '../../../../util/number';
import Engine from '../../../../core/Engine';
import { doENSReverseLookup } from '../../../../util/ENSUtils';
import { setSelectedAsset } from '../../../../actions/transaction';
import { getTicker, getEther } from '../../../../util/transactions';
import { strings } from '../../../../../locales/i18n';
import WarningMessage from '../../SendFlow/WarningMessage';
import { util } from '@metamask/controllers';
import Analytics from '../../../../core/Analytics';
import { ANALYTICS_EVENT_OPTS } from '../../../../util/analytics';
import { allowedToBuy } from '../../../UI/FiatOrders';
import Text from '../../../Base/Text';
import Helper from 'common/Helper';
import OrderSummary from '../../../UI/OrderSummary';
import StyledButton from '../../../UI/StyledButton';
import APIService from '../../../../services/APIService';
import NotificationManager from '../../../../core/NotificationManager';
import { displayName } from '../../../../../app.json';

const { hexToBN } = util;
const styles = StyleSheet.create({
	wrapper: {
		flex: 1,
		backgroundColor: colors.white
	},
	imputWrapper: {
		flex: 0,
		borderBottomWidth: 1,
		borderBottomColor: colors.grey050,
		paddingHorizontal: 8,
		paddingBottom: 10
	},
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0
	},
	buttonNextWrapper: {
		flexDirection: 'row',
		alignItems: 'flex-end',
		marginBottom: 20
	},
	buttonNext: {
		flex: 1,
		marginHorizontal: 24
	},
	warningContainer: {
		marginTop: 20,
		marginHorizontal: 24,
		marginBottom: 32
	},
	buyEth: {
		color: colors.black,
		textDecorationLine: 'underline'
	}
});

/**
 * View that wraps the wraps the "PayQR" screen
 */
class PayQR extends PureComponent {
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
		fromAccountBalance: undefined
	};

	constructor(props) {
		super(props);
		makeObservable(this, {
			processing: observable
		});
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
			balanceIsZero: hexToBN(accounts[selectedAddress].balance).isZero()
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

	onPay() {
		if (this.processing) return;
		this.processing = true;

		const { fromSelectedAddress } = this.state;
		const { navigation } = this.props;
		const orderId = navigation.getParam('orderId');

		APIService.proceedOrder(orderId, fromSelectedAddress, 'sig', (success, response) => {
			this.processing = false;
			if (success && response.status) {
				NotificationManager.showSimpleNotification({
					title: strings('payQR.success'),
					description: strings('payQR.payment_complete'),
					status: response.status
				});
				navigation && navigation.dismiss();
			} else {
				const { error } = response;
				Alert.alert(strings('wallet.error'), error, [{ text: strings('navigation.ok') }]);
			}
		});
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
				{strings('fiat_on_ramp.buy_eth', { appName: displayName })}
			</Text>
		);
	};

	render = () => {
		const { ticker, navigation } = this.props;
		const order = navigation.getParam('order');

		const { fromSelectedAddress, fromAccountName, fromAccountBalance, balanceIsZero } = this.state;

		return (
			<SafeAreaView style={styles.wrapper} testID={'send-screen'}>
				<View style={styles.imputWrapper}>
					<AddressFrom
						onPressIcon={this.toggleFromAccountModal}
						fromAccountAddress={fromSelectedAddress}
						fromAccountName={fromAccountName}
						fromAccountBalance={fromAccountBalance}
					/>
				</View>
				<ScrollView>
					<OrderSummary
						amount={order.amount}
						orderNumber={order.orderNumber}
						currency={order.currency}
						billingAddress={order.billingAddress}
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
			</SafeAreaView>
		);
	};
}

const mapStateToProps = state => ({
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
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
)(PayQR);
