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
import { RFValue } from "react-native-responsive-fontsize";
import BigNumber from "bignumber.js";

class PurchasedOrders extends PureComponent {

	productGroups = {};

	orderStatus = ['pending payment', 'processing', 'shipping', 'completed', 'canceled', 'refunded']


	constructor(props) {
		super(props)
		makeObservable(this, {
			productGroups: observable
		})
	}

	componentDidMount() {
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

	onViewDetails = (orderDetails) => {
		const { navigation } = this.props;
		navigation.navigate('OrderDetails', { orderDetails })
	}

	renderItem = ({ index, item }) => {
		const { products, profile } = this.productGroups[item];
		var amount = BigNumber(0);
		var currencyUnit = 'LCN';

		return (
			products.length > 0 && <TouchableOpacity style={styles.itemWrapper} onPress={() => this.onViewDetails({ info: this.productGroups[item], amount: {total: amount, currencyUnit} })}>
				<View style={styles.storeNameContainer}>
					<View style={styles.storeNameAndIcon}>
						<MaterialIcons name={'store'} size={20} />
						<Text style={styles.storeName}>{profile?.storeName}</Text>
					</View>
					<Text style={styles.orderStatus}>Processing</Text>
				</View>
				{
					products.map(e => {
						const { product, quantity } = e;
						const { title, price, currency, images } = product;
						currencyUnit = currency?.symbol || routes.mainNetWork.ticker;
						amount = amount.plus(BigNumber(price).times(quantity));

						if (products.indexOf(e) !== 0) return;

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
					<View style={{flex: 5}}>
						<Text style={styles.productAmount}>{products.length} {products.length == 1 ? 'item' : 'items'}</Text>
					</View>
					<View style={styles.amount}>
						<Text style={styles.summaryTitle}>{strings('market.total')}: </Text>
						<Text style={styles.price}>{amount.toFixed()} {currencyUnit}</Text>
					</View>
				</View>

			</TouchableOpacity>

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

	toggleDrawer = () => {
		this.props.navigation.toggleDrawer();
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.toggleDrawer.bind(this)} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'bars'} size={RFValue(15)} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{strings('market.orders')}</Text>
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	render() {
		return (
			<View style={styles.root}>
				{this.renderNavBar()}
				{this.renderOrderItems()}
			</View>
		)
	}
}

export default inject('store')(observer(PurchasedOrders))