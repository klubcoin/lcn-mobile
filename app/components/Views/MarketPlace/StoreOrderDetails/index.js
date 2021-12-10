import React, { PureComponent } from "react";
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { makeObservable, observable } from "mobx";
import { inject, observer } from "mobx-react";
import Icon from "react-native-vector-icons/FontAwesome5";
import IonIcon from "react-native-vector-icons/Ionicons";
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import styles from "./styles";
import { strings } from "../../../../../locales/i18n";
import colors from "../../../../common/colors";
import StyledButton from "../../../UI/StyledButton";
import { TouchableWithoutFeedback } from "react-native-gesture-handler";
import preferences from '../../../../store/preferences'
import moment from "moment";
import ModalSelector from "../../../UI/AddCustomTokenOrApp/ModalSelector";
import { refStoreService } from "../store/StoreService";
import store from "../store";


export const OrderStatus = () => ({
	pending: strings('order.pending'),
	processing: strings('order.processing'),
	shipping: strings('order.shipping'),
	completed: strings('order.completed'),
	canceled: strings('order.canceled'),
	refunded: strings('order.refunded'),
})

class OrderDetails extends PureComponent {

	showStatus = false;
	viewPayment = false;

	constructor(props) {
		super(props)
		makeObservable(this, {
			showStatus: observable,
			viewPayment: observable,
		})
		this.orderDetails = this.props.navigation.getParam('orderDetails');
		const { order } = this.orderDetails || {};
		this.status = OrderStatus()[order.status || 'processing'];
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

	onViewPayment = () => {
		this.viewPayment = !this.viewPayment;
	}

	renderShippingInfo = () => {
		const { order } = this.orderDetails;
		const { shipping } = order;
		const { name, phone, address } = shipping;

		return (
			<View style={styles.section}>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<Text style={styles.titleInfoText}>
						{strings('market.shipping_info')}
					</Text>
				</View>
				<View style={styles.infoSection}>
					<Text style={styles.name}>{name}</Text>
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
				{this.renderChatButton()}
			</View>
		);
	}

	renderProducts = () => {
		const { order, amount } = this.orderDetails;
		const products = order.items;

		return (
			<TouchableWithoutFeedback style={styles.section} onPress={this.onViewPayment}>
				<View style={[styles.infoSection, styles.titleWrapper]}>
					<View style={{ flex: 2 }}>
						<Text style={styles.titleInfoText}>
							{strings('market.total_payment')}
						</Text>
					</View>
					<Text style={styles.titleInfoText}>{amount.total.toFixed()} {amount.currencyUnit}</Text>
				</View>
				{
					products.map(e => (
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
					))
				}
			</TouchableWithoutFeedback>
		);
	}

	renderDates = () => {
		const { order } = this.orderDetails;

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

	openChat = async () => {
		const { order } = this.orderDetails;
		const address = order.from;
		this.props.navigation.navigate('Chat', { selectedContact: { address } });
	};

	renderChatButton = () => {
		return (
			<TouchableOpacity style={styles.chat} activeOpacity={0.6} onPress={this.openChat}>
				<IonIcon style={styles.chatBubble} name={'chatbubble-ellipses-outline'} size={28} />
			</TouchableOpacity>
		);
	};

	onRefund = () => {
		//TODO: send transaction to refund or request central server
	}

	cancelOrder = () => {

	}

	renderFooter = () => {
		return (
			<View style={styles.buttonsWrapper}>
				<StyledButton
					type={'blue'}
					containerStyle={styles.actionButton}
					onPress={this.onRefund}
				>
					{strings('market.refund')}
				</StyledButton>
				<StyledButton
					type={'danger'}
					onPress={this.cancelOrder}
					containerStyle={styles.actionButton}
				>
					{strings('market.cancel')}
				</StyledButton>
			</View>
		);
	}

	updateStatus = (status) => {
		const { order } = this.orderDetails;
		order.status = status;
		store.updateVendorOrder(order);

		const storeService = refStoreService();
		storeService.updateOrderStatus(order, status);
	}

	renderStatusOptions = () => {
		const statuses = OrderStatus();
		const options = Object.keys(statuses).map(k => ({
			key: k,
			value: statuses[k],
		}));

		return (
			<ModalSelector
				visible={this.showStatus}
				hideKey={true}
				options={options}
				onSelect={(item) => {
					this.status = statuses[item.key];
					this.showStatus = false;
					this.updateStatus(item.key);
				}}
				onClose={() => this.showStatus = false}
			/>
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
						<TouchableOpacity
							style={styles.editStatus}
							activeOpacity={0.6}
							onPress={() => this.showStatus = true}>
							<Icon style={styles.editIcon} name={'pen'} size={18} />
						</TouchableOpacity>
					</View>
					<ScrollView>
						<View style={styles.sectionsWrapper}>
							{this.renderDates()}
							{this.renderShippingInfo()}
							{this.renderProducts()}
						</View>
					</ScrollView>
				</View>
				{this.renderFooter()}
				{this.renderStatusOptions()}
			</View>
		)
	}
}

export default inject('store')(observer(OrderDetails))