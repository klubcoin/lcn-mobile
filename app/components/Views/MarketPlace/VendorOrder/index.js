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
import { RFValue } from "react-native-responsive-fontsize";
import BigNumber from "bignumber.js";
import RBSheet from "react-native-raw-bottom-sheet";
import Device from "../../../../util/Device";
import CheckBox from "@react-native-community/checkbox";
import { OrderStatus } from "../StoreOrderDetails";

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

	orders = [];
	categories = [];
	selectedOrders = [];
	currentTabIndex = 0;
	viewStatuesModal = false;

	constructor(props) {
		super(props)
		makeObservable(this, {
			orders: observable,
			categories: observable,
			selectedOrders: observable,
			currentTabIndex: observable,
			orderStatuses: observable,
			sortOptions: observable,
			viewStatuesModal: observable
		})
	}

	componentDidMount() {
		this.fetchOrders();
	}

	fetchOrders = () => {
		this.orders = store.vendorOrders;
	};

	onViewDetails = (orderDetails) => {
		const { navigation } = this.props;
		navigation.navigate('StoreOrderDetails', { orderDetails })
	}

	renderItem = ({ item }) => {
		const { orderId, items, shipping } = item;
		const status = OrderStatus()[item.status || 'processing'];

		var amount = 0;
		var currencyUnit = 'LCN';
		items.map(({ quantity, price }) => {
			amount += quantity * BigNumber(price);
		});

		return (
			<TouchableOpacity style={styles.itemWrapper} onPress={() => this.onViewDetails({ order: item, amount: { total: amount, currencyUnit } })}>
				<View style={styles.storeNameContainer}>
					<View style={styles.storeNameAndIcon}>
						<Text style={styles.orderId}>#{orderId}</Text>
					</View>
					<Text style={styles.orderStatus}>{status}</Text>
				</View>
				<View style={styles.customer}>
					<Text style={styles.name}>{shipping.name}</Text>
					<Text style={styles.phone}>{strings('market.phone')}: {shipping.phone}</Text>
					<Text style={styles.address}>{strings('market.address')}: {shipping.address}</Text>
				</View>
				<View style={styles.images}>
					{
						items.map(e => (
							<Image style={styles.image} source={{ uri: e.images[0] }} />
						))
					}
				</View>
				<View style={styles.storeTotalAmount}>
					<Text style={styles.productAmount}>{items.length} {items.length == 1 ? 'item' : 'items'}</Text>
					<View style={styles.amount}>
						<Text style={styles.summaryTitle}>{strings('market.total')}: </Text>
						<Text style={styles.price}>{amount} {currencyUnit}</Text>
					</View>
				</View>

			</TouchableOpacity>
		)
	}

	renderOrderItems = () => {
		return (
			<View style={styles.body}>
				<FlatList
					data={this.orders}
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
					<TouchableOpacity onPress={() => this.filterRef.open()} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'filter'} size={RFValue(15)} />
					</TouchableOpacity>
				</View>
			</SafeAreaView>
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
											<TouchableOpacity style={[styles.sortOption, index == 1 && styles.middleOption, e.isSelected && styles.selectedOption]} onPress={() => this.onSelectSortOption((e.label))}>
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
				{this.renderOrderItems()}
				{this.renderFilter()}
			</View>
		)
	}
}

export default inject('store')(observer(VendorOrders))