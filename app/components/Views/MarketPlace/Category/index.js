import React, { PureComponent } from 'react';
import { action, makeObservable, observable } from 'mobx';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import store from '../store';
import { menuKeys } from '../Drawer';
import styles from './styles';
import { colors } from '../../../../styles/common';
import Search from '../components /Search';
import { strings } from '../../../../../locales/i18n';
import { inject, observer } from 'mobx-react';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import { isTablet } from 'react-native-device-info';
import Cart from '../components /Cart';
import { refStoreService } from '../store/StoreService';
import { StoreQuery } from '../store/StoreMessages';
import { sha256 } from '../../../../core/CryptoSignature';
import IonIcon from 'react-native-vector-icons/Ionicons';

class MarketCategory extends PureComponent {
	vendor = {};
	query = '';
	searchText = '';
	products = [];
	selectedCategory = {};

	constructor(props) {
		super(props);
		makeObservable(this, {
			vendor: observable,
			query: observable,
			searchText: observable,
			products: observable,
			selectedCategory: observable,
			onGoBack: action
		});
		const params = props.navigation.state.params;
		const { vendor, query, category } = params || {};
		this.vendor = vendor || {};
		this.category = category;
		this.query = query || '';
		this.searchText = this.query;
	}

	componentDidMount() {
		store.marketMenuKey = menuKeys().store;
		this.fetchProducts();
	}

	async fetchProducts() {
		this.handleSearch();
	}

	onViewFilter = () => {
		this.props.navigation.navigate('MarketSellerCategory', {
			onGoBack: selectedCategory => this.onGoBack(selectedCategory)
		});
	};

	showProduct = product => {
		this.props.navigation.navigate('MarketProduct', {
			product,
			vendor: this.vendor,
			onUpdate: () => this.fetchProducts()
		});
	};

	goBack = () => {
		this.props.navigation.goBack();
	}

	openCart = () => {
		this.props.navigation.navigate('MarketCart');
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.goBack.bind(this)} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'arrow-left'} size={RFValue(15)} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{this.vendor?.profile?.storeName}</Text>
					<View style={styles.navButton} />
					<Cart onPress={this.openCart} color={colors.white} />
				</View>
			</SafeAreaView>
		);
	}

	onGoBack(selectedCategory) {
		this.selectedCategory = selectedCategory;
	}

	seeAllProducts() {
		this.selectedCategory = {};
		this.query = '';
	}

	onAddToCart = (product) => {
		store.cartBadge++;
		store.addToCart({
			uuid: product.uuid,
			product,
			quantity: 1,
		})
	}

	renderProduct = item => {
		const { title, price, description, images } = item;
		const photo = images[0];
		return (
			<TouchableOpacity style={styles.product} activeOpacity={0.6} onPress={() => this.showProduct(item)}>
				<Image source={{ uri: photo }} style={styles.photo} />
				<Text style={styles.title}>{title}</Text>
				<Text numberOfLines={1} style={styles.desc}>
					{description}
				</Text>
				<Text numberOfLines={1} style={styles.price}>{`$${price}`}</Text>
				<TouchableOpacity style={styles.addProduct} activeOpacity={0.6} onPress={this.onAddToCart}>
					<Icon style={styles.plus} name={'plus'} size={14} color={colors.white} />
					<IonIcon style={styles.cartIcon} name={'cart-outline'} size={22} color={colors.white} />
				</TouchableOpacity>
			</TouchableOpacity>
		);
	};

	renderCategory = () => {
		const { products } = this;
		const items = products;
		const countInRow = isTablet() ? 4 : 2;
		const placeholder = countInRow - (items.length % countInRow);

		return (
			<SafeAreaView>
				<View style={styles.category}>
					{items.length <= 0 && (
						<View style={styles.notFoundWrapper}>
							<Text style={styles.notFoundText}>
								{strings('market.not_found_product')}
							</Text>
						</View>
					)}
					{items.map((e, index) => this.renderProduct(e))}
					{placeholder > 0 &&
						placeholder < countInRow &&
						Array(placeholder)
							.fill(1)
							.map(() => <View style={styles.product} />)}
				</View>
				{items.length < products.length && (
					<TouchableOpacity onPress={() => this.seeAllProducts()} style={{ alignSelf: 'center' }}>
						<Text style={styles.seeAllText}>{strings('market.see_all_products')}</Text>
					</TouchableOpacity>
				)}
			</SafeAreaView>
		);
	};

	onSearch = text => (this.searchText = text);
	handleSearch = () => {
		this.query = this.searchText;
		const hash = sha256(this.category.uuid);

		const storeService = refStoreService();
		storeService.queryProductOnVendorStore(this.vendor.wallet, { query: this.query }, hash);

		storeService.addListener((data) => {
			if (data.action == StoreQuery().action && data.hash == hash) {
				this.products = [...data.data.result];
			}
		})
	}

	render() {
		return (
			<View style={styles.root}>
				{this.renderNavBar()}
				<View style={styles.header}>
					<Search value={this.searchText} onChange={this.onSearch} onSearch={this.handleSearch} />
					<Icon
						name="filter"
						size={20}
						style={{ paddingHorizontal: 16, color: colors.white }}
						onPress={this.onViewFilter}
					/>
				</View>
				<ScrollView style={styles.body} nestedScrollEnabled>
					{this.renderCategory()}
				</ScrollView>
			</View>
		);
	}
}

export default inject('store')(observer(MarketCategory));
