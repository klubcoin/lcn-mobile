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
import ScrollableTabView from "react-native-scrollable-tab-view";
import ScrollableTabBar from "react-native-scrollable-tab-view/ScrollableTabBar";
import APIService from "../../../../services/APIService";

class VendorOrders extends PureComponent {

	productGroups = {};
	categories = []

	orderStatus = ['pending payment', 'processing', 'shipping', 'completed', 'canceled', 'refunded']


	constructor(props) {
		super(props)
		makeObservable(this, {
			productGroups: observable,
			categories: observable,
		})
	}

	componentDidMount() {
		this.groupProducts();
		this.fetchCategories();
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

	async fetchCategories() {
		const categories = store.marketCategories;
		const rootTab = { id: 'root', name: 'All' };
		this.categories = [rootTab, ...categories];

		APIService.getMarketCategories((success, json) => {
			if (success && json) {
				store.saveProductCategories(json);
				this.categories = [rootTab, ...json];
			}
		});
	}

	onViewDetails = (orderDetails) => {
		const { navigation } = this.props;
		navigation.navigate('OrderDetails', { orderDetails })
	}

	toggleItem = (product) => {
		console.log('product', product);
	}

	renderItem = ({ index, item }) => {
		const { products, profile } = this.productGroups[item];
		var amount = BigNumber(0);
		var currencyUnit = 'LCN';

		return (
			products.length > 0 && <TouchableOpacity style={styles.itemWrapper} onPress={() => this.onViewDetails({ info: this.productGroups[item], amount: { total: amount, currencyUnit } })}>
				<View style={styles.storeNameContainer}>
					<View style={styles.storeNameAndIcon}>
						<Text style={styles.storeName}>#ORDER21112</Text>
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
								<TouchableOpacity
									style={styles.tickIcon}
									activeOpacity={0.6}
									onPress={() => this.toggleItem(product)}
								>
									<MaterialIcons name={false ? 'checkbox-blank-outline' : 'check-box-outline'} size={22} />
								</TouchableOpacity>
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
					<View style={{ flex: 5 }}>
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

	renderOrderItems = (tabLabel) => {
		return (
			<View style={styles.body} tabLabel={tabLabel}>
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
					<TouchableOpacity onPress={this.toggleDrawer.bind(this)} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'filter'} size={RFValue(15)} />
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	renderFooter = () => {
		return (
			<View style={styles.footer}>
				<TouchableOpacity style={styles.selectAll} activeOpacity={0.6} onPress={this.selectAll}>
					<MaterialIcons name={'check-box-outline'} size={22} />
					<Text style={styles.textAll}>{strings('market.select_all')}</Text>
				</TouchableOpacity>
				<View style={{ flexDirection: 'row', height: '100%' }}>
					<TouchableOpacity style={[styles.actionBtn, styles.refundBtn]} activeOpacity={0.6} onPress={this.gotoCheckout}>
						<Text style={styles.textActionBtn}>Refund</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.actionBtn} activeOpacity={0.6} onPress={this.gotoCheckout}>
						<Text style={styles.textActionBtn}>Change status</Text>
					</TouchableOpacity>
				</View>

			</View>
		);
	};

	onChangeTab = (obj) => {
		console.log('obj', obj);
	}

	renderTabBar = () => {
		return (
			<ScrollableTabBar
				underlineStyle={styles.tabUnderlineStyle}
				activeTextColor={colors.blue}
				inactiveTextColor={colors.fontTertiary}
				backgroundColor={colors.white}
				tabStyle={styles.tabStyle}
				textStyle={styles.textStyle}
			/>
		);
	}

	render() {
		return (
			<View style={styles.root}>
				{this.renderNavBar()}
				<ScrollableTabView
					renderTabBar={this.renderTabBar}
					onChangeTab={obj => this.onChangeTab(obj)}
				>
					{
						this.categories.length > 0 ? this.categories.map(e => this.renderOrderItems(e.name)) : <View style={styles.body} />
					}
				</ScrollableTabView>
				{this.renderFooter()}
			</View>
		)
	}
}

export default inject('store')(observer(VendorOrders))