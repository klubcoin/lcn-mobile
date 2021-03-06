import React, { PureComponent } from 'react';
import { SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from './styles';
import { strings } from '../../../../../locales/i18n';
import colors from '../../../../common/colors';
import StyledButton from '../../../UI/StyledButton';
import { FlatList, TouchableWithoutFeedback } from 'react-native-gesture-handler';
import CryptoSignature from '../../../../core/CryptoSignature';
import preferences from '../../../../store/preferences';
import moment from 'moment';
import StoreImage from '../../MarketPlace/components/StoreImage';
import { OrderStatus } from '../../MarketPlace/StoreOrderDetails';
import { refStoreService } from '../../MarketPlace/store/StoreService';
import Modal from 'react-native-modal';
import TransactionController from '@metamask/controllers/dist/transaction/TransactionController';
import Engine from '../../../../core/Engine';
import { stripHexPrefix } from 'ethereumjs-util';
import { fromWei, toWei } from '../../../../util/number';
import { hexToBN } from '@metamask/controllers/dist/util';
import BigNumber from 'bignumber.js';
import TrackingScrollView from '../../../UI/TrackingScrollView';

class OrderDetails extends PureComponent {
	status = OrderStatus().processing;
	viewPayment = false;
	shippingInfo = {};
	viewProductModal = false;
	transactionData = [];
	orderTransaction = {};

	constructor(props) {
		super(props);
		makeObservable(this, {
			status: observable,
			viewPayment: observable,
			shippingInfo: observable,
			transactionData: observable,
			viewProductModal: observable,
			orderTransaction: observable
		});

		this.orderDetails = this.props.navigation.getParam('orderDetails');
		const { order } = this.orderDetails || {};
		this.status = OrderStatus()[order.status || 'processing'];

		this.fetchShippingInfo();
	}

	componentDidMount() {
		this.syncProduct();
		this.getTransactionsHistory();
	}

	async syncProduct() {
		const { order, vendor } = this.orderDetails;
		const products = order.items || [];

		const storeService = refStoreService();
		storeService.addListener(message => {
			if (message && message.uuid && message.data != 1) {
				const { uuid, data } = message;
				const product = products.find(e => e.uuid == uuid);
				if (product) {
					product.images = [...data.images];
					this.setState({ update: new Date() });
				}
			}
		});

		for (let k in products) {
			const product = products[k];
			await storeService.fetchProduct(product.uuid, vendor.address);
		}
	}

	IsJsonString = str => {
		try {
			JSON.parse(stripHexPrefix(str));
		} catch (e) {
			return false;
		}
		return true;
	};

	parseTransaction = transaction => {
		const cloneObject = { ...transaction };
		if (!this.IsJsonString(cloneObject.data)) return;

		cloneObject.data = JSON.parse(stripHexPrefix(cloneObject.data));
		return cloneObject;
	};

	getTransactionsHistory = () => {
		const { transactions } = Engine.state.TransactionController;
		const { order } = this.orderDetails;

		this.transactionData = [...transactions.map(e => this.parseTransaction(e.transaction))];
		this.transactionData = this.transactionData.filter(e => e);
		this.orderTransaction.transactions = this.transactionData.filter(e => e.data.id == order.id) || [];

		this.calOrderValue();
	};

	calOrderValue = () => {
		try {
			const { amount } = this.orderDetails;
			var { transactions } = this.orderTransaction;
			if (transactions.length > 0) {
				transactions = transactions.map(e => Object.assign(e, { value: fromWei(hexToBN(e.value)) }));
				this.orderTransaction.value = transactions
					.reduce((sum, current) => sum.plus(BigNumber(current.value)), BigNumber(0))
					.toNumber();
			}
			this.orderTransaction.remain = BigNumber(amount.total)
				.minus(BigNumber(this.orderTransaction.value || 0))
				.toNumber();
		} catch (error) {
			console.warn(error);
		}
	};

	fetchShippingInfo = async () => {
		const onboardProfile = await preferences.getOnboardProfile();
		this.shippingInfo = onboardProfile?.publicInfo?.shippingAddress || {};
	};

	onBack = () => {
		this.props.navigation.goBack();
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack.bind(this)} style={styles.navButton}>
						<Icon name={'arrow-left'} size={16} style={styles.backIcon} color={colors.white} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{strings('market.order_details')}</Text>
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	renderShopInfo = () => {
		const { vendor } = this.orderDetails;

		return (
			<View style={styles.section}>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<Text style={styles.titleInfoText}>{strings('market.shop_info')}</Text>
				</View>
				<View style={styles.infoSection}>
					<MaterialIcons name="store" size={18} color={colors.storeBg} style={styles.icon} />
					<Text style={styles.infoText}>{vendor?.name}</Text>
				</View>
				<View style={styles.infoSection}>
					<MaterialIcons name="phone" size={18} color={colors.storeBg} style={styles.icon} />
					<Text style={styles.infoText}>{vendor?.publicInfo?.shippingAddress?.phone}</Text>
				</View>
				<View style={styles.infoSection}>
					<MaterialIcons name="email" size={18} color={colors.storeBg} style={styles.icon} />
					<Text style={styles.infoText}>{vendor?.publicInfo?.shippingAddress?.email}</Text>
				</View>
			</View>
		);
	};

	onViewPayment = () => {
		this.viewPayment = !this.viewPayment;
	};

	renderShippingInfo = () => {
		const { order } = this.orderDetails;
		const { shipping } = order;
		const { phone, address } = shipping;
		return (
			<View style={styles.section}>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<Text style={styles.titleInfoText}>{strings('market.shipping_info')}</Text>
				</View>
				<View style={styles.infoSection}>
					<MaterialIcons name="phone" size={18} color={colors.storeBg} style={styles.icon} />
					<Text style={styles.infoText}>{phone}</Text>
				</View>
				<View style={styles.infoSection}>
					<MaterialIcons name="map" size={18} color={colors.storeBg} style={styles.icon} />
					<Text style={styles.infoText}>{address}</Text>
				</View>
				<View style={styles.infoSection}>
					<MaterialIcons name="truck-delivery-outline" size={18} color={colors.storeBg} style={styles.icon} />
					<Text style={styles.infoText}>Standard delivery</Text>
				</View>
			</View>
		);
	};

	renderProducts = () => {
		const { order, amount } = this.orderDetails;
		const products = order.items;

		return (
			<TouchableWithoutFeedback style={styles.section} onPress={this.onViewPayment}>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<Text style={styles.titleInfoText}>{strings('market.total_payment')}</Text>
					<View style={styles.subPaymentSection}>
						<Text style={styles.titleInfoText}>
							{amount.total.toFixed()} {amount.currencyUnit}
						</Text>
						<MaterialIcons name={this.viewPayment ? 'chevron-up' : 'chevron-down'} size={20} />
					</View>
				</View>
				{!this.viewPayment ? (
					<View style={[styles.infoSection, styles.titleWrapper]}>
						<Text style={styles.infoText}>
							{products.length} {products.length == 1 ? 'item' : 'items'}
						</Text>
					</View>
				) : (
					<View>
						<View style={[styles.infoSection, styles.titleWrapper]}>
							<Text style={styles.infoText}>{strings('market.paid')}</Text>
							<View style={styles.subPaymentSection}>
								<Text style={styles.infoText}>
									{this.orderTransaction.value} {amount.currencyUnit}
								</Text>
							</View>
						</View>
						<View style={[styles.infoSection, styles.titleWrapper]}>
							<Text style={[styles.infoText, styles.remain]}>{strings('market.remain')}</Text>
							<View style={styles.subPaymentSection}>
								<Text style={[styles.infoText, this.orderTransaction?.remain > 0 && styles.remain]}>
									{this.orderTransaction?.remain} {amount.currencyUnit}
								</Text>
							</View>
						</View>
						{products.map(e => (
							<View style={[styles.infoSection, styles.titleWrapper]}>
								<View style={styles.imageWrapper}>
									<StoreImage style={styles.image} address={order.vendor} path={e.images[0]} />
									<Text style={styles.infoText} numberOfLines={2}>
										{e.title}
									</Text>
								</View>
								<View style={styles.quantityWrapper}>
									<Text style={styles.infoText}>
										x <Text style={styles.infoText}>{e.quantity} </Text>
									</Text>
									<Text numberOfLines={2} style={styles.infoText}>
										{e.price} {e.currency}
									</Text>
								</View>
							</View>
						))}
					</View>
				)}
			</TouchableWithoutFeedback>
		);
	};

	renderDates = () => {
		const { order } = this.orderDetails;

		return (
			<View style={styles.section}>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<Text style={styles.titleInfoText}>{strings('market.order_code')}</Text>
					<Text style={styles.infoText} numberOfLines={1}>
						{order.orderId || order.id}
					</Text>
				</View>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<Text style={styles.infoText}>{strings('market.order_time')}</Text>
					<Text style={styles.infoText}>{moment(order.createdAt).format('MMM DD, YYYY')}</Text>
				</View>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<Text style={styles.infoText}>{strings('market.payment_time')}</Text>
					<Text style={styles.infoText}>{moment(order.createdAt).format('MMM DD, YYYY')}</Text>
				</View>
			</View>
		);
	};

	openProductsModal = () => {
		this.viewProductModal = true;
	};

	closeProductsModal = () => {
		this.viewProductModal = false;
	};

	renderReviewButton = () => {
		return (
			<StyledButton
				type={'confirm'}
				disabled={false}
				containerStyle={styles.buttonNext}
				onPress={this.openProductsModal}
			>
				{strings('market.review')}
			</StyledButton>
		);
	};

	onPressActionBtn = () => {
		if (this.canPayRest()) {
			this.payRest();
		}
	};

	payRest = () => {
		const { remain } = this.orderTransaction;
		const { data } = this.orderTransaction.transactions[0];
		if (!data) return;
		if (this.status == OrderStatus()['shipping'] && remain > 0)
			this.props.navigation.navigate('MarketPurchase', { order: data, isDeliveryPayment: true });
	};

	onVendorContact = async () => {
		const { vendor } = this.orderDetails;
		const address = vendor.address.toLocaleLowerCase();
		this.props.navigation.navigate('Chat', { selectedContact: { address } });
	};

	addReview = product => {
		const { vendor } = this.orderDetails;

		product.vendor = vendor;
		this.closeProductsModal();
		this.props.navigation.navigate('MarketAddEditReview', { product: product });
	};

	renderModalItem = ({ item }) => {
		const { order } = this.orderDetails;

		return (
			<TouchableOpacity style={styles.modalItem} activeOpacity={0.55} onPress={() => this.addReview(item)}>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<View style={styles.imageWrapper}>
						<StoreImage style={styles.image} address={order.vendor} path={item.images[0]} />
						<Text style={styles.infoText} numberOfLines={2}>
							{item.title}
						</Text>
					</View>
					<View style={styles.quantityWrapper}>
						<Text style={styles.infoText}>
							x <Text style={styles.infoText}>{item.quantity} </Text>
						</Text>
						<Text numberOfLines={2} style={styles.infoText}>
							{item.price} {item.currency}
						</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	canPayRest = () => {
		const { remain } = this.orderTransaction;
		return this.status == OrderStatus()['shipping'] && remain > 0;
	};

	renderProductModal = () => {
		const { order, amount } = this.orderDetails;
		const products = order.items;

		return (
			<Modal
				isVisible={this.viewProductModal}
				animationIn="slideInUp"
				animationOut="slideOutDown"
				style={styles.bottomModal}
				backdropOpacity={0.5}
				animationInTiming={300}
				animationOutTiming={300}
				onBackButtonPress={this.closeProductsModal}
				onBackdropPress={this.closeProductsModal}
			>
				<View style={styles.modalWrapper}>
					<Text style={[styles.titleInfoText, { flex: 0 }]}>{strings('market.products')}</Text>
					<FlatList
						data={products}
						keyExtractor={item => item.uuid}
						renderItem={this.renderModalItem}
						style={{ flex: 1 }}
					/>
				</View>
			</Modal>
		);
	};

	renderActionMessage = () => {
		const { remain } = this.orderTransaction;

		if (this.canPayRest()) return strings('market.pay_rest');
		return strings('market.return_refund');
	};

	renderFooter = () => {
		return (
			<View style={styles.buttonsWrapper}>
				<StyledButton type={'blue'} containerStyle={styles.actionButton} onPress={this.onPressActionBtn}>
					{this.renderActionMessage()}
				</StyledButton>
				<StyledButton type={'normal'} onPress={this.onVendorContact} containerStyle={styles.actionButton}>
					{strings('market.contact_vendor')}
				</StyledButton>
			</View>
		);
	};

	render() {
		return (
			<View style={styles.root}>
				{this.renderNavBar()}
				<View style={styles.body}>
					<View style={styles.statusWrapper}>
						<MaterialIcons name="check-circle-outline" size={20} color="green" style={styles.icon} />
						<Text style={styles.statusText}>{this.status}</Text>
					</View>
					<TrackingScrollView>
						<View style={styles.sectionsWrapper}>
							{this.renderShopInfo()}
							{this.renderShippingInfo()}
							{this.renderProducts()}
							{this.renderDates()}
							{this.status == OrderStatus()['completed'] && this.renderReviewButton()}
						</View>
					</TrackingScrollView>
				</View>
				{this.renderProductModal()}
				{this.renderFooter()}
			</View>
		);
	}
}

export default inject('store')(observer(OrderDetails));
