import React, { useState, useEffect, useCallback } from 'react';
import { View, Text, SafeAreaView, Image, TouchableOpacity, ActivityIndicator, Platform } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import Icon from 'react-native-vector-icons/FontAwesome';
import IconFontAwesome5 from 'react-native-vector-icons/FontAwesome5';
import { getWyreNavbar } from '../../../../UI/Navbar';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import API from 'services/api';
import Routes from 'common/routes';
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
import ScaleImage from 'react-native-scalable-image';
import Countries from '../../../../../util/countries.json';
import validator from 'validator';
import { testID } from '../../../../../util/Logger';

const FLAGS = {
	USD: require('../../../../../images/usa-flag.png'),
	EUR: require('../../../../../images/eu-flag.png')
};

const WYRE_LOGO = require('../../../../../images/wyre.png');
const APPLE_PAY_LOGO = require('../../../../../images/ApplePayLogo.png');

const menuData = [
	{
		icon: 'question-circle-o',
		title: strings('wyre_checkout.support'),
		url: 'https://support.sendwyre.com/hc/en-us'
	},
	{
		icon: 'lock',
		title: strings('wyre_checkout.privacy_policy'),
		url: 'https://www.sendwyre.com/legal/privacy-policy'
	},
	{
		icon: 'file-text-o',
		title: strings('wyre_checkout.terms_of_service'),
		url: 'https://www.sendwyre.com/legal/rewards-terms'
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

// Wyre Non-operational Countries
// https://support.sendwyre.com/hc/en-us/articles/360055233754-Geographic-Restrictions-

const NON_OPERATIONSAL_COUNTRIES = [
	'Afghanistan',
	'American Samoa',
	'Angola',
	'Anguilla',
	'Barbados',
	'Belarus',
	'Bosnia and Herzegovina',
	'Central African Republic',
	'Congo',
	"Cote D'Ivoire",
	'Cuba',
	'Ecuador',
	'Eritrea',
	'Ethiopia',
	'Fiji',
	'Guam',
	'Guinea-Bissau',
	'Guyana',
	'Haiti',
	'Iran',
	'Iraq',
	'Kosovo',
	'Lebanon',
	'Liberia',
	'Libya',
	'Macedonia',
	'Myanmar',
	'Nigeria',
	'North-Korea',
	'Palau',
	'Panama',
	'Papua New Guinea',
	'Russia',
	'Samoa',
	'Serbia',
	'Seychelles',
	'Somalia',
	'Sudan',
	'Syria',
	'Trinidad and Tobago',
	'Turkey',
	'Turkmenistan',
	'Ukraine',
	'US Virgin Islands',
	'Uzbekistan',
	'Vanuatu',
	'Venezuela',
	'Yemen',
	'Zimbabwe'
];

function Wyre({ selectedAddress, ...props }) {
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
	const [wyreUrl, setWyreUrl] = useState(null);
	const [orderId, setOrderId] = useState(null);
	const [viewFeeCalculation, setViewFeeCalculation] = useState(false);
	const [isChangeCurrency, setIsChangeCurrency] = useState(false);
	const [currencyData, setCurrencyData] = useState([]);
	const [isLoading, setLoading] = useState(false);
	const [isViewMenu, setIsViewMenu] = useState(false);
	const [priceOneToken, setPriceOneToken] = useState(0);
	const [wyreFee, setWyreFee] = useState(7.98);
	const [tokenFee, setTokenFee] = useState(45.96);
	const [networkFee, setNetworkFee] = useState(1.44);
	const [totalFee, setTotalFee] = useState(11.42);
	const [isCheckoutWyre, setIsCheckoutWyre] = useState(false);
	const [isConfirm, setIsConfirm] = useState(false);
	const [isViewInfoRate, setIsViewInfoRate] = useState(false);
	const [isViewFullAddress, setIsViewFullAddress] = useState(false);
	const [isChangeCountry, setIsChangeCountry] = useState(false);
	const [cardInfo, setCardInfo] = useState({
		email: '',
		number: '',
		expiredDate: '',
		cvc: '',
		name: '',
		country: ''
	});
	const [emailError, setEmailError] = useState({
		isError: false,
		errorMessage: ''
	});
	const [cardInfoError, setCardInfoError] = useState({
		isCardNumberError: false,
		isExpiredDateError: false,
		isCVCError: false,
		errorMessage: ''
	});
	const [cardNameError, setCardNameError] = useState({
		isError: false,
		errorMessage: false
	});
	const [countryError, setCountryError] = useState({
		isError: false,
		errorMessage: false
	});

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

	const checkEmailError = () => {
		const isEmailError = !validator.isEmail(cardInfo.email.trim());
		setEmailError({
			isError: isEmailError,
			errorMessage: !cardInfo.email
				? strings('wyre_checkout.missing_email')
				: isEmailError
				? strings('wyre_checkout.invalid_email')
				: ''
		});
		return isEmailError;
	};

	const cleanEmailError = () => {
		setEmailError({ isError: false, errorMessage: '' });
	};

	const checkCardInfoError = () => {
		const isCardNumberError = cardInfo.number.length < 19;
		const isExpiredDateError = checkExpiredDateError(cardInfo.expiredDate);
		const isCVCError = cardInfo.cvc.length < 3;
		const errorMessage = !cardInfo.number
			? strings('wyre_checkout.missing_card_number')
			: isCardNumberError
			? strings('wyre_checkout.invalid_card_number')
			: !cardInfo.expiredDate
			? strings('wyre_checkout.missing_expired_date')
			: isExpiredDateError
			? strings('wyre_checkout.invalid_expired_date')
			: !cardInfo.cvc
			? strings('wyre_checkout.missing_cvc')
			: isCVCError
			? strings('wyre_checkout.invalid_cvc')
			: '';
		setCardInfoError({
			isCardNumberError,
			isExpiredDateError,
			isCVCError,
			errorMessage
		});
		return isCardNumberError || isExpiredDateError || isCVCError;
	};

	const cleanCardInfoError = field => {
		setCardInfoError(pre => ({
			...pre,
			[field]: false,
			errorMessage: ''
		}));
	};

	const checkCardNameError = () => {
		setCardNameError({
			isError: !cardInfo.name,
			errorMessage: !cardInfo.name ? strings('wyre_checkout.missing_name_of_card') : ''
		});
		return !cardInfo.name;
	};

	const cleanCardNameError = () => {
		setEmailError({ isError: false, errorMessage: '' });
	};

	const checkCountryError = () => {
		setCountryError({
			isError: !cardInfo.country,
			errorMessage: !cardInfo.country ? strings('wyre_checkout.missing_country_or_region') : ''
		});
		return !cardInfo.country;
	};

	const cleanCountryError = () => {
		setCountryError({ isError: false, errorMessage: '' });
	};

	const checkExpiredDateError = expiredDate => {
		const month = expiredDate.split(' / ')[0];
		const year = expiredDate.split(' / ')[1];
		if (!['01', '02', '03', '04', '05', '06', '07', '08', '09', '10', '11', '12'].includes(month)) {
			return true;
		}
		if (!year || year.length !== 2) {
			return true;
		}
		return false;
	};

	const onPay = () => {
		const isEmailError = checkEmailError();
		const isCardInfoError = checkCardInfoError();
		const isCardNameError = checkCardNameError();
		const isCountryError = checkCountryError();
		if (isEmailError || isCardInfoError || isCardNameError || isCountryError) {
			return;
		}
	};

	const onChangeEmail = email => {
		setCardInfo(pre => ({ ...pre, email }));
	};

	const onChangeCardNumber = cardNumber => {
		const rawData = cardNumber.replace(/[^\w]|_|[a-zA-Z]/g, '');

		setCardInfo(pre => ({ ...pre, number: rawData.replace(/.{4}/g, '$& ').slice(0, 19) }));
	};

	const onChangeExpiredDate = expiredDate => {
		setCardInfo(pre => {
			const preExpiredDate = pre.expiredDate;
			let month = expiredDate.split(' / ')[0]?.replace(/[^\w]|_|[a-zA-Z]/g, '');
			let year = expiredDate
				.split(' / ')[1]
				?.replace(/[^\w]|_|[a-zA-Z]/g, '')
				.slice(0, 2);

			console.log({ month, year });

			const preMonth = preExpiredDate.split(' / ')[0];
			if (['2', '3', '4', '5', '6', '7', '8', '9'].includes(month)) {
				month = `0${month}`;
			}
			if (month.length > 2 && typeof year === 'undefined') {
				year = month.slice(2, 4)?.replace(/[^\w]|_|[a-zA-Z]/g, '');
				month = month.slice(0, 2);
			}
			if (+month > 12) {
				month = month[0];
			}
			if (typeof year !== 'undefined' && year.length > 2) {
				year = year.slice(0, 2);
			}
			if (typeof year === 'undefined' && month.length === 2 && preMonth.length < 2) {
				year = '';
			}
			return {
				...pre,
				expiredDate: typeof year !== 'undefined' ? [month, year].join(' / ') : month
			};
		});
	};

	const onChangeCVC = cvc => {
		setCardInfo(pre => ({ ...pre, cvc: cvc.replace(/[^\w]|_|[a-zA-Z]/g, '') }));
	};

	const onChangeCardName = name => {
		setCardInfo(pre => ({ ...pre, name: name.toUpperCase() }));
	};

	const captureWyreOrder = url => {
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
					console.log('success wyre transactions');
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
					console.log('error wyre transactions');
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
			captureWyreOrder(url);
		} else {
			// unknown url
			// captureWyreOrder()
		}
	};

	const payWithWyre = () => {
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

		setIsCheckoutWyre(true);
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
						<Text style={styles.markText}>{strings('wyre_checkout.using_payment_method')}</Text>
					</View>
					<TouchableOpacity style={styles.stepperButton} activeOpacity={0.7}>
						<View style={styles.stepperButtonContent}>
							<Image source={WYRE_LOGO} style={styles.logo} />
							<Text style={styles.stepperButtonText}>{strings('wyre_checkout.wyre')}</Text>
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
								? strings('wyre_checkout.hide_calculation')
								: strings('wyre_checkout.see_calculation')}
						</Text>
					</View>
					<View style={styles.collapsibleWrapper}>
						<Collapsible collapsed={!viewFeeCalculation} style={styles.collapsible}>
							<View style={styles.sRow}>
								<View style={styles.sMark} />
								<Text style={styles.markText}>{`${wyreFee} ${from.currency}`}</Text>
								<Text style={styles.markTitleText}>{strings('wyre_checkout.wyre_fee')}</Text>
							</View>
							<View style={styles.sRow}>
								<View style={styles.sMark} />
								<Text style={styles.markText}>{`${tokenFee} ${from.currency}`}</Text>
								<Text style={styles.markTitleText}>
									{strings('wyre_checkout.token_fee', { token: Routes.mainNetWork.coin })}
								</Text>
							</View>
							<View style={styles.sRow}>
								<View style={styles.sMark} />
								<Text style={styles.markText}>{`${networkFee} ${from.currency}`}</Text>
								<Text style={styles.markTitleText}>
									{strings('wyre_checkout.network_exchange_fee')}
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
					<Text style={styles.markTitleText}>{strings('wyre_checkout.total_fees')}</Text>
				</View>

				<View style={styles.mRow}>
					{isViewInfoRate && (
						<View style={styles.iContent}>
							<Text style={styles.iText}>{strings('wyre_checkout.rate_info')}</Text>
						</View>
					)}
					<View style={styles.mMark}>
						<IconFontAwesome5 name="divide" style={styles.markIcon} />
					</View>
					<Text style={styles.markText}>{`${priceOneToken} ${from.currency} = 1`}</Text>
					<Text style={styles.tokenText}>{to.currency}</Text>
					<Text style={styles.markTitleText}>{strings('wyre_checkout.rate')}</Text>
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
						{strings('wyre_checkout.you_pay')}
					</Text>

					<TrackingTextInput
						{...testID('payment-wyre-amount-field')}
						placeholder={'0.00'}
						placeholderTextColor={colors.grey300}
						style={styles.amountTextInput}
						value={`${from.amount}`}
						keyboardType={'numeric'}
						onBlur={() => {
							if (from.amount < +boundary[from.currency].min) {
								showError(
									strings('wyre_checkout.minimum_boundary_error_text', {
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
									strings('wyre_checkout.maximum_boundary_error_text', {
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
						{strings('wyre_checkout.receive_estimate')}
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
				{wyreUrl == null && isLoading == false && (
					<TrackingScrollView
						showsVerticalScrollIndicator={false}
						contentContainerStyle={styles.scrollViewContainer}
					>
						<View style={styles.titleContainer}>
							<View style={styles.titleWrapper}>
								<Text style={styles.title}>{strings('wyre_checkout.buy_crypto')}</Text>
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
								testID={'wyre-component-proceed-checkout-button'}
								type="normal"
								onPress={() => {
									if (from.amount < +boundary[from.currency].min) {
										showError(
											strings('wyre_checkout.minimum_boundary_error_text', {
												value: `${currencyData.find(e => e.key === from.currency).symbol}${`${
													boundary[from.currency]?.min
												}`.replace(/\B(?=(\d{3})+(?!\d))/g, ',')}`
											})
										);
										return;
									}
									setIsConfirm(true);
								}}
								disabled={!(selected && from && from.amount > 0 && wyreUrl == null)}
							>
								<Text style={styles.buttonText}>{strings('wyre_checkout.proceed_checkout')}</Text>
							</StyledButton>
						</View>
					</TrackingScrollView>
				)}

				{/* {selected && from && from.amount > 0 && wyreUrl == null && ( */}
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
						<Text style={styles.iText}>{strings('wyre_checkout.rate_info')}</Text>
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
						<Text style={styles.title}>{strings('wyre_checkout.buy_crypto')}</Text>
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
				{wyreUrl === null && isLoading == false && (
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
									{strings('wyre_checkout.buy_token_to_wallet', { token: to.currency })}
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
									{strings('wyre_checkout.token_wallet_address', { token: to.currency })}
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
							<Text style={styles.confirmSectionTitle}>{strings('wyre_checkout.order_details')}</Text>
							{renderDasher()}
							<View style={styles.confirmContentItemWrapper}>
								<Text style={styles.confirmContentLeft}>{`${to.amount} ${
									to.currency
								} @ ${priceOneToken} ${from.currency}`}</Text>
								<Text style={styles.confirmContentRight}>{`${from.amount} ${from.currency}`}</Text>
							</View>
							{renderDasher()}
							<View style={styles.confirmContentItemWrapper}>
								<Text style={styles.confirmContentLeft}>{strings('wyre_checkout.wyre_fee')}</Text>
								<Text style={styles.confirmContentRight}>{`${wyreFee} ${from.currency}`}</Text>
							</View>
							{renderDasher()}
							<View style={styles.confirmContentItemWrapper}>
								<Text style={styles.confirmContentLeft}>
									{strings('wyre_checkout.token_fee', { token: Routes.mainNetWork.coin })}
								</Text>
								<Text style={styles.confirmContentRight}>{`${tokenFee} ${from.currency}`}</Text>
							</View>
							{renderDasher()}
							<View style={styles.confirmContentItemWrapper}>
								<Text style={styles.confirmContentLeft}>
									{strings('wyre_checkout.network_exchange_fee')}
								</Text>
								<Text style={styles.confirmContentRight}>{`${networkFee} ${from.currency}`}</Text>
							</View>
							{renderDasher()}
							<View style={styles.confirmContentItemWrapper}>
								<Text style={styles.confirmTotalLeft}>{strings('wyre_checkout.total')}</Text>
								<Text style={styles.confirmTotalRight}>{`${from.amount} ${from.currency}`}</Text>
							</View>
						</View>
						<View style={styles.fromWrapper}>
							<StyledButton
								testID={'wyre-component-buy-token-button'}
								type="normal"
								onPress={() => {
									payWithWyre();
								}}
							>
								<Text style={styles.buttonText}>
									{strings('wyre_checkout.buy_token', { token: to.currency })}
								</Text>
							</StyledButton>
						</View>
					</TrackingScrollView>
				)}
				{wyreUrl !== null && (
					<WebView
						source={{ uri: wyreUrl }}
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

	const renderCheckout = () => {
		const isIOS = Platform.OS === 'ios';
		return (
			<>
				<TrackingScrollView showsVerticalScrollIndicator={false}>
					<View style={styles.titleContainer}>
						<View style={styles.titleWrapper}>
							<TouchableOpacity
								activeOpacity={0.7}
								style={styles.menuButton}
								onPress={() => setIsCheckoutWyre(false)}
							>
								<Icon name="arrow-left" style={styles.menuIcon} />
							</TouchableOpacity>
							<Text style={styles.title}>
								{strings('wyre_checkout.wyre_payment', { token: to.currency })}
							</Text>
							<TouchableOpacity
								activeOpacity={0.7}
								style={styles.menuButton}
								onPress={() => onViewMenu(true)}
							>
								<Icon name="bars" style={styles.menuIcon} />
							</TouchableOpacity>
						</View>
						{Platform.OS === 'ios' && (
							<>
								<TouchableOpacity style={styles.buttonIPay} activeOpacity={0.7}>
									<ScaleImage source={APPLE_PAY_LOGO} style={styles.iPayIcon} />
								</TouchableOpacity>
								<View style={styles.sectionWrapper}>
									<View style={styles.sectionLineWrapper}>
										<View style={styles.sectionLine} />
									</View>
									<Text style={styles.sectionText}>{strings('wyre_checkout.or_pay_witth_card')}</Text>
								</View>
							</>
						)}
						<Text style={styles.label}>{strings('wyre_checkout.email')}</Text>
						<TrackingTextInput
							{...testID('payment-wyre-email-field')}
							style={[
								styles.emailInput,
								isIOS ? styles.inputIOS : styles.inputAndroid,
								emailError.isError && styles.errorInput
							]}
							value={cardInfo.email}
							onChangeText={onChangeEmail}
							onBlur={checkEmailError}
							onFocus={cleanEmailError}
						/>
						{!!emailError.errorMessage && <Text style={styles.errorText}>{emailError.errorMessage}</Text>}
						<Text style={styles.label}>{strings('wyre_checkout.card_infomation')}</Text>
						<View style={styles.cardInfoWrapper}>
							<View style={styles.cardNumberWrapper}>
								<TrackingTextInput
									{...testID('payment-wyre-card-number-field')}
									style={[
										styles.cardNumber,
										isIOS ? styles.inputIOS : styles.inputAndroid,
										cardInfoError.isCardNumberError && styles.errorInput
									]}
									placeholder={'1234 1234 1234 1234'}
									placeholderTextColor={colors.grey300}
									value={cardInfo.number}
									maxLength={19}
									onChangeText={onChangeCardNumber}
									onBlur={checkCardInfoError}
									onFocus={() => cleanCardInfoError('isCardNumberError')}
								/>
							</View>
							<View style={styles.cardInfoBottomWrapper}>
								<TrackingTextInput
									{...testID('payment-wyre-expired-date-field')}
									style={[
										styles.mmYY,
										isIOS ? styles.inputIOS : styles.inputAndroid,
										cardInfoError.isExpiredDateError && styles.errorInput
									]}
									placeholder={strings('wyre_checkout.mm_yy')}
									placeholderTextColor={colors.grey300}
									value={cardInfo.expiredDate}
									onChangeText={onChangeExpiredDate}
									onBlur={checkCardInfoError}
									maxLength={7}
									onFocus={() => cleanCardInfoError('isExpiredDateError')}
								/>
								<View
									style={[
										styles.cardCVCWrapper,
										isIOS ? styles.inputIOS : styles.inputAndroid,
										cardInfoError.isCVCError && styles.errorInput
									]}
								>
									<TrackingTextInput
										{...testID('payment-wyre-cvc-field')}
										style={styles.cardCVC}
										placeholder={strings('wyre_checkout.cvc')}
										placeholderTextColor={colors.grey300}
										keyboardType="numeric"
										value={cardInfo.cvc}
										maxLength={3}
										onChangeText={onChangeCVC}
										onBlur={checkCardInfoError}
										onFocus={() => cleanCardInfoError('isCVCError')}
									/>
								</View>
							</View>
						</View>
						{!!cardInfoError.errorMessage && (
							<Text style={styles.errorText}>{cardInfoError.errorMessage}</Text>
						)}
						<Text style={styles.label}>{strings('wyre_checkout.name_of_card')}</Text>
						<TrackingTextInput
							{...testID('payment-wyre-email-field')}
							style={[
								styles.emailInput,
								isIOS ? styles.inputIOS : styles.inputAndroid,
								cardNameError.isError && styles.errorInput
							]}
							value={cardInfo.name}
							onChangeText={onChangeCardName}
							autoCapitalize="characters"
							onBlur={checkCardNameError}
							onFocus={cleanCardNameError}
							maxLength={256}
						/>
						{!!cardNameError.errorMessage && (
							<Text style={styles.errorText}>{cardNameError.errorMessage}</Text>
						)}
						<Text style={styles.label}>{strings('wyre_checkout.country_or_region')}</Text>
						<TouchableOpacity
							style={[styles.countryWrapper, countryError.isError && styles.errorInput]}
							activeOpacity={0.7}
							onPress={() => {
								setIsChangeCountry(true);
								cleanCountryError();
							}}
						>
							<Text style={styles.country}>{cardInfo.country}</Text>
							<Icon name="chevron-down" style={styles.countryDropdownIcon} />
						</TouchableOpacity>
						{!!countryError.errorMessage && (
							<Text style={styles.errorText}>{countryError.errorMessage}</Text>
						)}
					</View>
					<View style={styles.fromWrapper}>
						<StyledButton testID={'wyre-component-pay-button'} type="normal" onPress={onPay}>
							<Text style={styles.buttonText}>
								{strings('wyre_checkout.pay', { token: to.currency })}
							</Text>
						</StyledButton>
					</View>
				</TrackingScrollView>
				<Modal
					isVisible={isChangeCountry}
					animationIn="slideInUp"
					animationOut="slideOutDown"
					style={styles.modalContainer}
					backdropOpacity={0.7}
					animationInTiming={600}
					animationOutTiming={600}
					swipeDirection={'down'}
					propagateSwipe
					onBackdropPress={() => {
						setIsChangeCountry(false);
						checkCountryError();
					}}
					onBackButtonPress={() => {
						setIsChangeCountry(false);
						checkCountryError();
					}}
				>
					<View style={styles.modalWrapper}>
						<TrackingScrollView>
							{Countries.filter(e => !NON_OPERATIONSAL_COUNTRIES.includes(e.name)).map(e => {
								return (
									<TouchableOpacity
										key={e.code}
										style={styles.countryItemWrapper}
										activeOpacity={0.7}
										onPress={() => {
											setCardInfo(pre => ({ ...pre, country: e.name }));
											setIsChangeCountry(false);
											cleanCountryError();
										}}
									>
										<View style={styles.countryItem}>
											<Text style={styles.countryText} numberOfLines={4}>
												{e.name}
											</Text>
										</View>
									</TouchableOpacity>
								);
							})}
						</TrackingScrollView>
					</View>
				</Modal>
			</>
		);
	};

	return (
		<SafeAreaView style={styles.container}>
			{isViewMenu
				? renderMenu()
				: isCheckoutWyre
				? renderCheckout()
				: isConfirm
				? renderConfirm()
				: renderContent()}
		</SafeAreaView>
	);
}

Wyre.propTypes = {
	selectedAddress: PropTypes.any,
	accounts: PropTypes.object,
	identities: PropTypes.object,
	chainId: PropTypes.string,
	ticker: PropTypes.string,
	currentCurrency: PropTypes.string,
	tokens: PropTypes.array
};

Wyre.navigationOptions = ({ navigation }) => getWyreNavbar(navigation);
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
)(Wyre);
