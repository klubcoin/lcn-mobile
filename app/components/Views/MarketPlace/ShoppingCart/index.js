import React, { PureComponent } from 'react';
import { inject, observer } from 'mobx-react';
import { FlatList, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import MaterialIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import IonIcon from 'react-native-vector-icons/Ionicons';
import styles from './styles';
import { strings } from '../../../../../locales/i18n';
import store from '../../MarketPlace/store';
import { RFPercentage } from 'react-native-responsive-fontsize';
import colors from '../../../../common/colors';
import routes from '../../../../common/routes';
import { makeObservable, observable } from 'mobx';
import StoreImage from '../../MarketPlace/components/StoreImage';
import TrackingTextInput from '../../../UI/TrackingTextInput';

class ShoppingCart extends PureComponent {
	totalAmount = 0;
	totalQuantity = 0;
	productGroups = {};

	constructor(props) {
		super(props);
		makeObservable(this, {
			totalAmount: observable,
			totalQuantity: observable,
			productGroups: observable
		});
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
			totalQuantity += Number(quantity);
			total += quantity * product.price;
		});
		this.totalAmount = total;
		this.totalQuantity = totalQuantity;
		store.setCartBadge(totalQuantity);
	};

	decreaseQuantity = product => {
		if (product.quantity <= 1) return;

		product.quantity -= 1;
		this.updateCart(product);
		this.calculateTotal();
	};

	increaseQuantity = product => {
		product.quantity += 1;
		this.updateCart(product);
		this.calculateTotal();
	};

	updateCart = product => {
		store.addToCart({
			uuid: product.uuid,
			product: product.product,
		});
	}

	renderQuantity = product => {
		const { quantity } = product;

		return (
			<View style={styles.quantityView}>
				<TouchableOpacity
					style={styles.adjustQuantity}
					activeOpacity={0.6}
					onPress={() => this.decreaseQuantity(product)}
				>
					<Icon style={styles.quantityIcon} name={'minus'} size={RFPercentage(2)} />
				</TouchableOpacity>
				<TrackingTextInput
					value={`${quantity}`}
					onChangeText={text => {
						product.quantity = Number(text);
						this.updateCart(product);
						this.calculateTotal();
						this.setState({ update: new Date() });
					}}
					style={styles.quantity}
					keyboardType={'numeric'}
				/>
				<TouchableOpacity
					style={styles.adjustQuantity}
					activeOpacity={0.6}
					onPress={() => this.increaseQuantity(product)}
				>
					<Icon style={styles.quantityIcon} name={'plus'} size={RFPercentage(2)} />
				</TouchableOpacity>
			</View>
		);
	};

	toggleItem = product => {
		product.excluded = !product.excluded;
		this.calculateTotal();
	};

	removeItem = (uuid, address) => {
		this.productGroups[address].products = this.productGroups[address]?.products.filter(e => e.uuid !== uuid);
		store.removeProductInCart(uuid);
		this.calculateTotal();
	};

	renderItem = ({ index, item }) => {
		const { products, profile } = this.productGroups[item];

		return (
			products.length > 0 && <View style={styles.itemWrapper}>
				<View style={styles.storeNameContainer}>
					<MaterialIcons name={'store'} size={20} />
					<Text style={styles.storeName}>{profile?.storeName}</Text>
				</View>
				{
					products.map(e => {
						const { uuid, product } = e;
						const { excluded, title, price, currency, images } = product;
						const currencyUnit = currency?.symbol || routes.mainNetWork.ticker;

						return (
							<View style={styles.product}>
								<TouchableOpacity
									style={styles.remove}
									activeOpacity={0.6}
									onPress={() => this.toggleItem(product)}
								>
									<IonIcon name={excluded ? 'square-outline' : 'checkbox-outline'} size={22} />
								</TouchableOpacity>
								<StoreImage style={styles.image} address={product.wallet} path={images[0]} />
								<View style={styles.productInfo}>
									<Text numberOfLines={1} style={styles.title}>
										{title}
									</Text>
									<Text numberOfLines={2} style={styles.price}>
										{price} {currencyUnit}
									</Text>
									{this.renderQuantity(e)}
								</View>

								<TouchableOpacity style={styles.remove} activeOpacity={0.6} onPress={() => this.removeItem(uuid, item)}>
									<IonIcon name={'trash-outline'} size={22} color={colors.danger} />
								</TouchableOpacity>
							</View>
						);
					})
				}
			</View>
		);
	};

	renderOrderItems = () => {
		return (
			<View style={styles.body}>
				<FlatList
					data={Object.keys(this.productGroups)}
					keyExtractor={item => item}
					renderItem={this.renderItem.bind(this)}
				/>
			</View>
		);
	};

	selectAll = () => {
		store.marketCart.map(({ product }) => (product.excluded = false));
		this.calculateTotal();
	};

	gotoCheckout = () => {
		this.props.navigation.navigate('MarketCheckout');
	};

	renderFooter = () => {
		const currency = routes.mainNetWork.ticker;
		return (
			<View style={styles.footer}>
				<TouchableOpacity style={styles.selectAll} activeOpacity={0.6} onPress={this.selectAll}>
					<IonIcon name={'checkbox-outline'} size={22} />
					<Text style={styles.textAll}>{strings('market.select_all')}</Text>
				</TouchableOpacity>
				<View style={styles.summary}>
					{/* <Text style={styles.summaryTitle}>
						{strings('market.total')}:
						<Text style={styles.totalAmount}>
							{' '}
							{this.totalAmount} {currency}
						</Text>
					</Text> */}
					<Text style={styles.summaryTitle}>
						{strings('market.quantity')}:<Text style={styles.totalAmount}> {this.totalQuantity}</Text>
					</Text>
				</View>
				<TouchableOpacity style={styles.checkout} activeOpacity={0.6} onPress={this.gotoCheckout}>
					<Text style={styles.textCheckout}>{strings('market.checkout')}</Text>
				</TouchableOpacity>
			</View>
		);
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack.bind(this)} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'arrow-left'} size={16} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{strings('market.your_cart')}</Text>
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
				{this.renderFooter()}
			</View>
		);
	}
}

export default inject('store')(observer(ShoppingCart));
