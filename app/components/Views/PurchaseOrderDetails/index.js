import React, { useEffect, useState } from 'react';
import { Image, View, StyleSheet, BackHandler, ScrollView } from 'react-native';
import Text from '../../Base/Text';
import { colors } from '../../../styles/common';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import StyledButton from '../../UI/StyledButton';
import { getPurchaseOrderDetailsNavbarOptions } from '../../UI/Navbar';
import { connect } from 'react-redux';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import preferences from '../../../store/preferences';
import drawables from '../../../common/drawables';
import { hexToBN, fromWei } from '../../../util/number';
import Routes from 'common/routes';
import moment from 'moment';
import APIService from '../../../services/APIService';
import infuraCurrencies from '../../../util/infura-conversion.json';
import BigNumber from 'bignumber.js';

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
		height: 90
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
	itemText: {
		color: colors.white,
		fontWeight: '500'
	},
	totalText: {
		color: colors.white,
		fontWeight: 'bold'
	},
	rightWrapper: {
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
	}
});

const PARTNER_LOGO = require('../../../images/clubbingtv_logo.jpeg');

const PurchaseOrderDetails = ({ navigation, selectedAddress, accounts, identities }) => {
	const [account, setAccount] = useState({});
	const [avatar, setAvatar] = useState('');
	const [currency, setCurrency] = useState('usd');
	const [currencySymbol, setCurrencySymbol] = useState('usd');
	const [balance, setBalance] = useState('0');
	const [currencies, setCurrencies] = useState([]);
	const [price, setPrice] = useState('');

	useEffect(() => {
		BackHandler.addEventListener('hardwareBackPress', onBack);
		return () => {
			BackHandler.removeEventListener('hardwareBackPress', onBack);
		};
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
			const totalBalance = bigNumberTotalToken.multipliedBy(`${price}`);
			setBalance(totalBalance.toString());
		}
	}, [account.decBalance, price]);

	const featchPrice = () => {
		const toDate = new Date();
		let fromDate = new Date(moment().subtract(1, 'days'));
		APIService.getChartData('KLC', currency.toUpperCase(), fromDate, toDate, (success, json) => {
			if (success && json?.data && Array.isArray(json.data)) {
				setPrice(json.data[json.data.length - 1].value);
			}
		});
	};

	const onCancel = () => {
		navigation.goBack();
	};

	const onPurchase = () => {
		navigation.navigate('PurchaseSuccess');
	};

	const renderOrderDetail = () => {
		return (
			<>
				<View style={styles.content}>
					<Image
						source={avatar ? { uri: `file://${avatar}` } : drawables.avatar_user}
						style={styles.avatar}
					/>
					<Text style={styles.name}>{account.name}</Text>
					<Text style={styles.balance}>{`${fromWei(hexToBN(account?.balance))} ${
						Routes.klubToken.symbol
					}`}</Text>
					<Text style={styles.balance}>{`${currencySymbol} ${balance}`}</Text>
					<View style={styles.line} />
					<Image source={PARTNER_LOGO} style={styles.partnerLogo} />
					<Text style={styles.amountToPay}>
						{strings('purchase_order_details.amount_to_pay').toUpperCase()}
					</Text>
					<Text style={styles.price}>{`${currencySymbol} 188.58`}</Text>
				</View>
				<View style={styles.orderDetailWrapper}>
					<View style={styles.rowItem}>
						<Text style={styles.orderDetails}>
							{strings('purchase_order_details.order_details').toUpperCase()}
						</Text>
						<Text>
							<Text style={styles.orderRefNoTitle}>{strings('purchase_order_details.order_ref_no')}</Text>
							<Text style={styles.orderRefNo}> 695-1023</Text>
						</Text>
					</View>
					<View style={styles.lineBlue} />
					<View style={styles.rowItem}>
						<Text style={styles.itemText}>{strings('purchase_order_details.amount')}</Text>
						<Text style={styles.itemText}>{`188.58 ${currency.toUpperCase()}`}</Text>
					</View>
					<View style={styles.rowItem}>
						<Text style={styles.itemText}>
							{strings('purchase_order_details.token_fee', { token: Routes.mainNetWork.coin })}
						</Text>
						<Text style={styles.itemText}>{`2.99 ${currency.toUpperCase()}`}</Text>
					</View>
					<View style={styles.lineBlue} />
					<View style={styles.rowItem}>
						<Text style={styles.totalText}>{strings('purchase_order_details.total')}</Text>
						<Text style={styles.totalText}>{`191.57 ${currency.toUpperCase()}`}</Text>
					</View>
					<View style={styles.rowItem}>
						<Text style={styles.itemText}>{strings('purchase_order_details.order_placed_via')}</Text>
						<View style={styles.rightWrapper}>
							<Text style={styles.itemText}>https://clubbingtv.com/store/</Text>
							<Text style={styles.itemText}>{moment().format('MMM DD,YYYY [at] h:mm A')}</Text>
						</View>
					</View>
					<View style={styles.actionsWrapper}>
						<StyledButton
							testID={'purchase-order-detail-pay-now-button'}
							type={'normal'}
							containerStyle={styles.actionButton}
							onPress={onPurchase}
						>
							<Text style={styles.payNow}>{strings('purchase_order_details.pay_now')}</Text>
						</StyledButton>
						<StyledButton
							testID={'purchase-order-detail-cancel-button'}
							type={'warning'}
							containerStyle={styles.actionButton}
							onPress={onCancel}
						>
							<Text style={styles.cancel}>{strings('purchase_order_details.cancel')}</Text>
						</StyledButton>
					</View>
				</View>
			</>
		);
	};

	return (
		<OnboardingScreenWithBg screen="a">
			<ScrollView style={styles.container} contentContainerStyle={styles.scrollViewContainer}>
				{renderOrderDetail()}
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

export default connect(mapStateToProps)(PurchaseOrderDetails);
