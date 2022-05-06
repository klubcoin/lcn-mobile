import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity, ActivityIndicator, ScrollView } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { getPayPalNavbar } from '../../../../UI/Navbar';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import API from 'services/api';
import Routes from 'common/routes';
import Engine from '@core/Engine';
import { WebView } from 'react-native-webview';
import { NavigationActions, StackActions } from 'react-navigation';
import CookieManager from '@react-native-community/cookies';
import { colors } from '../../../../../styles/common';
import { strings } from '../../../../../../locales/i18n';
import styles from './styles';
import Config from 'react-native-config';
import TrackingTextInput from '../../../TrackingTextInput';
import TrackingScrollView from '../../../TrackingScrollView';
import infuraCurrencies from '../../../../../util/infura-conversion.json';
import Modal from 'react-native-modal';
import Collapsible from 'react-native-collapsible';
import Networks from '../../../../../util/networks';
import StyledButton from '../../../../UI/StyledButton';
import DashedLine from 'react-native-dashed-line';
import BigNumber from 'bignumber.js';
import { showError } from '../../../../../util/notify';
import { showAlert } from '../../../../../actions/alert';

const FLAGS = {
	USD: require('../../../../../images/usa-flag.png'),
	EUR: require('../../../../../images/eu-flag.png')
};

const menuData = [
	{
		icon: 'question-circle-o',
		title: strings('paypal_checkout.support'),
		url: 'https://www.paypal.com/us/webapps/mpp/ua/privacy-full#contactUs'
	},
	{
		icon: 'lock',
		title: strings('paypal_checkout.privacy_policy'),
		url: 'https://www.paypal.com/us/webapps/mpp/ua/privacy-full'
	},
	{
		icon: 'file-text-o',
		title: strings('paypal_checkout.terms_of_service'),
		url: 'https://www.paypal.com/us/webapps/mpp/ua/cryptocurrencies-tnc'
	}
];

const boundary = {
	USD: {
		min: 30,
		max: 100000,
		default: 200
	},
	EUR: {
		min: 20,
		max: 90000,
		default: 300
	}
};

