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

const window = Dimensions.get('window');
const screenWidth = window.width;

const rowSize = isTablet() ? 4 : 3;

class MarketPlace extends PureComponent {
	static navigationOptions = () => ({ header: null });

	activeTab = 0;
	searchQuery = '';
	recentProducts = [];
	recentProviders = [];

	constructor(props) {
		super(props);
		makeObservable(this, {
			activeTab: observable,
			searchQuery: observable,
			recentProducts: observable,
			recentProviders: observable
		});
	}

	componentDidMount() {
		store.marketMenuKey = menuKeys().shopping;
		this.fetchCategories();
		this.fetchStore();
	}

	fetchCategories() {
		APIService.getMarketCategories((success, json) => {
			if (success && json) {
				store.saveProductCategories(json);
			}
		});
	}

	async fetchStore() {
		await store.load();
		this.recentProducts = [...store.marketRecentProducts];
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
		const items = this.recentProducts.slice(start, start + rowSize);
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
		const slideCount = Math.ceil(this.recentProducts.length / rowSize);
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
				{this.renderHeading({ title: strings('market.recently_viewed_products') })}
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

	showProvider = provider => {
		this.props.navigation.navigate('MarketProduct', { provider });
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
			<View style={styles.providers}>
				{this.providers &&
					this.providers.map((e, index) => {
						const { images } = e;
						return (
							<TouchableOpacity
								style={styles.provider}
								activeOpacity={0.6}
								onPress={() => this.showProvider(e)}
							>
								<Image style={{ width, height: width }} source={{ uri: images[0] }} />
								<Text numberOfLines={2} style={styles.vendor}>
									{'Vendor name'}
								</Text>
								<Text numberOfLines={1} style={styles.distance}>
									{'1km'}
								</Text>
								<Text numberOfLines={1} style={styles.rating}>
									{'4.2'}
								</Text>
								<Text numberOfLines={1} style={styles.score}>
									{'score 1/8'}
								</Text>
								<Text numberOfLines={1} style={styles.priceRange}>
									{'$12 - 20$'}
								</Text>
								<Text numberOfLines={1} style={styles.tags}>
									{'tagA, tagB, ...'}
								</Text>
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
	handleSearch = () => (this.query = this.searchText);

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

	render() {
		return (
			<View style={styles.root}>
				{this.renderNavBar()}
				<View style={styles.searchBox}>
					<Search onChange={this.onSearch} onSearch={this.handleSearch} />
				</View>
				<ScrollView style={styles.body} nestedScrollEnabled>
					<View>
						{this.renderCategoryTabs()}
						{this.renderProviders()}
					</View>
					{this.renderRecentlyViewedProducts()}
					{this.renderRecentlyVisitedProviders()}
				</ScrollView>
			</View>
		);
	}
}

export default inject('store')(observer(MarketPlace));
