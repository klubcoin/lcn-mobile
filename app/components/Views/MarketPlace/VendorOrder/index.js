import React, { PureComponent } from "react";
import { FlatList, Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { autorun, makeObservable, observable } from "mobx";
import { inject, observer } from "mobx-react";
import { Observer } from "mobx-react-lite";
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
import RBSheet from "react-native-raw-bottom-sheet";
import Device from "../../../../util/Device";
import CheckBox from "@react-native-community/checkbox";

class VendorOrders extends PureComponent {
	orderStatuses = [
		{
			"label": "Pending payment",
			"value": false
		},
		{
			"label": "Processing",
			"value": false
		},
		{
			"label": "Shipping",
			"value": false
		},
		{
			"label": "Completed",
			"value": false
		},
		{
			"label": "Canceled",
			"value": false
		},
		{
			"label": "Refunded",
			"value": false
		},
		{
			"label": "On hold",
			"value": false
		}
	]
	sortOptions = [
		{
			"label": "Alphabetical",
			"icon": "sort-alphabetical-ascending",
			"isSelected": true
		},
		{
			"label": "Date",
			"icon": "calendar-month",
			"isSelected": false

		},
		{
			"label": "Total amount",
			"icon": "currency-usd",
			"isSelected": false
		}
	]

	productGroups = {};
	categories = [];
	selectedOrders = [];
	currentTabIndex = 0;

	constructor(props) {
		super(props)
		makeObservable(this, {
			productGroups: observable,
			categories: observable,
			selectedOrders: observable,
			currentTabIndex: observable,
			orderStatuses: observable,
			sortOptions: observable
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
		const rootTab = { name: 'All', uuid: 'root_tab' };
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
		if (this.selectedOrders.includes(product.uuid)) {
			this.selectedOrders = this.selectedOrders.filter(e => e !== product.uuid)
		}
		else this.selectedOrders.push(product.uuid);
		this.setState({ update: new Date() })
	}

	renderItem = ({ item }) => {
		const { products, profile } = this.productGroups[item];
		const { currentTabIndex, categories } = this;

		var amount = BigNumber(0);
		var currencyUnit = 'LCN';
		return (
			products.length > 0 && (currentTabIndex === 0 || products[0].product.category.uuid === categories[currentTabIndex].uuid) &&
			<TouchableOpacity style={styles.itemWrapper} onPress={() => this.onViewDetails({ info: this.productGroups[item], amount: { total: amount, currencyUnit } })}>
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
									<MaterialIcons name={this.selectedOrders.includes(product.uuid) ? 'check-box-outline' : 'checkbox-blank-outline'} size={22} />
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
					<TouchableOpacity onPress={()=> this.filterRef.open()} style={styles.navButton}>
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
						<Text style={styles.textActionBtn}>{strings('market.refund')}</Text>
					</TouchableOpacity>
					<TouchableOpacity style={styles.actionBtn} activeOpacity={0.6} onPress={this.gotoCheckout}>
						<Text style={styles.textActionBtn}>{strings('market.change_status')}</Text>
					</TouchableOpacity>
				</View>

			</View>
		);
	};

	onChangeTab = (obj) => {
		this.currentTabIndex = obj.i;
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

	onResetFilter = () => {
		this.orderStatuses.forEach(e => e.value = false);
		this.sortOptions.forEach((e, index) => index == 0 ? e.isSelected = true : e.isSelected = false)
	}

	onSelectStatus = (label, value) => {
		this.orderStatuses.forEach(e => e.label == label ? e.value = value : null);
 	}

	onSelectSortOption = (label) => {
		this.sortOptions.forEach(e => e.label == label ? e.isSelected = true : e.isSelected = false)
	}

	renderFilter = () => {
		return (
			<RBSheet
				ref={ref => this.filterRef = ref}
				closeOnDragDown={true}
				height={Device.getDeviceHeight() / 2}
				customStyles={{
					wrapper: {
						backgroundColor: colors.greytransparent100
					}
				}}
			>
				<View style={styles.filterHeaderWrapper}>
					<TouchableOpacity onPress={this.onResetFilter}>
						<Text style={styles.resetBtnText}>{strings('payment_request.reset')}</Text>
					</TouchableOpacity>
					<Text style={styles.title}>{strings('market.filter')}</Text>
					<TouchableOpacity onPress={() => this.filterRef.close()}>
						<Text>{strings('navigation.close')}</Text>
					</TouchableOpacity>

				</View>
				<ScrollView style={{ flex: 1, marginBottom: 20 }}>
					<TouchableOpacity activeOpacity={1}>
						<View style={styles.filterBodyWrapper}>
							<View style={{ marginTop: 5, marginBottom: 15 }}>
								<Text style={styles.sectionHeader}>{strings('market.order_statuses')}</Text>
								{
									this.orderStatuses.map(e => (
										<View style={styles.statusItem}>
											<Text>{e.label}</Text>
											<CheckBox
												disabled={false}
												value={e.value}
												onValueChange={(value) => this.onSelectStatus(e.label, value)}
												boxType={'square'}
												style={{ width: 15, height: 15 }}
												onTintColor={colors.primary}
												onCheckColor={colors.primary}
											/>
										</View>
									))
								}
							</View>

							<Text style={styles.sectionHeader}>{strings('market.sort_by')}</Text>
							<View>
								<View style={styles.sortOptionsWrapper}>
									{
										this.sortOptions.map((e, index) => (
											<TouchableOpacity style={[styles.sortOption, index == 1 && styles.middleOption, e.isSelected && styles.selectedOption]} onPress={()=>this.onSelectSortOption((e.label))}>
												<MaterialIcons name={e.icon} size={20} />
												<Text>{e.label}</Text>
											</TouchableOpacity>
										))
									}
								</View>
							</View>
						</View>
					</TouchableOpacity>
				</ScrollView>

			</RBSheet>
		);
	}

	render() {
		return (
			<View style={styles.root}>
				{this.renderNavBar()}

				<ScrollableTabView
					renderTabBar={this.renderTabBar}
					initialPage={this.currentTabIndex}
					onChangeTab={obj => this.onChangeTab(obj)}
				>
					{
						this.categories.length > 0 ? this.categories.map(e => this.renderOrderItems(e.name)) : <View style={styles.body} />
					}
				</ScrollableTabView>
				{this.renderFilter()}
				{this.renderFooter()}
			</View>
		)
	}
}

export default inject('store')(observer(VendorOrders))