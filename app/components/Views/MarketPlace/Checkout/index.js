import React, { PureComponent } from "react";
import { FlatList, Image, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
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

class MarketCheckout extends PureComponent {

	totalAmount = 0;
	totalQuantity = 0;
	productGroups = {};


	constructor(props) {
		super(props)
		makeObservable(this, {
			totalAmount: observable,
			totalQuantity: observable,
			productGroups: observable,
		})
	}

	componentDidMount() {
		this.calculateTotal();
		this.groupProducts();
	}

	groupProducts = () => {
		store.marketCart.forEach(e => {
			var address = e.product?.wallet?.toLowerCase();
			this.productGroups[address] = Object.assign(this.productGroups[address] || {}, { profile: store.storeVendors[address]?.profile });

			if (this.productGroups[address].products) {
				this.productGroups[address].products?.unshift(e);
			} else {
				this.productGroups[address].products = [e];
			}
		})
	};

	onBack = () => {
		this.props.navigation.goBack();
	};

	calculateTotal = () => {
		let totalQuantity = 0;
		let total = 0;
		store.marketCart.map(({ product, quantity }) => {
			if (product.excluded) return;
			totalQuantity += quantity;
			total += quantity * product.price;
		})
		this.totalAmount = total;
		this.totalQuantity = totalQuantity;
	}

	onPurchase = () => {
		
	}

	renderItem = ({ index, item }) => {
		const { products, profile } = this.productGroups[item];
		var amount = 0;
		var currencyUnit = 'LCN';

		return (
			products.length > 0 && <View style={styles.itemWrapper}>
				<View style={styles.storeNameContainer}>
					<MaterialIcons name={'store'} size={20} />
					<Text style={styles.storeName}>{profile?.storeName}</Text>
				</View>
				{
					products.map(e => {
						const { product, quantity } = e;
						const { title, price, currency, images } = product;
						currencyUnit = currency?.symbol || routes.mainNetWork.ticker;
						amount += quantity * price;

						return (
							<View style={styles.product}>
								<Image style={styles.image} source={{ uri: images[0] }} />
								<View style={styles.productInfo}>
									<Text numberOfLines={1} style={styles.title}>
										{title}
									</Text>

								</View>
								<View style={styles.quantityWrapper}>
									<Text>x  <Text style={styles.quantity}>{quantity} </Text></Text>
									<Text numberOfLines={2} style={styles.quantity}>
										{price} {currencyUnit}
									</Text>
								</View>
							</View>
						);
					})
				}
				<View style={styles.storeTotalAmount}>
					<Text style={styles.summaryTitle}>{strings('market.total')}: </Text>
					<Text style={styles.price}>{amount} {currencyUnit}</Text>
				</View>
				<StyledButton
					type={'confirm'}
					onPress={this.onPurchase}
					containerStyle={styles.confirmBtn}
					testID={'connect-cancel-button'}
				>
					{strings('market.purchase')}
				</StyledButton>
			</View>

		)
	}

	renderOrderItems = () => {
		return (
			<View style={styles.body}>
				<FlatList
					data={Object.keys(this.productGroups)}
					keyExtractor={(item) => item.uuid}
					renderItem={this.renderItem.bind(this)}
				/>
			</View>
		)
	}

	gotoCheckout = () => {
		this.props.navigation.navigate('MarketCheckout');
	}

	renderFooter = () => {
		const currency = routes.mainNetWork.ticker;
		return (
			<View style={styles.footer}>
				<Text style={styles.summary}>
					<Text style={styles.summaryTitle}>{strings('market.total')}:</Text>
					<Text style={styles.totalAmount}> {this.totalAmount} {currency}</Text>
				</Text>
				<View style={styles.summary} />
				<TouchableOpacity style={styles.checkout}
					activeOpacity={0.6}
					onPress={this.gotoCheckout}
				>
					<Text style={styles.textCheckout}>{strings('market.place_order')}</Text>
				</TouchableOpacity>
			</View>
		)
	}

	editShipping = () => {
		this.props.navigation.navigate('ShippingInfo');
	}

	renderShippingInfo = () => {
		const { name, phone, address } = store.shippingInfo || {};
		return (
			<View style={styles.shippingInfo}>
				<Text style={styles.shippingTitle}>{strings('market.shipping_info')}</Text>
				<View style={styles.shipping}>
					<Text style={styles.name}>{name || strings('market.please_provide_contact_information')}</Text>
					<Text style={styles.phone}>{phone ? `${strings('market.contact_phone')}: ${phone}` : ''}</Text>
					<Text style={styles.address}>{address ? `${strings('market.address')}: ${address}` : ''}</Text>
					<TouchableOpacity style={styles.editShipping}
						activeOpacity={0.6}
						onPress={() => this.editShipping()}
					>
						<Icon name={'edit'} size={22} color={colors.gray} />
					</TouchableOpacity>
				</View>
			</View>
		)
	}

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack.bind(this)} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'arrow-left'} size={16} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{strings('market.checkout')}</Text>
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	render() {
		return (
			<View style={styles.root}>
				{this.renderNavBar()}
				{this.renderShippingInfo()}
				{this.renderOrderItems()}
				{/* {this.renderFooter()} */}
			</View>
		)
	}
}

export default inject('store')(observer(MarketCheckout))