function PayPal({ selectedAddress, ...props }) {
	const [from, setFrom] = useState({
		currency: 'USD',
		amount: 0
	});
	const [to, setTo] = useState({
		currency: Routes.klubToken.symbol,
		amount: 0
	});
	const [selected, setSelected] = useState(null);
	const [currencies, setCurrencies] = useState([]);
	const [errorMessage, setErrorMessage] = useState(null);
	const [payPalUrl, setPayPalUrl] = useState(null);
	const [orderId, setOrderId] = useState(null);
	const [viewFeeCalculation, setViewFeeCalculation] = useState(false);
	const [isChangeCurrency, setIsChangeCurrency] = useState(false);
	const [currencyData, setCurrencyData] = useState([]);
	const [isLoading, setLoading] = useState(false);
	const [isViewMenu, setIsViewMenu] = useState(false);
	const [priceOneToken, setPriceOneToken] = useState(0);
	const [paypalFee, setPaypalFee] = useState(7.98);
	const [tokenFee, setTokenFee] = useState(45.96);
	const [networkFee, setNetworkFee] = useState(1.44);
	const [totalFee, setTotalFee] = useState(11.42);
	const [isConfirm, setIsConfirm] = useState(false);
	const [isViewInfoRate, setIsViewInfoRate] = useState(false);
	const [isViewFullAddress, setIsViewFullAddress] = useState(false);

	useEffect(() => {
		setFrom(pre => ({
			currency: props.currentCurrency.toUpperCase(),
			amount: boundary[props.currentCurrency.toUpperCase()].default
		}));
	}, [props.currentCurrency]);

	useEffect(() => {
		setCurrencyData(
			infuraCurrencies.objects
				.sort((a, b) => a.quote.code.toLocaleLowerCase().localeCompare(b.quote.code.toLocaleLowerCase()))
				.map(({ quote: { code, name, symbol, lang } }) => ({
					label: `${code.toUpperCase()} - ${name}`,
					key: code.toUpperCase(),
					value: code.toUpperCase(),
					symbol,
					lang
				}))
		);
	}, []);

	useEffect(() => {
		if (currencies.length == 0) {
			CookieManager.clearAll(true);

			setLoading(true);
			API.getRequest(
				Routes.getConversions,
				response => {
					setLoading(false);
					if (response.data.length > 0) {
						setCurrencies(response.data);
						// manageCurrencies();
					} else {
						setCurrencies([]);
					}
				},
				error => {
					setLoading(false);
					console.log(error);
				}
			);
		}
	});

	useEffect(() => {
		if (selected && selected?.to) {
			const bigNumberPrice = new BigNumber(selected.to.value);
			const toAmount = bigNumberPrice.multipliedBy(from.amount ? from.amount : '0');
			setTo(pre => ({
				...pre,
				amount: +toAmount
			}));
		}
	}, [selected, from.value, from.currency, from.amount]);

	useEffect(() => {
		manageCurrencies();
	}, [currencies, from.currency, manageCurrencies]);

	const onCloseModal = () => {
		setIsChangeCurrency(false);
	};

	const onOpenModal = () => {
		setIsChangeCurrency(true);
	};
	const onChangeCurrency = value => {
		setFrom({ currency: value, amount: boundary[value].default });
		onCloseModal();
	};

	const manageCurrencies = useCallback(() => {
		setSelected();
		const currItem = currencies.find(
			item => item.from.currency === from.currency && item.to.currency === to.currency
		);
		setPriceOneToken(currItem ? (1 / currItem.to.value).toFixed(2) : 0);
		setSelected(currItem ?? null);
		// for (var i = 0; i < currencies.length; i++) {
		// 	let item = currencies[i];
		// 	if (item.from.currency === from.currency && item.to.currency === to.currency) {
		// 		setSelected(item);
		// 		break;
		// 	}
		// }
	}, [currencies, from.currency, to.currency]);

	const onViewMenu = isView => {
		setIsViewMenu(isView);
	};

	const capturePayPalOrder = url => {
		if (orderId == null) {
			return;
		}
		console.log('orderId', orderId);
		API.standardPostRequest(
			Routes.paypalPaymentCapture + '/' + orderId,
			{},
			response => {
				if (response.status === 200) {
					// success
					console.log('success paypal transactions');
					// const navigationAction = NavigationActions.navigate({
					//   routeName: 'Home',
					//   action: StackActions.reset({
					//     index: 0,
					//     key: null
					//   })
					// })
					// props.navigation.dispatch(navigationAction)
					props.navigation.push('Home');
				} else {
					// should alert an error here
					console.log('error paypal transactions');
					// props.navigation.navigate('PurchaseMethods')
					props.navigation.push('Home');
				}
			},
			error => {
				console.log({
					error: error.message
				});
			}
		);
	};

	const manageRequest = url => {
		console.log({
			url
		});
		if (url && url.includes('error')) {
			console.log('navigate to PurchaseMethods');
			// props.navigation.navigate('PurchaseMethods')
		} else if (url && url.includes(Config.SERVER_ADDRESS)) {
			capturePayPalOrder(url);
		} else {
			// unknown url
			// capturePayPalOrder()
		}
	};

	const payWithPayPal = () => {
		if (from == null || selected == null) {
			setErrorMessage('Fields are required');
			return;
		}

		if (from.amount <= 0) {
			setErrorMessage('Amount must be greater than 0');
			return;
		}

		if (selectedAddress == null) {
			return;
		}

		let address = selectedAddress.selectedAddress;

		let params = {
			from,
			to,
			account: address ? address.substring(2, address.length) : null
			// account: 'B51b96f26923F5c9Ac438E0D74E0cD8F5171F412'
		};

		console.log(params);

		API.standardPostRequest(
			Routes.paypalCreateOrder,
			params,
			response => {
				if (response && response.links.length > 0) {
					setOrderId(response.id);
					response.links.map(item => {
						if (item.rel === 'approve') {
							console.log('load link', item.href);
							setPayPalUrl(item.href);
						}
					});
				} else {
					// error
				}
			},
			error => {
				console.log('error', error.message);
			}
		);
	};

	const onViewMenuContent = (title, url) => {
		props.navigation.navigate('Webview', {
			url,
			title
		});
	};

	const onPressAddress = () => {
		setIsViewFullAddress(pre => {
			if (!pre) {
				Clipboard.setString(selectedAddress.selectedAddress);
				props.showAlert({
					isVisible: true,
					autodismiss: 1500,
					content: 'clipboard-alert',
					data: { msg: strings('account_details.account_copied_to_clipboard') }
				});
			}
			return !pre;
		});
	};

	const onLongPressAddress = () => {
		Clipboard.setString(selectedAddress.selectedAddress);
		props.showAlert({
			isVisible: true,
			autodismiss: 1500,
			content: 'clipboard-alert',
			data: { msg: strings('account_details.account_copied_to_clipboard') }
		});
	};

	const renderStepper = () => {
		return (
			<View style={styles.stepperWrapper}>
				<View style={styles.stepperCheckout}>
					<View style={styles.sRow}>
						<View style={styles.sMark} />
						<Text style={styles.markText}>{strings('paypal_checkout.using_payment_method')}</Text>
					</View>
					<TouchableOpacity style={styles.stepperButton} activeOpacity={0.7}>
						<View style={styles.stepperButtonContent}>
							<Icon name={'paypal'} size={22} color={colors.white} />
							<Text style={styles.stepperButtonText}>{strings('paypal_checkout.paypal')}</Text>
						</View>
					</TouchableOpacity>
					<View style={styles.mRow}>
						<TouchableOpacity
							style={styles.mMark}
							activeOpacity={1}
							onPress={() => {
								setViewFeeCalculation(pre => !pre);
							}}
						>
							<Icon name={viewFeeCalculation ? 'expand' : 'compress'} style={styles.markIcon} />
						</TouchableOpacity>
						<Text style={styles.markText}>
							{viewFeeCalculation
								? strings('paypal_checkout.hide_calculation')
								: strings('paypal_checkout.see_calculation')}
						</Text>
					</View>
					<View style={styles.collapsibleWrapper}>
						<Collapsible collapsed={!viewFeeCalculation} style={styles.collapsible}>
							<View style={styles.sRow}>
								<View style={styles.sMark} />
								<Text style={styles.markText}>{`${paypalFee} ${from.currency}`}</Text>
								<Text style={styles.markTitleText}>{strings('paypal_checkout.paypal_fee')}</Text>
							</View>
							<View style={styles.sRow}>
								<View style={styles.sMark} />
								<Text style={styles.markText}>{`${tokenFee} ${from.currency}`}</Text>
								<Text style={styles.markTitleText}>
									{strings('paypal_checkout.token_fee', { token: Routes.mainNetWork.coin })}
								</Text>
							</View>
							<View style={styles.sRow}>
								<View style={styles.sMark} />
								<Text style={styles.markText}>{`${networkFee} ${from.currency}`}</Text>
								<Text style={styles.markTitleText}>
									{strings('paypal_checkout.network_exchange_fee')}
								</Text>
							</View>
						</Collapsible>
					</View>
				</View>

				<View style={styles.mRow}>
					<View style={styles.mMark}>
						<Icon name="minus" style={styles.markIcon} />
					</View>
					<Text style={styles.markText}>{`${totalFee} ${from.currency}`}</Text>
					<Text style={styles.markTitleText}>{strings('paypal_checkout.total_fees')}</Text>
				</View>

				<View style={styles.mRow}>
					{isViewInfoRate && (
						<View style={styles.iContent}>
							<Text style={styles.iText}>{strings('paypal_checkout.rate_info')}</Text>
						</View>
					)}
					<View style={styles.mMark}>
						<IconFontAwesome5 name="divide" style={styles.markIcon} />
					</View>
					<Text style={styles.markText}>{`${priceOneToken} ${from.currency} = 1`}</Text>
					<Text style={styles.tokenText}>{to.currency}</Text>
					<Text style={styles.markTitleText}>{strings('paypal_checkout.rate')}</Text>
					<TouchableOpacity
						style={styles.iButton}
						activeOpacity={0.7}
						onPress={() => {
							setIsViewInfoRate(pre => !pre);
						}}
					>
						<Icon name="info" style={styles.iIcon} />
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	const renderAmount = () => {
		return (
			<View style={styles.amountWrapper}>
				<View style={styles.amountContent}>
					<Text
						style={{
							color: colors.white
						}}
					>
						{strings('paypal_checkout.you_pay')}
					</Text>

					<TrackingTextInput
						placeholder={'0.00'}
						placeholderTextColor={colors.grey300}
						style={styles.amountTextInput}
						value={`${from.amount}`}
						keyboardType={'numeric'}
						onBlur={() => {
							if (from.amount < +boundary[from.currency].min) {
								showError(
									strings('paypal_checkout.minimum_boundary_error_text', {
										value: `${currencyData.find(e => e.key === from.currency).symbol}${`${
											boundary[from.currency]?.min
										}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
									})
								);
								setFrom(pre => ({ ...pre, amount: boundary[from.currency]?.min }));
							}
						}}
						onChangeText={input => {
							const convertInputValue = input
								.replace(/[^\w.,]|_|[a-zA-Z]/g, '')
								.replace(/,/g, '.')
								.replace(/\./, '#')
								.replace(/\./g, '')
								.replace(/#/, '.');
							const convertInputAmount =
								convertInputValue.split('.')[0] +
								(convertInputValue.split('.').length > 1
									? '.' + convertInputValue.split('.')[1].slice(0, 2)
									: '');
							if (+convertInputAmount > boundary[from.currency]?.max) {
								showError(
									strings('paypal_checkout.maximum_boundary_error_text', {
										value: `${currencyData.find(e => e.key === from.currency).symbol}${`${
											boundary[from.currency]?.max
										}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
									})
								);
								return;
							}
							setFrom(pre => ({
								...pre,
								amount: convertInputAmount
							}));
						}}
					/>
				</View>
				<View style={styles.amountButton2}>
					<Image source={FLAGS[from.currency]} style={styles.flag} />
					{from && <Text style={styles.fromText}>{from.currency}</Text>}
					<TouchableOpacity style={styles.dropdownButton} activeOpacity={0.7} onPress={onOpenModal}>
						<Icon name="chevron-down" style={styles.dropdownIcon} />
					</TouchableOpacity>
				</View>
			</View>
		);
	};

	const renderReceive = () => {
		const { color: mainnetColor, name: mainnetName } = Networks.mainnet;

		return (
			<View style={styles.receiveWrapper}>
				<View style={styles.receiveContent}>
					<Text
						style={{
							color: colors.white
						}}
					>
						{strings('paypal_checkout.receive_estimate')}
					</Text>

					<Text style={styles.receiveText}>{to.amount}</Text>
				</View>
				<View style={styles.receiveButton}>
					<View style={styles.receiveRightContent}>
						<Image source={require('images/logo.png')} style={styles.icon} />
						{to && <Text style={styles.currencyText}>{to.currency}</Text>}
					</View>
					<View style={styles.networkWrapper}>
						<View style={[styles.networkColor, { backgroundColor: mainnetColor }]} />
						<Text style={styles.networkTitle}>{mainnetName}</Text>
					</View>
				</View>
			</View>
		);
	};

	const renderContent = () => {
		return (
			<>
				{payPalUrl == null && isLoading == false && (
					<ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollViewContainer}>
						<View style={styles.titleContainer}>
							<View style={styles.titleWrapper}>
								<Text style={styles.title}>{strings('paypal_checkout.buy_crypto')}</Text>
								<TouchableOpacity
									activeOpacity={0.7}
									style={styles.menuButton}
									onPress={() => onViewMenu(true)}
								>
									<Icon name="bars" style={styles.menuIcon} />
								</TouchableOpacity>
							</View>

							{selected && renderAmount()}
							<View style={styles.stepperContainer}>{renderStepper()}</View>
							{selected && renderReceive()}
						</View>
						<View style={styles.fromWrapper}>
							<StyledButton
								type="normal"
								onPress={() => {
									if (from.amount < +boundary[from.currency].min) {
										showError(
											strings('paypal_checkout.minimum_boundary_error_text', {
												value: `${currencyData.find(e => e.key === from.currency).symbol}${`${
													boundary[from.currency]?.min
												}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
											})
										);
										return;
									}
									setIsConfirm(true);
								}}
								disabled={!(selected && from && from.amount > 0 && payPalUrl == null)}
							>
								<Text style={styles.buttonText}>{strings('paypal_checkout.proceed_checkout')}</Text>
							</StyledButton>
						</View>
					</ScrollView>
				)}

				{/* {selected && from && from.amount > 0 && payPalUrl == null && ( */}
				{/* )} */}

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
					onBackdropPress={onCloseModal}
					onBackButtonPress={onCloseModal}
				>
					<View style={styles.modalWrapper}>
						<TrackingScrollView style={styles.modalScrollView}>
							{currencyData.map(e => (
								<TouchableOpacity
									style={styles.modalItemContainer}
									onPress={() => onChangeCurrency(e.value)}
								>
									<Text>{e.label}</Text>
									{from.currency === e.value && <Icon style={styles.modalItemIcon} name={'check'} />}
								</TouchableOpacity>
							))}
						</TrackingScrollView>
					</View>
				</Modal>

				{/* <Modal
					// transparent
					visible={isViewInfoRate}
					onBackdropPress={() => {
						setIsViewInfoRate(false);
					}}
					style={styles.iModal}
				>
					<View style={styles.iContent}>
						<Text style={styles.iText}>{strings('paypal_checkout.rate_info')}</Text>
					</View>
				</Modal> */}
				{isLoading && (
					<View style={styles.fromLoading}>
						<ActivityIndicator size="large" color={colors.purple100} />
					</View>
				)}
			</>
		);
	};
	const renderMenuItem = (item, isBorderBottom) => {
		return (
			<TouchableOpacity
				activeOpacity={0.7}
				style={[styles.menuItem, isBorderBottom && styles.menuItemBorderBottom]}
				onPress={() => onViewMenuContent(item.title, item.url)}
			>
				<Icon name={item.icon} style={styles.menuItemLeftIcon} />
				<Text style={styles.menuItemTitle}>{item.title}</Text>
				<Icon name="angle-right" style={styles.menuItemRightIcon} />
			</TouchableOpacity>
		);
	};

	const renderMenu = () => {
		return (
			<TrackingScrollView style={{}} showsVerticalScrollIndicator={false}>
				<View style={styles.titleContainer}>
					<View style={styles.titleWrapper}>
						<Text style={styles.title}>{strings('paypal_checkout.buy_crypto')}</Text>
						<TouchableOpacity
							activeOpacity={0.7}
							style={styles.menuButton}
							onPress={() => onViewMenu(false)}
						>
							<Icon name="close" style={styles.menuIcon} />
						</TouchableOpacity>
					</View>
					<View style={styles.menuContent}>
						{menuData.map((item, index) => renderMenuItem(item, index !== menuData.length - 1))}
					</View>
				</View>
			</TrackingScrollView>
		);
	};

	const renderDasher = () => {
		return (
			<DashedLine dashLength={6} dashThickness={2} dashGap={2} dashColor={colors.blue} style={styles.dasher} />
		);
	};

	const renderConfirm = () => {
		const { color: mainnetColor, name: mainnetName } = Networks.mainnet;
		return (
			<>
				{payPalUrl === null && isLoading == false && (
					<TrackingScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.scrollViewContainer}
					>
						<View style={styles.titleContainer}>
							<View style={styles.titleWrapper}>
								<TouchableOpacity
									activeOpacity={0.7}
									style={styles.menuButton}
									onPress={() => setIsConfirm(false)}
								>
									<Icon name="arrow-left" style={styles.menuIcon} />
								</TouchableOpacity>
								<Text style={styles.title}>
									{strings('paypal_checkout.buy_token_to_wallet', { token: to.currency })}
								</Text>
								<TouchableOpacity
									activeOpacity={0.7}
									style={styles.menuButton}
									onPress={() => onViewMenu(true)}
								>
									<Icon name="bars" style={styles.menuIcon} />
								</TouchableOpacity>
							</View>
							<View style={styles.confirmTopWrapper}>
								<Text style={styles.confirmSectionTitle}>
									{strings('paypal_checkout.token_wallet_address', { token: to.currency })}
								</Text>
								<View style={styles.confirmTopNameWrapper}>
									<View style={styles.confirmNameMarker} />
									<Text style={styles.confirmTokenName}>{Routes.mainNetWork.coin}</Text>
								</View>
								<View style={styles.networkWrapper}>
									<View style={[styles.networkColor, { backgroundColor: mainnetColor }]} />
									<Text style={styles.networkTitle}>{mainnetName}</Text>
								</View>
							</View>
							<TouchableOpacity
								style={styles.addressWrapper}
								activeOpacity={0.7}
								onPress={onPressAddress}
								onLongPress={onLongPressAddress}
							>
								{/* <TrackingScrollView style={styles.addressScroll} horizontal> */}
								<Text style={styles.address} numberOfLines={isViewFullAddress ? 10 : 1}>
									{selectedAddress.selectedAddress}
								</Text>
								{/* </TrackingScrollView> */}
								<Image source={require('images/logo.png')} style={styles.icon} />
							</TouchableOpacity>
							<Text style={styles.confirmSectionTitle}>{strings('paypal_checkout.order_details')}</Text>
							{renderDasher()}
							<View style={styles.confirmContentItemWrapper}>
								<Text style={styles.confirmContentLeft}>{`${to.amount} ${
									to.currency
								} @ ${priceOneToken} ${from.currency}`}</Text>
								<Text style={styles.confirmContentRight}>{`${from.amount} ${from.currency}`}</Text>
							</View>
							{renderDasher()}
							<View style={styles.confirmContentItemWrapper}>
								<Text style={styles.confirmContentLeft}>{strings('paypal_checkout.paypal_fee')}</Text>
								<Text style={styles.confirmContentRight}>{`${paypalFee} ${from.currency}`}</Text>
							</View>
							{renderDasher()}
							<View style={styles.confirmContentItemWrapper}>
								<Text style={styles.confirmContentLeft}>
									{strings('paypal_checkout.token_fee', { token: Routes.mainNetWork.coin })}
								</Text>
								<Text style={styles.confirmContentRight}>{`${tokenFee} ${from.currency}`}</Text>
							</View>
							{renderDasher()}
							<View style={styles.confirmContentItemWrapper}>
								<Text style={styles.confirmContentLeft}>
									{strings('paypal_checkout.network_exchange_fee')}
								</Text>
								<Text style={styles.confirmContentRight}>{`${networkFee} ${from.currency}`}</Text>
							</View>
							{renderDasher()}
							<View style={styles.confirmContentItemWrapper}>
								<Text style={styles.confirmTotalLeft}>{strings('paypal_checkout.total')}</Text>
								<Text style={styles.confirmTotalRight}>{`${from.amount} ${from.currency}`}</Text>
							</View>
						</View>
						<View style={styles.fromWrapper}>
							<StyledButton
								type="normal"
								onPress={() => {
									payWithPayPal();
								}}
							>
								<Text style={styles.buttonText}>
									{strings('paypal_checkout.buy_token', { token: to.currency })}
								</Text>
							</StyledButton>
						</View>
					</TrackingScrollView>
				)}
				{payPalUrl !== null && (
					<WebView
						source={{ uri: payPalUrl }}
						startInLoadingState={true}
						javaScriptEnabled={true}
						thirdPartyCookiesEnabled={true}
						incognito={true}
						renderLoading={() => (
							<View style={styles.webView}>
								<ActivityIndicator size="large" color={colors.purple100} />
							</View>
						)}
						onLoadEnd={() => {
							console.log('Loaded');
						}}
						onShouldStartLoadWithRequest={request => {
							console.log({ request });
							if (request && request.url.startsWith('https://www.sandbox.paypal.com')) {
								console.log('This should load');
								return true;
							} else if (request) {
								manageRequest(request.url);
								return false;
							} else {
								return false;
							}
						}}
					/>
				)}
				{isLoading && (
					<View style={styles.fromLoading}>
						<ActivityIndicator size="large" color={colors.purple100} />
					</View>
				)}
			</>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			{isViewMenu ? renderMenu() : isConfirm ? renderConfirm() : renderContent()}
		</SafeAreaView>
	);
}

PayPal.propTypes = {
	selectedAddress: PropTypes.any,
	accounts: PropTypes.object,
	identities: PropTypes.object,
	chainId: PropTypes.string,
	ticker: PropTypes.string,
	currentCurrency: PropTypes.string,
	tokens: PropTypes.array
};

PayPal.navigationOptions = ({ navigation }) => getPayPalNavbar(navigation);
const mapDispatchToProps = dispatch => ({
	showAlert: config => dispatch(showAlert(config))
});
const mapStateToProps = state => ({
	provider: state.engine.backgroundState.NetworkController.provider,
	tokens: state.engine.backgroundState.AssetsController.tokens,
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
	selectedAddress: state.engine.backgroundState.PreferencesController,
	identities: state.engine.backgroundState.PreferencesController.identities,
	chainId: state.engine.backgroundState.NetworkController.provider.chainId,
	ticker: state.engine.backgroundState.NetworkController.provider.ticker,
	conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(PayPal);
