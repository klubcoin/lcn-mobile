import React, { PureComponent } from 'react';
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import store from '../MarketPlace/store';
import styles from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import APIService from '../../../services/APIService';
import { menuKeys } from './Drawer';
import Search from './components/Search';
import { strings } from '../../../../locales/i18n';
import Carousel from 'react-native-snap-carousel';
import { isTablet } from 'react-native-device-info';
import routes from '../../../common/routes';
import { refStoreService } from '../MarketPlace/store/StoreService';
import ModalSelector from '../../UI/AddCustomTokenOrApp/ModalSelector';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { StoreAnnounce, StoreQuery } from '../MarketPlace/store/StoreMessages';
import { sha256 } from '../../../core/CryptoSignature';
import Cart from './components/Cart';
import { colors } from '../../../styles/common';
import StoreImage from '../MarketPlace/components/StoreImage';
import StripHtml from '../MarketPlace/components/StripHtml';

const window = Dimensions.get('window');
const screenWidth = window.width;

const rowSize = isTablet() ? 4 : 3;

class MarketPlace extends PureComponent {
	static navigationOptions = () => ({ header: null });

	activeTab = 0;
	searchQuery = '';
	category = '';
	categories = [];
	showCategories = false;
	vendors = [];
	products = [];

	constructor(props) {
		super(props);
		makeObservable(this, {
			activeTab: observable,
			searchQuery: observable,
			category: observable,
			categories: observable,
			showCategories: observable,
			vendors: observable,
			products: observable,
		});
	}

	componentDidMount() {
		store.marketMenuKey = menuKeys().shopping;
		this.fetchCategories();
		this.fetchCart();
	}

	async fetchCategories() {
		const categories = store.marketCategories;
		this.categories = [...categories];

		if (categories && !this.category) {
			this.category = categories[0];
		}

		APIService.getMarketCategories((success, json) => {
			if (success && json) {
				store.saveProductCategories(json);
				this.categories = [...json];

				if (categories && !this.category) {
					this.category = categories[0];
				}
				if (this.categories && !this.category) {
					this.category = this.categories[0];
				}
				this.handleSearch();
			}
		});
	}

	async fetchCart() {
		let quantity = 0;
		store.marketCart.map(e => {
			quantity += e.quantity;
		});
		store.setCartBadge(quantity);
	}

	renderCategoryTabs() {
		const categories = [];
		return (
			<View style={styles.tabs}>
				{categories.map((e, index) => {
					const active = index == this.activeTab;
					return (
						<TouchableOpacity
							style={styles.tab}
							activeOpacity={0.6}
							onPress={() => (this.activeTab = index)}
						>
							<Text style={[styles.tabTitle, active && styles.activeTab]}>{e.title}</Text>
							{active && <View style={styles.tabActive} />}
						</TouchableOpacity>
					);
				})}
			</View>
		);
	}

	renderRecentProductSlide = ({ item }) => {
		const { index } = item;
		const start = index * rowSize;
		const items = store.marketRecentProducts.slice(start, start + rowSize);
		if (items.length != rowSize) {
			Array(rowSize - items.length)
				.fill(false)
				.map(() => items.push(false));
		}
		const width = (screenWidth - 40) / rowSize - 20;

		return (
			<View style={styles.slide}>
				{items.map((e, i) => {
					if (!e) return <View style={{ width }} />;

					const { price, discountPrice, title, images } = e;
					return (
						<TouchableOpacity
							activeOpacity={0.6}
							style={{ width, alignItems: 'center' }}
							onPress={() => this.showProduct(e)}
							testID={'market-recent-product'}
							accessibilityLabel={'market-recent-product'}
						>
							<StoreImage style={{ width, height: width }} address={e.wallet} path={images[0]} />
							<Text numberOfLines={2} style={styles.title}>
								{title}
							</Text>
							<Text numberOfLines={1} style={styles.finalPrice}>
								{discountPrice ?? price} {routes.mainNetWork.ticker}
							</Text>
							{/* <Text numberOfLines={1} style={styles.price}>
								{price} {routes.mainNetWork.ticker}
							</Text> */}
						</TouchableOpacity>
					);
				})}
			</View>
		);
	};

