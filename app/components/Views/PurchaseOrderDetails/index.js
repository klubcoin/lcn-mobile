import React, { useEffect, useState } from 'react';
import {
	Image,
	View,
	StyleSheet,
	BackHandler,
	ScrollView,
	ActivityIndicator,
	DeviceEventEmitter,
	InteractionManager,
	Modal,
	TouchableOpacity
} from 'react-native';
import Text from '../../Base/Text';
import { colors, fontStyles } from '../../../styles/common';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import StyledButton from '../../UI/StyledButton';
import { getPurchaseOrderDetailsNavbarOptions } from '../../UI/Navbar';
import { connect } from 'react-redux';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import preferences from '../../../store/preferences';
import drawables from '../../../common/drawables';
import { hexToBN, fromWei, toWei, BNToHex, toTokenMinimalUnit } from '../../../util/number';
import Routes from 'common/routes';
import moment from 'moment';
import APIService from '../../../services/APIService';
import infuraCurrencies from '../../../util/infura-conversion.json';
import BigNumber from 'bignumber.js';
import API from 'services/api';
import Erc20Service from '../../../core/Erc20Service';
import { generateTransferData } from '../../../util/transactions';
import { getGasPriceByChainId } from '../../../util/custom-gas';
import Engine from '../../../core/Engine';
import TransactionTypes from '../../../core/TransactionTypes';
import { TransactionStatus, WalletDevice } from '@metamask/controllers';
import NotificationManager from '../../../core/NotificationManager';
import { resetTransaction } from '../../../actions/transaction';
import RawTransaction from '../../../services/RawTransaction';
import { showError } from '../../../util/notify';
import Transaction from 'ethereumjs-tx';
import ActionModal from '../../UI/ActionModal';
import Icon from 'react-native-vector-icons/FontAwesome';

const styles = StyleSheet.create({
	scrollViewContainer: {
		flexGrow: 1,
		paddingVertical: 36
	},
	container: {
		flex: 1,
		paddingHorizontal: 12
	},
	content: {
		alignItems: 'center',
		width: '100%'
	},
	avatar: {
		width: 90,
		height: 90,
		borderRadius: 45
	},
	partnerLogo: {
		width: 90,
		height: 90,
		borderRadius: 45
	},
	name: {
		marginTop: 18,
		fontSize: 30,
		color: colors.white,
		fontWeight: 'bold'
	},
	balance: {
		color: colors.white,
		fontWeight: '500'
	},
	line: {
		width: '100%',
		height: 2,
		backgroundColor: colors.white,
		marginVertical: 18
	},
	amountToPay: {
		fontSize: 16,
		marginTop: 12,
		color: colors.grey300,
		fontWeight: '600'
	},
	price: {
		fontSize: 38,
		color: colors.white,
		fontWeight: '500'
	},
	orderDetailWrapper: {
		backgroundColor: colors.lightPurple,
		borderRadius: 6,
		padding: 6,
		width: '100%'
	},
	rowItem: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		padding: 6
	},
	orderDetails: {
		color: colors.grey200
	},
	orderRefNoTitle: {
		color: colors.grey200
	},
	orderRefNo: {
		fontWeight: 'bold',
		color: colors.blue
	},
	lineBlue: {
		width: '100%',
		height: 2,
		backgroundColor: colors.blue,
		marginVertical: 4
	},
	itemTextTitle: {
		color: colors.white,
		fontWeight: '500',
		marginRight: 10
	},
	itemText: {
		flex: 1,
		color: colors.white,
		fontWeight: '500',
		textAlign: 'right'
	},
	totalText: {
		color: colors.white,
		fontWeight: 'bold'
	},
	rightWrapper: {
		flex: 1,
		alignItems: 'flex-end'
	},
	actionsWrapper: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginVertical: 20
	},
	actionButton: {
		minWidth: '35%',
		alignItems: 'center',
		marginHorizontal: 10
	},
	payNow: {
		fontWeight: '700',
		color: colors.black
	},
	cancel: {
		fontWeight: '700',
		color: colors.white
	},
	modalNoBorder: {
		borderTopWidth: 0
	},
	skipModalContainer: {
		flex: 1,
		margin: 12,
		flexDirection: 'column'
	},
	imageWarning: {
		width: 100,
		height: 100,
		alignSelf: 'center'
	},
	skipTitle: {
		fontSize: 24,
		marginTop: 12,
		marginBottom: 16,
		color: colors.red,
		textAlign: 'center',
		...fontStyles.bold
	},
	loadingWrapper: {
		flex: 1,
		justifyContent: 'center',
		alignItems: 'center'
	}
});

