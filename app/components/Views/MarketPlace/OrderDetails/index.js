import React, { PureComponent } from "react";
import { FlatList, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { makeObservable, observable } from "mobx";
import { inject, observer } from "mobx-react";
import Icon from "react-native-vector-icons/FontAwesome5";
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from "./styles";
import { strings } from "../../../../../locales/i18n";
import store from "../store";
import colors from "../../../../common/colors";
import routes from "../../../../common/routes";
import StyledButton from "../../../UI/StyledButton";
import { RFValue } from "react-native-responsive-fontsize";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import uuid from 'react-native-uuid';
import CryptoSignature, { sha256 } from '../../../../core/CryptoSignature';
import preferences from '../../../../store/preferences'
import moment from "moment";

class OrderDetails extends PureComponent {

	viewPayment = false;
	shippingInfo = {}
	orderStatus = ['pending payment', 'processing', 'shipping', 'completed', 'canceled', 'refunded']


	constructor(props) {
		super(props)
		makeObservable(this, {
			viewPayment: observable,
			shippingInfo: observable
		})
		this.fetchShippingInfo();
	}

	fetchShippingInfo = async () => {
		const onboardProfile = await preferences.getOnboardProfile();
		this.shippingInfo = onboardProfile?.publicInfo?.shippingAddress || {};
	}

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
		const orderDetails = this.props.navigation.getParam('orderDetails');
		const { vendor } = orderDetails;

		return (
			<View style={styles.section}>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<Text style={styles.titleInfoText}>
						{strings('market.shop_info')}
					</Text>
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
	}

	onViewPayment = () => {
		this.viewPayment = !this.viewPayment;
	}

	renderShippingInfo = () => {
		const orderDetails = this.props.navigation.getParam('orderDetails');
		const { order } = orderDetails;
		const { shipping } = order;
		const { phone, address } = shipping;
		return (
			<View style={styles.section}>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<Text style={styles.titleInfoText}>
						{strings('market.shipping_info')}
					</Text>
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
	}

	renderProducts = () => {
		const orderDetails = this.props.navigation.getParam('orderDetails');
		const { order, amount } = orderDetails;
		const products = order.items;

		return (
			<TouchableWithoutFeedback style={styles.section} onPress={this.onViewPayment}>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<View style={{ flex: 2 }}>
						<Text style={styles.titleInfoText}>
							{strings('market.total_payment')}
						</Text>
					</View>

					<View style={{ flexDirection: 'row', flex: 1 }}>
						<Text style={styles.titleInfoText}>{amount.total.toFixed()} {amount.currencyUnit}</Text>
						<MaterialIcons name={this.viewPayment ? "chevron-up" : "chevron-down"} size={20} />
					</View>
				</View>
				{
					!this.viewPayment ?
						<View style={[styles.infoSection, styles.titleWrapper]}>
							<Text style={styles.infoText}>{products.length} {products.length == 1 ? 'item' : 'items'}</Text>
						</View> : products.map(e => (
							<View style={[styles.infoSection, styles.titleWrapper]}>
								<View style={styles.imageWrapper}>
									<Image style={styles.image} source={{ uri: e.images[0] }} />
									<Text style={styles.infoText} numberOfLines={2}>{e.title}</Text>
								</View>
								<View style={styles.quantityWrapper}>
									<Text style={styles.infoText}>x  <Text style={styles.infoText}>{e.quantity} </Text></Text>
									<Text numberOfLines={2} style={styles.infoText}>
										{e.price} {e.currency}
									</Text>
								</View>
							</View>
						)
						)
				}
			</TouchableWithoutFeedback>
		);
	}

	renderDates = () => {
		const orderDetails = this.props.navigation.getParam('orderDetails');
		const { order } = orderDetails;

		return (
			<View style={styles.section}>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<Text style={styles.titleInfoText}>
						{strings('market.order_code')}
					</Text>
					<Text style={styles.infoText} numberOfLines={1}>{order.orderId || order.id}</Text>
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
	}

	onReturn = () => {
		//TODO: on return and refund func
	}

	onVendorContact = async () => {
		const orderDetails = this.props.navigation.getParam('orderDetails');
		const { order } = orderDetails;
		const products = order.items;
		const { uuid, title, wallet, signature } = products[0]?.product || {};

		const address = await CryptoSignature.recoverMessageSignature(uuid + title + wallet, signature);
		if (address.toLocaleLowerCase() != wallet.toLocaleLowerCase()) {
			showError(strings('market.insecure_vendor'));
		}
		this.props.navigation.navigate('Chat', { selectedContact: { address } });
	};

	renderFooter = () => {
		return (
			<View style={styles.buttonsWrapper}>
				<StyledButton
					type={'blue'}
					containerStyle={styles.actionButton}
					onPress={this.onReturn}
				>
					{strings('market.return_refund')}
				</StyledButton>
				<StyledButton
					type={'normal'}
					onPress={this.onVendorContact}
					containerStyle={styles.actionButton}
				>
					{strings('market.contact_vendor')}
				</StyledButton>
			</View>
		);
	}

	render() {
		return (
			<View style={styles.root}>
				{this.renderNavBar()}
				<View style={styles.body}>
					<View style={styles.statusWrapper}>
						<MaterialIcons name="check-circle-outline" size={20} color="green" style={styles.icon} />
						<Text style={styles.statusText}>Completed</Text>
					</View>
					<ScrollView>
						<View style={styles.sectionsWrapper}>
							{this.renderShopInfo()}
							{this.renderShippingInfo()}
							{this.renderProducts()}
							{this.renderDates()}
						</View>
					</ScrollView>
				</View>
				{this.renderFooter()}
			</View>
		)
	}
}

export default inject('store')(observer(OrderDetails))