	renderRecentlyViewedProducts = () => {
		const slideCount = Math.ceil(store.marketRecentProducts.length / rowSize);
		const data = Array(slideCount)
			.fill(0)
			.map((e, index) => ({ index }));

		return (
			<View style={styles.section}>
				{this.renderHeading({ title: strings('market.recently_viewed_products') })}
				{data.length <= 0 && <Text style={styles.nullDataDesc}>{strings('market.not_view_products')}</Text>}
				<Carousel
					ref={e => (this.viewedProductSlider = e)}
					data={data}
					renderItem={this.renderRecentProductSlide}
					autoplay={true}
					loop={true}
					autoplayInterval={3000}
					sliderWidth={screenWidth - 20}
					itemWidth={screenWidth - 20}
				/>
			</View>
		);
	};

	renderRecentProviderSlide = ({ item }) => {
		const rowSize = 4;
		const { index } = item;
		const start = index * rowSize;
		const items = store.marketRecentProviders.slice(start, start + rowSize);
		if (items.length != rowSize) {
			Array(rowSize - items.length)
				.fill(false)
				.map(() => items.push(false));
		}
		const width = (screenWidth - 40) / rowSize - 20;

		return (
			<View style={styles.slide}>
				{items.map((e, i) => {
					if (!e) return <View style={{ width }} />;

					const { wallet, profile } = e;
					return (
						<TouchableOpacity
							style={{ width, alignItems: 'center' }}
							activeOpacity={0.6}
							onPress={() => this.onPressVendor(e)}
							testID={'market-recent-vendor'}
							accessibilityLabel={'market-recent-vendor'}
						>
							<StoreImage style={{ width, height: width }} address={wallet} path={profile.logoStore} />
							<Text numberOfLines={2} style={styles.storeName}>
								{profile?.storeName}
							</Text>
							<Text numberOfLines={1} style={styles.distance}>
								{this.calculateDistance(profile.coords)} km
							</Text>
						</TouchableOpacity>
					);
				})}
			</View>
		);
	};

	renderRecentlyVisitedProviders = () => {
		const slideCount = Math.ceil(store.marketRecentProviders.length / rowSize);
		const data = Array(slideCount)
			.fill(0)
			.map((e, index) => ({ index }));

		return (
			<View style={styles.section}>
				{this.renderHeading({ title: strings('market.recently_visited_vendors') })}
				{data.length <= 0 && <Text style={styles.nullDataDesc}>{strings('market.not_visit_vendors')}</Text>}
				<Carousel
					ref={e => (this.viewedProductSlider = e)}
					data={data}
					renderItem={this.renderRecentProviderSlide}
					autoplay={true}
					loop={true}
					autoplayInterval={3000}
					sliderWidth={screenWidth - 20}
					itemWidth={screenWidth - 20}
				/>
			</View>
		);
	};

	onPressVendor = vendor => {
		store.addStoreVendors(vendor.wallet, vendor);
		store.addRecentProvider(vendor);
		this.props.navigation.navigate('MarketCategory', { vendor, query: this.query || '', category: this.category });
	};

	showProduct = product => {
		this.props.navigation.navigate('MarketProduct', { product });
	};

	renderHeading = category => {
		const { title, desc } = category;
		return (
			<View style={styles.sectionHead}>
				<View style={{ flex: 1 }}>
					<Text style={styles.sectionTitle}>{title}</Text>
					{!!desc && <Text style={styles.desc}>{desc}</Text>}
				</View>
			</View>
		);
	};

	calculateDistance = (coords) => {
		const shipping = store.shippingInfo?.coords || {};
		return this.distance(coords?.latitude, coords?.longitude, shipping?.latitude, shipping?.longitude)
	}