const PARTNER_LOGO = require('../../../images/clubbingtv_logo.jpeg');

const GENESIS_ADDRESS = '0xb4bF880BAfaF68eC8B5ea83FaA394f5133BB9623';

const ASSET_TYPE = 'ERC20';
const warning_skip_backup = require('../../../images/warning.png');

const PurchaseOrderDetails = ({ navigation, selectedAddress, accounts, identities, resetTransaction }) => {
	const [account, setAccount] = useState({});
	const [avatar, setAvatar] = useState('');
	const [currency, setCurrency] = useState('usd');
	const [currencySymbol, setCurrencySymbol] = useState('usd');
	const [balance, setBalance] = useState('0');
	const [currencies, setCurrencies] = useState([]);
	const [currencyRates, setCurrencyRates] = useState([]);
	const [price, setPrice] = useState({
		klubToCurrency: '',
		currencyToKlub: ''
	});
	const [purchasing, setPurchasing] = useState(false);
	// const [orderDetail, setOrderDetail] = useState({});
	const [orderDetail, setOrderDetail] = useState();
	const [loading, setLoading] = useState(true);
	const [customNetworkFee, setCustomNetworkFee] = useState({});
	const [showCancelModal, setShowCancelModal] = useState(false);

	const klubToken = Routes.klubToken;
	useEffect(() => {
		BackHandler.addEventListener('hardwareBackPress', onBack);
		return () => {
			BackHandler.removeEventListener('hardwareBackPress', onBack);
		};
	}, []);

	useEffect(() => {
		const orderId = navigation?.state?.params?.orderId;
		if (orderId) {
			setLoading(true);
			APIService.getPaymentInfo(orderId, (success, json) => {
				if (!json?.id || !json?.lines || json?.lines?.length === 0) {
					navigation.goBack();
					navigation.navigate('Dashboard');
					showError(strings('purchase_order_details.invalid_order'));
				} else if (json.status === 'paid') {
					navigation.goBack();
					showError(strings('purchase_order_details.order_paid'));
				} else {
					setOrderDetail(json);
					setCurrency(json?.lines[0]?.unitPrice?.currency?.toLowerCase());
					setLoading(false);
				}
			});
		}
	}, []);

	useEffect(() => {
		setAvatar(preferences?.onboardProfile?.avatar);
		setCurrencies(
			infuraCurrencies.objects.map(e => ({
				...e.quote,
				id: e.quote.code
			}))
		);
		featchPrice();
	}, []);

	useEffect(() => {
		setCurrencySymbol(currencies.find(e => e.code === currency)?.symbol);
	}, [currencies, currency]);

	const onBack = () => {
		return true;
	};

	useEffect(() => {
		setAccount({
			address: selectedAddress,
			...identities[selectedAddress],
			...accounts[selectedAddress],
			decBalance: fromWei(hexToBN(accounts[selectedAddress]?.balance))
		});
	}, [selectedAddress, identities, accounts]);

	useEffect(() => {
		if (account.decBalance) {
			const bigNumberTotalToken = new BigNumber(account?.decBalance);
			const totalBalance = bigNumberTotalToken.multipliedBy(`${price.klubToCurrency}`);
			setBalance(totalBalance.toString());
		}
	}, [account.decBalance, price]);

	const featchPrice = () => {
		API.getRequest(
			Routes.getConversions,
			response => {
				setLoading(false);
				if (response.data.length > 0) {
					setCurrencyRates(response.data);
				} else {
					setCurrencyRates([]);
				}
			},
			error => {
				setLoading(false);
				console.log(error);
			}
		);
	};

	useEffect(() => {
		setPrice({
			klubToCurrency: currencyRates.find(
				e => e?.from?.currency === klubToken.symbol && e?.to?.currency === currency.toUpperCase()
			)?.to?.value,
			currencyToKlub: currencyRates.find(
				e => e?.to?.currency === klubToken.symbol && e?.from?.currency === currency.toUpperCase()
			)?.to?.value
		});
	}, [currencyRates, currency]);

	const onCancelPurchase = () => {
		navigation.goBack();
		navigation.navigate('Dashboard');
	};

	useEffect(() => {
		if (!customNetworkFee.gas && !customNetworkFee.gasPrice) {
			const fetchNetworkFee = setInterval(() => {
				getCustomNetworkFee();
			}, 2000);
			return () => clearInterval(fetchNetworkFee);
		}
	}, [customNetworkFee]);

	const getCustomNetworkFee = async () => {
		const selectedAsset = Routes.klubToken;
		const result = await new Erc20Service().getFixedFee();
		const base = Math.pow(10, selectedAsset.decimals);
		const networkFee = {
			gas: hexToBN('0x1'),
			gasPrice: toWei((parseFloat(result) / base).toString())
		};
		setCustomNetworkFee(networkFee);
		return networkFee;
	};

	const checkAmount = () => {
		const { gas, gasPrice } = customNetworkFee ?? {};
		const totalTokenFee = fromWei(gas.mul(gasPrice));
		const totalAmount = new BigNumber(orderDetail?.lines[0].totalAmount.value);
		const totalToken = totalAmount.multipliedBy(price.currencyToKlub);
		const amount = BNToHex(toTokenMinimalUnit(totalToken, klubToken.decimals));
		const amountDec = fromWei(amount);
		const accountBalance = fromWei(account.balance);
		const totalAmountPaid = new BigNumber(totalTokenFee).plus(amountDec);
		if (totalAmountPaid.gt(accountBalance)) {
			showError(strings('transaction.insufficient'));
			return false;
		}
		return true;
	};

	const onPurchase = async () => {
		if (!checkAmount()) {
			return;
		}
		try {
			const { TransactionController, NetworkController, KeyringController } = Engine.context;
			setPurchasing(true);

			const totalAmount = new BigNumber(orderDetail?.lines[0].totalAmount.value);
			const totalToken = totalAmount.multipliedBy(price.currencyToKlub);
			let transaction = {};
			transaction.data = generateTransferData('transfer', {
				toAddress: GENESIS_ADDRESS,
				amount: BNToHex(toTokenMinimalUnit(totalToken, klubToken.decimals))
			});
			transaction.to = klubToken.address();
			transaction.value = '0x0';
			transaction.from = selectedAddress;
			transaction.chainId = parseInt(Routes.mainNetWork.chainId);
			const estimation = await estimateGas(transaction);
			transaction = { ...transaction, gas: BNToHex(estimation.gas), gasPrice: BNToHex(estimation.gasPrice) };
			let payOrderRawTransaction = new RawTransaction(() => NetworkController.provider);
			transaction.nonce = await payOrderRawTransaction.getNonce(transaction.from);
			const rawTX = new Transaction(Object.assign({}, transaction));
			const rawTransaction = await KeyringController.signTransaction(rawTX, transaction.from);
			const rawTransactionHex = rawTransaction.serialize().toString('hex');

			let { result, transactionMeta } = await TransactionController.addTransaction(
				transaction,
				TransactionTypes.MMM,
				WalletDevice.MM_MOBILE
			);
			APIService.sendPaymentRawTransaction(orderDetail.id, rawTransactionHex, async (success, json) => {
				if (success && json?.result?.status === 'paid') {
					if (transactionMeta.error) {
						throw transactionMeta.error;
					}
					transactionMeta.transactionHash = rawTransactionHex;
					transactionMeta.status = TransactionStatus.confirmed;
					transactionMeta.transaction.gas = customNetworkFee.gas;
					transactionMeta.transaction.gasPrice = customNetworkFee.gasPrice;

					await TransactionController.updateTransaction(transactionMeta);
					// await TransactionController.queryTransactionStatuses();
					// await TransactionController.hub.emit(`${transactionMeta.id}:finished`, transactionMeta);
					// await new Promise(resolve => resolve(result));

					InteractionManager.runAfterInteractions(async () => {
						DeviceEventEmitter.emit('SubmitTransaction', transactionMeta);
						NotificationManager.watchSubmittedTransaction({
							...transactionMeta,
							ASSET_TYPE
						});
						resetTransaction();
						onPurchaseSuccess();
						// navigation && navigation.dismiss();
					});
				} else {
					setPurchasing(false);
					showError(strings('purchase_order_details.payment_error'));
				}
			});
		} catch (err) {
			console.warn(err);
		}
	};

	const estimateGas = async transaction => {
		const { value, data, to, from } = transaction;

		return await getGasPriceByChainId({
			value,
			from,
			data,
			to
		});
	};

	const onPurchaseSuccess = () => {
		navigation.navigate('PurchaseSuccess');
	};

	const onShowCancelModal = () => {
		setShowCancelModal(true);
	};
	const onHideCancelModal = () => {
		setShowCancelModal(false);
	};

	const renderLoading = () => {
		return (
			<View style={styles.loadingWrapper}>
				<ActivityIndicator color={colors.white} />
			</View>
		);
	};

	const renderOrderDetail = () => {
		const { gas, gasPrice } = customNetworkFee ?? {};
		const { klubToCurrency } = price;
		const loadingFee = !gas || !gasPrice || !klubToCurrency;
		let transactionFee = null;
		if (!!gas && !!gasPrice && !!klubToCurrency) {
			const totalToken = fromWei(gas.mul(gasPrice));
			const bigNumberTotalToken = new BigNumber(totalToken);
			const totalBalance = bigNumberTotalToken.multipliedBy(klubToCurrency);
			transactionFee = totalBalance.toFixed(2);
		}
		return (
			<>
				<View style={styles.content}>
					<Image
						source={avatar ? { uri: `file://${avatar}` } : drawables.avatar_user}
						style={styles.avatar}
					/>
					<Text style={styles.name}>{account.name}</Text>
					<Text style={styles.balance}>{`${fromWei(hexToBN(account?.balance))} ${klubToken.symbol}`}</Text>
					<Text style={styles.balance}>{`${currencySymbol} ${balance}`}</Text>
					<View style={styles.line} />
					<Image source={PARTNER_LOGO} style={styles.partnerLogo} />
					<Text style={styles.amountToPay}>
						{strings('purchase_order_details.amount_to_pay').toUpperCase()}
					</Text>
					<Text style={styles.price}>{`${currencySymbol} ${orderDetail?.lines[0].totalAmount.value}`}</Text>
				</View>
				<View style={styles.orderDetailWrapper}>
					<View style={styles.rowItem}>
						<Text style={styles.orderDetails}>
							{strings('purchase_order_details.order_details').toUpperCase()}
						</Text>
						<Text>
							<Text style={styles.orderRefNoTitle}>{strings('purchase_order_details.order_ref_no')}</Text>
							<Text style={styles.orderRefNo}> {orderDetail?.metadata?.order_id}</Text>
						</Text>
					</View>
					<View style={styles.lineBlue} />
					<View style={styles.rowItem}>
						<Text style={styles.itemTextTitle}>{strings('purchase_order_details.amount')}</Text>
						<Text style={styles.itemText}>{`${
							orderDetail?.lines[0].totalAmount.value
						} ${currency.toUpperCase()}`}</Text>
					</View>
					<View style={styles.rowItem}>
						<Text style={styles.itemTextTitle}>
							{strings('purchase_order_details.transaction_fee', { token: Routes.mainNetWork.coin })}
						</Text>
						{loadingFee ? (
							<ActivityIndicator color={colors.white} />
						) : (
							<Text style={styles.itemText}>{`${transactionFee} ${currency.toUpperCase()}`}</Text>
						)}
					</View>
					<View style={styles.lineBlue} />
					<View style={styles.rowItem}>
						<Text style={styles.totalText}>{strings('purchase_order_details.total')}</Text>
						{loadingFee ? (
							<ActivityIndicator color={colors.white} />
						) : (
							<Text style={styles.totalText}>{`${parseFloat(orderDetail?.lines[0].totalAmount.value) +
								parseFloat(transactionFee)} ${currency.toUpperCase()}`}</Text>
						)}
					</View>
					<View style={styles.rowItem}>
						<Text style={styles.itemTextTitle}>{strings('purchase_order_details.order_placed_via')}</Text>
						<View style={styles.rightWrapper}>
							<Text style={styles.itemText} numberOfLines={2}>
								{orderDetail?.redirectUrl
									.split('/')
									.slice(0, 4)
									.join('/')}
							</Text>
							<Text style={styles.itemText}>
								{moment(orderDetail?.createdAt).format('MMM DD,YYYY [at] h:mm A')}
							</Text>
						</View>
					</View>
					<View style={styles.actionsWrapper}>
						<StyledButton
							testID={'purchase-order-detail-pay-now-button'}
							type={'normal'}
							containerStyle={styles.actionButton}
							onPress={onPurchase}
							disabled={purchasing || loadingFee}
						>
							{purchasing ? (
								<ActivityIndicator color={colors.white} />
							) : (
								<Text style={styles.payNow}>{strings('purchase_order_details.pay_now')}</Text>
							)}
						</StyledButton>
						<StyledButton
							testID={'purchase-order-detail-cancel-button'}
							type={'warning'}
							containerStyle={styles.actionButton}
							onPress={onShowCancelModal}
							disabled={purchasing || loadingFee}
						>
							<Text style={styles.cancel}>{strings('purchase_order_details.cancel')}</Text>
						</StyledButton>
					</View>
				</View>
				<ActionModal
					confirmText={strings('purchase_order_details.confirm').toUpperCase()}
					cancelText={strings('purchase_order_details.dismiss').toUpperCase()}
					confirmButtonMode={'warning'}
					displayCancelButton
					cancelButtonMode={'normal'}
					modalVisible={showCancelModal}
					actionContainerStyle={styles.modalNoBorder}
					onCancelPress={onHideCancelModal}
					onConfirmPress={onCancelPurchase}
					verticalButtons
				>
					<View style={styles.skipModalContainer}>
						<Image
							source={warning_skip_backup}
							style={styles.imageWarning}
							resizeMethod={'auto'}
							testID={'skip_backup_warning'}
						/>
						<Text style={styles.skipTitle}>{strings('purchase_order_details.cancel_order_title')}</Text>
					</View>
				</ActionModal>
			</>
		);
	};

	return (
		<OnboardingScreenWithBg screen="a">
			<ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContainer}>
				{loading ? renderLoading() : renderOrderDetail()}
			</ScrollView>
		</OnboardingScreenWithBg>
	);
};

PurchaseOrderDetails.navigationOptions = ({ navigation }) =>
	getPurchaseOrderDetailsNavbarOptions('purchase_order_details.title', navigation);

PurchaseOrderDetails.propTypes = {
	navigation: PropTypes.object
};

const mapStateToProps = state => ({
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	identities: state.engine.backgroundState.PreferencesController.identities,
	accounts: state.engine.backgroundState.AccountTrackerController.accounts
});
const mapDispatchToProps = dispatch => ({
	resetTransaction: () => dispatch(resetTransaction())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(PurchaseOrderDetails);
