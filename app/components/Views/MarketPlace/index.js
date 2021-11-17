import React, { PureComponent } from 'react';
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import store from './store';
import styles from './styles';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import APIService from '../../../services/APIService';
import { menuKeys } from './Drawer';
import Search from './components /Search';
import { strings } from '../../../../locales/i18n';
import Carousel from 'react-native-snap-carousel';
import { isTablet } from 'react-native-device-info';
import routes from '../../../common/routes';
import { refStoreService } from './store/StoreService';
import ModalSelector from '../../UI/AddCustomTokenOrApp/ModalSelector';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { StoreAnnounce } from './store/StoreMessages';
import { sha256 } from '../../../core/CryptoSignature';

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
	recentProviders = [];

	constructor(props) {
		super(props);
		makeObservable(this, {
			activeTab: observable,
			searchQuery: observable,
			category: observable,
			categories: observable,
			showCategories: observable,
			vendors: observable,
			recentProviders: observable
		});
	}

	componentDidMount() {
		store.marketMenuKey = menuKeys().shopping;
		this.fetchCategories();
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
			}
		});
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
						>
							<Image style={{ width, height: width }} source={{ uri: images[0] }} />
							<Text numberOfLines={2} style={styles.title}>
								{title}
							</Text>
							<Text numberOfLines={1} style={styles.finalPrice}>
								{discountPrice ?? price} {routes.mainNetWork.ticker}
							</Text>
							<Text numberOfLines={1} style={styles.price}>
								{price} {routes.mainNetWork.ticker}
							</Text>
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
		const { index } = item;
		const start = index * rowSize;
		const items = this.recentProviders.slice(start, start + rowSize);
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
						<View style={{ width, alignItems: 'center' }}>
							<Image style={{ width, height: width }} source={{ uri: images[0] }} />
							<Text numberOfLines={2} style={styles.title}>
								{title}
							</Text>
							<Text numberOfLines={1} style={styles.finalPrice}>
								{discountPrice ?? price} {routes.mainNetWork.ticker}
							</Text>
							<Text numberOfLines={1} style={styles.price}>
								{price} {routes.mainNetWork.ticker}
							</Text>
						</View>
					);
				})}
			</View>
		);
	};

	renderRecentlyVisitedProviders = () => {
		const slideCount = Math.ceil(this.recentProviders.length / rowSize);
		const data = Array(slideCount)
			.fill(0)
			.map((e, index) => ({ index }));

		return (
			<View style={styles.section}>
				{this.renderHeading({ title: strings('market.recently_visited_providers') })}
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

	showVendor = provider => {
		this.props.navigation.navigate('MarketCategory', { provider });
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

	renderProviders = () => {
		const width = (screenWidth - 40) / rowSize - 20;

		return (
			<View style={styles.vendors}>
				{this.renderHeading({ title: strings('market.vendors') })}
				{this.vendors?.length > 0 &&
					<View style={styles.vendorView}>
						<View style={styles.headerLogo} />
						<View style={styles.vendorInfo}>
							<Text style={styles.vendor}>{strings('market.name')}</Text>
							<Text style={styles.distance}>{strings('market.distance')}</Text>
							<Text style={styles.score}>#{strings('market.product')}</Text>
							<Text style={styles.priceRange}>{strings('market.price')}</Text>
						</View>
					</View>
				}
				{this.vendors &&
					this.vendors.map((e, index) => {
						const { profile, rating, score, priceRange, tags } = e;
						const { storeName } = profile || {};
						return (
							<TouchableOpacity
								style={styles.vendorView}
								activeOpacity={0.6}
								onPress={() => this.showVendor(e)}
							>
								<Image style={styles.vendorLogo} source={{ uri: profile?.logoStore }} />
								<View style={styles.vendorInfo}>
									<Text numberOfLines={2} style={styles.vendor}>
										{storeName}
									</Text>
									<Text numberOfLines={1} style={styles.distance}>
										{'1km'}
									</Text>
									{/* 
									<Text numberOfLines={1} style={styles.rating}>
										{strings('market.rating')} {rating}
									</Text> 
									*/}
									<Text numberOfLines={1} style={styles.score}>
										{score.split('/').reverse()[0]}
									</Text>
									<Text numberOfLines={1} style={styles.priceRange}>
										${`${priceRange.from}${priceRange.from == priceRange.to ? '' : ' - ' + priceRange.to}`}
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

	onSearch = text => (this.searchText = text);
	handleSearch = () => {
		this.vendors = [];
		const hash = sha256(this.category.uuid);
		this.query = this.searchText.toLowerCase();

		const storeService = refStoreService();
		storeService.searchProduct({ query: this.query }, hash);

		storeService.addListener((data) => {
			if (data.action == StoreAnnounce().action && data.hashes[0] == hash) {
				const { info } = data;
				const { query } = info;
				if (query?.query == this.query) {
					this.vendors.push({
						...info,
						wallet: data.from
					})
				}
			}
		})
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.toggleDrawer.bind(this)} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'bars'} size={16} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{strings('market.title')}</Text>
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	renderSelector() {
		const category = this.category ?? this.categories[0];
		const value = category?.name || '';

		return (
			<TouchableOpacity style={styles.category} activeOpacity={0.6} onPress={() => (this.showCategories = true)}>
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
					<Search onChange={this.onSearch} onSearch={this.handleSearch} />
				</View>
				<View style={styles.categorySelector}>
					<Text style={styles.labelCategory}>{strings('market.in_category')} :</Text>
					{this.renderSelector()}
				</View>
				<ScrollView style={styles.body} nestedScrollEnabled>
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
