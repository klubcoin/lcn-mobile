import React, { useState, useEffect } from 'react';
import { View, Text, Dimensions, SafeAreaView, Image, TouchableOpacity, ActivityIndicator } from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome';
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

const width = Math.round(Dimensions.get('window').width);
function PayPal({ selectedAddress, ...props }) {
	const [from, setFrom] = useState({
		currency: 'EUR',
		amount: 0
	});
	const [to, setTo] = useState({
		currency: 'KLC',
		amount: 0
	});
	const [selected, setSelected] = useState(null);
	const [currencies, setCurrencies] = useState([]);
	const [errorMessage, setErrorMessage] = useState(null);
	const [payPalUrl, setPayPalUrl] = useState(null);
	const [orderId, setOrderId] = useState(null);
	const [isLoading, setLoading] = useState(false);

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
						manageCurrencies();
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

	manageCurrencies = () => {
		for (var i = 0; i < currencies.length; i++) {
			let item = currencies[i];
			if (item.from.currency === from.currency && item.to.currency === to.currency) {
				setSelected(item);
				break;
			}
		}
	};

	getFeatherIcon = (name, size) => {
		return <FeatherIcon name={name} size={size || 24} color={colors.grey600} />;
	};

	getBalance = async () => {
		const { accounts, identities } = props;
		let params = [selectedAddress.selectedAddress];
		await API.postRequest(
			Routes.getBalance,
			params,
			response => {
				const balance = response.result ? response.result : 0x00;
				console.log({
					getBalance: response
				});
				accounts[selectedAddress.selectedAddress] = {
					balance: balance
				};
				const { AccountTrackerController } = Engine.context;
				AccountTrackerController.update({ accounts: Object.assign({}, accounts) });
				props.navigation.navigate('Home');
			},
			error => {
				console.log(error.message);
			}
		);
		// }
	};

	paypalDirect = () => {
		API.paypalPostRequest(
			response => {
				console.log(response);
				if (response && response.access_token != null) {
					API.paypalCreateOrderRequest(
						{
							intent: 'CAPTURE',
							purchase_units: [
								{
									amount: {
										currency_code: 'USD',
										value: '100.00'
									}
								}
							]
						},
						response.access_token,
						orderResponse => {
							console.log(orderResponse);
							if (
								orderResponse &&
								(orderResponse.links || (orderResponse.links && orderResponse.links.length > 0))
							) {
								orderResponse.links.map(item => {
									if (item.rel === 'approve') {
										console.log('load link', item.href);
										setPayPalUrl(item.href);
									}
								});
							}
						},
						errorOrderResponse => {
							console.log('error', errorOrderResponse.message);
						}
					);
				}
			},
			error => {
				console.log(error);
			}
		);
	};

	capturePayPalOrder = url => {
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

	manageRequest = url => {
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

	const stepper = () => {
		return (
			<View style={styles.stepperWrapper}>
				<View style={styles.stepperCheckout}>
					<Text style={{ color: colors.white }}>{strings('paypal_checkout.using_payment_method')}</Text>
					<TouchableOpacity style={styles.stepperButton}>
						<View style={styles.stepperButtonContent}>
							<Icon name={'paypal'} size={22} color={colors.white} />
							<Text style={styles.stepperButtonText}>{strings('paypal_checkout.paypal')}</Text>
						</View>
					</TouchableOpacity>
				</View>

				<TouchableOpacity style={styles.seeCalculationButton}>
					<Text style={{ color: colors.white }}>{strings('paypal_checkout.see_calculation')}</Text>
				</TouchableOpacity>

				{from && (
					<TouchableOpacity style={styles.amountButton}>
						<Text style={{ color: colors.white }}>{from.amount + ' ' + from.currency}</Text>
					</TouchableOpacity>
				)}

				{selected && from && (
					<TouchableOpacity style={styles.selectedAmountButton}>
						<Text>{from.amount * selected.to.value + ' ' + selected.to.currency}</Text>
					</TouchableOpacity>
				)}
			</View>
		);
	};

	const amount = () => {
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
						onChangeText={input => {
							setFrom({
								...from,
								amount: input
							});
							if (selected && selected.to) {
								setTo({
									...to,
									amount: selected.to.value * input
								});
							}
						}}
					/>
				</View>
				<View style={styles.amountButton2}>{from && <Text style={styles.fromText}>{from.currency}</Text>}</View>
			</View>
		);
	};

	const receive = () => {
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

					<Text style={styles.receiveText}>{from.amount * selected.to.value}</Text>
				</View>
				<View style={styles.receiveButton}>
					<View style={styles.receiveRightContent}>
						<Image source={require('images/logo.png')} style={styles.icon} />
						{to && <Text style={styles.currencyText}>{to.currency}</Text>}
					</View>
					{/*
            network && (
              <Text style={{
                width: '100%',
                textAlign: 'center',
                fontSize: 11
              }}>{network.name}</Text>
            )
          */}
				</View>
			</View>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			{payPalUrl == null && isLoading == false && (
				<TrackingScrollView style={{}} showsVerticalScrollIndicator={false}>
					<View style={styles.titleContainer}>
						<View>
							<Text style={styles.titleWrapper}>{strings('paypal_checkout.buy_crypto')}</Text>

							{selected && amount()}
							<View style={styles.stepperContainer}>{stepper()}</View>
							{selected && receive()}
						</View>
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
			{selected && from && from.amount > 0 && payPalUrl == null && (
				<View style={styles.fromWrapper}>
					<TouchableOpacity
						style={styles.fromButton}
						onPress={() => {
							payWithPayPal();
						}}
					>
						<Text
							style={{
								color: colors.white
							}}
						>
							{strings('paypal_checkout.proceed_checkout')}
						</Text>
					</TouchableOpacity>
				</View>
			)}
			{isLoading && (
				<View style={styles.fromLoading}>
					<ActivityIndicator size="large" color={colors.purple100} />
				</View>
			)}
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

const mapStateToProps = state => ({
	tokens: state.engine.backgroundState.AssetsController.tokens,
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
	selectedAddress: state.engine.backgroundState.PreferencesController,
	identities: state.engine.backgroundState.PreferencesController.identities,
	chainId: state.engine.backgroundState.NetworkController.provider.chainId,
	ticker: state.engine.backgroundState.NetworkController.provider.ticker,
	conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate
});

export default connect(mapStateToProps)(PayPal);