	distance(lat1, lon1, lat2, lon2, unit = 'k') {
		if ((lat1 == lat2) && (lon1 == lon2)) {
			return 0;
		} else {
			var radlat1 = Math.PI * lat1 / 180;
			var radlat2 = Math.PI * lat2 / 180;
			var theta = lon1 - lon2;
			var radtheta = Math.PI * theta / 180;
			var dist = Math.sin(radlat1) * Math.sin(radlat2) + Math.cos(radlat1) * Math.cos(radlat2) * Math.cos(radtheta);
			if (dist > 1) {
				dist = 1;
			}
			dist = Math.acos(dist);
			dist = dist * 180 / Math.PI;
			dist = dist * 60 * 1.1515;
			if (unit == 'k' || unit == 'K') { dist = dist * 1.609344 }
			if (unit == 'n' || unit == 'N') { dist = dist * 0.8684 }
			return dist;
		}
	}

	renderProduct = item => {
		const vendor = this.vendor;
		const { title, price, description, images } = item;
		const photo = images[0];
		const { defaultCurrency } = store.storeProfile || {};
		const currency = defaultCurrency?.symbol || routes.mainNetWork.ticker;

		return (
			<TouchableOpacity style={styles.product} activeOpacity={0.6} onPress={() => this.showProduct(item)}>
				<StoreImage style={styles.photo} address={vendor.wallet} path={photo} />
				<Text style={styles.title}>{title}</Text>
				<StripHtml numberOfLines={1} style={styles.desc}>
					{description}
				</StripHtml>
				<Text numberOfLines={1} style={styles.price}>{`${price} ${currency}`}</Text>
			</TouchableOpacity>
		);
	};

	renderProducts = () => {
		const { products } = this;

		return (
			<View style={styles.products}>
				{products.map((e, index) => this.renderProduct(e))}
			</View>
		);
	};

	renderProviders = () => {
		const width = (screenWidth - 40) / rowSize - 20;

		const { defaultCurrency } = store.storeProfile || {};
		const currency = defaultCurrency?.symbol || routes.mainNetWork.ticker;

		return (
			<View style={styles.section}>
				{this.renderHeading({ title: strings('market.vendors') })}
				{this.vendors.length <= 0 && (
					<Text style={styles.nullDataDesc}>{strings('market.not_visit_vendors')}</Text>
				)}
				{this.vendors?.length > 0 && (
					<View style={styles.vendorView}>
						<View style={styles.headerLogo} />
						<View style={styles.vendorInfo}>
							<Text style={styles.vendor}>{strings('market.name')}</Text>
							<Text style={styles.distance}>{strings('market.distance')}</Text>
							<Text style={styles.score}>#{strings('market.product')}</Text>
							<Text style={styles.priceRange}>{strings('market.price')}</Text>
						</View>
					</View>
				)}
				{this.vendors &&
					this.vendors.map((e, index) => {
						const { profile, rating, score, priceRange, tags } = e;
						const { storeName } = profile || {};
						return (
							<TouchableOpacity
								style={styles.vendorView}
								activeOpacity={0.6}
								onPress={() => this.onPressVendor(e)}
								testID={'market-vendor-store'}
								accessibilityLabel={'market-vendor-store'}
							>
								<StoreImage style={styles.vendorLogo} address={e.wallet} path={profile?.logoStore} />
								<View style={styles.vendorInfo}>
									<Text numberOfLines={2} style={styles.vendor}>
										{storeName}
									</Text>
									<Text numberOfLines={1} style={styles.distance}>
										{this.calculateDistance(profile.coords).toFixed(1)}km
									</Text>
									{/* 
									<Text numberOfLines={1} style={styles.rating}>
										{strings('market.rating')} {rating}
									</Text> 
									*/}
									<Text numberOfLines={1} style={styles.score}>
										{score.split('/').reverse()[0]}
									</Text>
									<Text numberOfLines={2} style={styles.priceRange}>
										{`${priceRange.from}${priceRange.from == priceRange.to ? '' : ' - ' + priceRange.to
											} ${currency}`}
									</Text>
									{/* 
									<Text numberOfLines={1} style={styles.tags}>
										{tags?.join(', ')}
									</Text>
									*/}
								</View>
							</TouchableOpacity>
						);
					})}
			</View>
		);
	};

