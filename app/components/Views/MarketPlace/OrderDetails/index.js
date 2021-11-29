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

class OrderDetails extends PureComponent {

	viewPayment = false;
	orderStatus = ['pending payment', 'processing', 'shipping', 'completed', 'canceled', 'refunded']


	constructor(props) {
		super(props)
		makeObservable(this, {
			viewPayment: observable
		})
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
		const { name, phone, address } = store.shippingInfo || {};
		const orderDetails = this.props.navigation.getParam('orderDetails');
		const { profile } = orderDetails.info;

		return (
			<View style={styles.section}>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<Text style={styles.titleInfoText}>
						{strings('market.shop_info')}
					</Text>
				</View>
				<View style={styles.infoSection}>
					<MaterialIcons name="store" size={18} color={colors.storeBg} />
					<Text style={styles.infoText}>{profile.storeName}</Text>
				</View>
				<View style={styles.infoSection}>
					<MaterialIcons name="phone" size={18} color={colors.storeBg} />
					<Text style={styles.infoText}>{profile.phone}</Text>
				</View>
				<View style={styles.infoSection}>
					<MaterialIcons name="email" size={18} color={colors.storeBg} />
					<Text style={styles.infoText}>{profile.email}</Text>
				</View>
			</View>
		);
	}

	onViewPayment = () => {
		this.viewPayment = !this.viewPayment;
	}

	renderShippingInfo = () => {
		const { name, phone, address } = store.shippingInfo || {};

		return (
			<View style={styles.section}>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<Text style={styles.titleInfoText}>
						{strings('market.shipping_info')}
					</Text>
				</View>
				<View style={styles.infoSection}>
					<MaterialIcons name="phone" size={18} color={colors.storeBg} />
					<Text style={styles.infoText}>{phone}</Text>
				</View>
				<View style={styles.infoSection}>
					<MaterialIcons name="map" size={18} color={colors.storeBg} />
					<Text style={styles.infoText}>{address}</Text>
				</View>
				<View style={styles.infoSection}>
					<MaterialIcons name="truck-delivery-outline" size={18} color={colors.storeBg} />
					<Text style={styles.infoText}>Standard delivery</Text>
				</View>
			</View>
		);
	}

	renderProducts = () => {
		const orderDetails = this.props.navigation.getParam('orderDetails');
		const { info, amount } = orderDetails;
		const { products, profile } = info;

		return (
			<TouchableWithoutFeedback style={styles.section} onPress={this.onViewPayment}>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<Text style={styles.titleInfoText}>
						{strings('market.total_payment')}
					</Text>
					<View style={{ flexDirection: 'row' }}>
						<Text style={styles.titleInfoText}>{amount.total} {amount.currencyUnit}</Text>
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
									<Image style={styles.image} source={{ uri: e.product.images[0] }} />
								<Text style={styles.infoText} numberOfLines={2}>{e.product.title}</Text>
								</View>
								<View style={styles.quantityWrapper}>
									<Text style={styles.infoText}>x  <Text style={styles.infoText}>{e.quantity} </Text></Text>
									<Text numberOfLines={2} style={styles.infoText}>
										{e.product.price} {amount.currencyUnit}
									</Text>
								</View>
							</View>
						)
					)
				}
			</TouchableWithoutFeedback>
		);
	}


	render() {
		return (
			<View style={styles.root}>
				{this.renderNavBar()}
				<View style={styles.body}>
					<View style={styles.statusWrapper}>
						<MaterialIcons name="check-circle-outline" size={20} style={styles.statusIc} color="green" />
						<Text style={styles.statusText}>Completed</Text>
					</View>
					<ScrollView>
						<View style={styles.sectionsWrapper}>
							{this.renderShopInfo()}
							{this.renderShippingInfo()}
							{this.renderProducts()}
						</View>
					</ScrollView>
				</View>
			</View>
		)
	}
}

export default inject('store')(observer(OrderDetails))