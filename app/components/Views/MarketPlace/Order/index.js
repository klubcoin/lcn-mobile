import React, { PureComponent } from "react";
import { FlatList, Image, SafeAreaView, Text, TouchableOpacity, View } from "react-native";
import { makeObservable, observable } from "mobx";
import { inject, observer } from "mobx-react";
import moment from 'moment';
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
import Engine from "../../../../core/Engine";
import Api from "../../../../services/api";
import { sha256 } from "../../../../core/CryptoSignature";
import { ReadFile } from "../../FilesManager/store/FileStore";
import StoreImage from '../components/StoreImage';
import { OrderStatus } from "../StoreOrderDetails";

class PurchasedOrders extends PureComponent {

	orders = [];
	orderStatus = ['pending payment', 'processing', 'shipping', 'completed', 'canceled', 'refunded']
	vendors = [];

	constructor(props) {
		super(props)
		makeObservable(this, {
			orders: observable,
			vendors: observable,
		})
	}

	componentDidMount() {
		this.fetchVendors();
	}

	fetchVendors = () => {
		store.purchasedOrders.sort((a, b) => moment(b.createdAt) - moment(a.createdAt));
		const vendorAddresses = store.purchasedOrders.map(e => e.vendor);
		const addresses = [...new Set(vendorAddresses)];
		Promise.all(addresses.map(addr => this.getWalletInfo(addr)))
			.then(vendors => {
				this.vendors = vendors;
				this.setState({ update: new Date() })
			});
	};

	getWalletInfo = async (address) => {
		return new Promise((resolve, reject) =>
			Api.postRequest(
				routes.walletInfo,
				[address],
				response => {
					if (response.result) {
						resolve({ address, ...response.result });
					} else {
						reject(response);
					}
				},
				error => reject(error)
			));
	};

	onViewDetails = (orderDetails) => {
		const { navigation } = this.props;
		navigation.navigate('OrderDetails', { orderDetails })
	}

	renderItem = ({ index, item }) => {
		const { selectedAddress } = Engine.state.PreferencesController;
		const { items, vendor, createdAt } = item;
		const profile = this.vendors.find(e => vendor.toLowerCase() == e.address.toLowerCase());
		var amount = BigNumber(0);
		var currencyUnit = 'LCN';
		const status = OrderStatus()[item.status || 'processing'];

		return (
			items?.length > 0 &&
			<TouchableOpacity style={styles.itemWrapper} onPress={() => this.onViewDetails({ order: item, vendor: profile, amount: { total: amount, currencyUnit } })}>
				<View style={styles.storeNameContainer}>
					<View style={styles.storeNameAndIcon}>
						<MaterialIcons name={'store'} size={20} />
						<Text style={styles.storeName}>{profile?.name} - <Text style={styles.date}>{moment(createdAt).format('DD/MM/YY')}</Text></Text>
					</View>
					<Text style={styles.orderStatus}>{status}</Text>
				</View>
				{
					items.map(product => {
						const { title, price, currency, images, quantity } = product;
						currencyUnit = currency?.symbol || routes.mainNetWork.ticker;
						amount = amount.plus(BigNumber(price).times(quantity));
						const photo = images[0];
						return (
							<View style={styles.product}>
								<StoreImage style={styles.image} address={vendor} path={photo} />
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
						<Text style={styles.productAmount}>{items?.length} {items?.length == 1 ? 'item' : 'items'}</Text>
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
					data={store.purchasedOrders}
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
					<Text style={styles.titleNavBar}>{strings('market.my_orders')}</Text>
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