	onBack = () => {
		this.props.navigation.navigate('WalletView');
	};

	toggleDrawer = () => {
		this.props.navigation.toggleDrawer();
	};

	onSearch = text => (this.searchQuery = text);
	handleSearch = () => {
		this.vendors = [];
		this.products = [];
		const hash = this.category?.hash;
		this.query = this.searchQuery.toLowerCase();

		const storeService = refStoreService();
		storeService?.searchProduct({ query: this.query }, hash);

		storeService?.addListener(data => {
			if (data.action == StoreAnnounce().action && data.hashes[0] == hash) {
				const { info } = data;
				const { query } = info;
				if (query?.query == this.query) {
					if (this.vendors.find(e => e.wallet == data.from)) return;
					this.vendors.push({
						...info,
						wallet: data.from
					});
					this.fetchProducts();
				}
			}
		});
	};

	fetchProducts = async () => {
		const vendor = this.vendor = this.vendors[0];
		const hash = this.category?.hash;

		const storeService = refStoreService();
		storeService.queryProductOnVendorStore(vendor.wallet, { query: this.query }, hash);

		storeService.addListener(data => {
			if (data.action == StoreQuery().action && data.hash == hash) {
				this.products = [...data.data.result];
			}
		});
	}

	openCart = () => {
		this.props.navigation.navigate('ShoppingCart');
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.toggleDrawer.bind(this)} style={styles.navButton}
						testID={'nav-menu'}
						accessibilityLabel={'nav-menu'}
					>
						<Icon style={styles.backIcon} name={'bars'} size={16} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{strings('market.title')}</Text>
					<Cart onPress={this.openCart} color={colors.white} />
				</View>
			</SafeAreaView>
		);
	}

	renderSelector() {
		const category = this.category ?? this.categories[0];
		const value = category?.name || '';

		return (
			<TouchableOpacity
				style={styles.category}
				activeOpacity={0.6}
				onPress={() => (this.showCategories = true)}
				testID={'market-category'}
				accessibilityLabel={'market-category'}
			>
				<Text style={styles.option}>{value}</Text>
				<FontAwesome name={'caret-down'} size={20} style={styles.dropdownIcon} />
			</TouchableOpacity>
		);
	}

	renderCategoryModal = () => {
		const options = this.categories.map(e => ({
			key: e.uuid,
			value: e.name
		}));

		return (
			<ModalSelector
				visible={!!this.showCategories}
				options={options}
				hideKey={true}
				onSelect={item => {
					this.category = this.categories.find(e => e.uuid == item.key);
					this.showCategories = false;
					this.handleSearch();
				}}
				onClose={() => (this.showCategories = false)}
			/>
		);
	};

	render() {
		return (
			<View style={styles.root}>
				{this.renderNavBar()}
				<View style={styles.searchBox}>
					<Search value={this.searchQuery} onChange={this.onSearch} onSearch={this.handleSearch} />
				</View>
				<View style={styles.categorySelector}>
					<Text style={styles.labelCategory}>{strings('market.in_category')} :</Text>
					{this.renderSelector()}
				</View>
				<ScrollView style={styles.body} nestedScrollEnabled>
					{this.renderProducts()}
					{this.renderProviders()}
					{this.renderRecentlyViewedProducts()}
					{this.renderRecentlyVisitedProviders()}
					{this.renderCategoryModal()}
				</ScrollView>
			</View>
		);
	}
}

export default inject('store')(observer(MarketPlace));
