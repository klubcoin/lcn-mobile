import React, { PureComponent } from 'react';
import { action, makeObservable, observable } from 'mobx';
import { FlatList, Image, SafeAreaView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import store from '../../MarketPlace/store';
import { menuKeys } from '../Drawer';
import styles from './styles';
import { colors } from '../../../../styles/common';
import Search from '../components/Search';
import { strings } from '../../../../../locales/i18n';
import { inject, observer } from 'mobx-react';
import { RFValue } from 'react-native-responsive-fontsize';
import { isTablet } from 'react-native-device-info';
import AssetIcon from '../../../UI/AssetIcon';
import routes from '../../../../common/routes';
import NetworkMainAssetLogo from '../../../UI/NetworkMainAssetLogo';
import { showError } from '../../../../util/notify';
import TrackingScrollView from '../../../UI/TrackingScrollView';

class MarketSellerOverview extends PureComponent {
	activeTab = 0;
	query = '';
	categories = [];
	products = [];
	selectedCategory = {};

	constructor(props) {
		super(props);
		makeObservable(this, {
			activeTab: observable,
			query: observable,
			categories: observable,
			products: observable,
			selectedCategory: observable,
			onGoBack: action
		});
	}

	componentDidMount() {
		store.marketMenuKey = menuKeys().store;
		this.fetchProducts();
		this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
			this.fetchStoreProfile();
		});
	}

	componentWillUnmount() {
		if (this.willFocusSubscription) this.willFocusSubscription.remove();
	}

	async fetchProducts() {
		await store.load();
		const products = await store.marketProducts;
		const categories = await store.marketCategories;

		const categoryIds = products.map(e => e.category?.uuid);
		this.categories = categories.filter(e => categoryIds.includes(e.uuid));
		this.products = [...products];
	}

	fetchStoreProfile = async () => {
		await store.load();
	};

	toggleDrawer = () => {
		this.props.navigation.toggleDrawer();
	};

	onViewFilter = () => {
		this.props.navigation.navigate('MarketSellerCategory', {
			onGoBack: selectedCategory => this.onGoBack(selectedCategory)
		});
	};

	onAddProduct = () => {
		if (Object.keys(store.storeProfile).length <= 0) {
			return showError(strings('market.not_found_profile'));
		}

		this.props.navigation.navigate('MarketAddEditProduct', {
			onUpdate: () => this.fetchProducts(),
			onDelete: () => this.fetchProducts()
		});
	};

	showProduct = product => {
		this.props.navigation.navigate('MarketProduct', {
			product,
			onUpdate: () => this.fetchProducts()
		});
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.toggleDrawer.bind(this)} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'bars'} size={RFValue(15)} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{strings('market.my_store')}</Text>
					<View style={styles.navButton} />
					<TouchableOpacity onPress={this.onAddProduct.bind(this)} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'plus'} size={RFValue(15)} />
					</TouchableOpacity>
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

	renderCategoryTabs() {
		const { query, activeTab, categories } = this;
		const search = query.toLowerCase();
		const searchMode = search && search.length > 0;
		if (searchMode) return;

		return (
			<TrackingScrollView style={styles.tabs} horizontal>
				{categories.map((e, index) => {
					const active = index == activeTab;
					return (
						<TouchableOpacity
							style={styles.tab}
							activeOpacity={0.6}
							onPress={() => (this.activeTab = index)}
						>
							<Text style={[styles.tabTitle, active && styles.activeTab]}>{e.name}</Text>
							{active && <View style={styles.tabActive} />}
						</TouchableOpacity>
					);
				})}
			</TrackingScrollView>
		);
	}

	renderItemCategory = item => {
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
			</TouchableOpacity>
		);
	};

	renderCategory = () => {
		const { activeTab, categories, products, query } = this;
		const category = categories[activeTab];
		const search = query?.toLowerCase() ?? '';
		const items =
			search && search.length > 0
				? products.filter(
					e =>
						e.title?.toLowerCase().indexOf(search) >= 0 ||
						e.description?.toLowerCase().indexOf(search) >= 0 ||
						`${e.price}`.indexOf(search) >= 0
				)
				: products.filter(e =>
					Object.keys(this.selectedCategory).length > 0
						? e.category?.uuid == this.selectedCategory.uuid
						: true
				);
		const countInRow = isTablet() ? 4 : 2;
		const placeholder = countInRow - (items.length % countInRow);

		return (
			<SafeAreaView>
				<View style={styles.category}>
					{Object.keys(store.storeProfile).length <= 0 && (
						<View style={styles.notFoundWrapper}>
							<Text style={styles.notFoundText}>{strings('market.not_found_profile')}</Text>
						</View>
					)}
					{items.length <= 0 && Object.keys(store.storeProfile).length > 0 && (
						<View style={styles.notFoundWrapper}>
							<Text style={styles.notFoundText}>
								{products.length <= 0
									? strings('market.not_have_products')
									: strings('market.not_found_product')}
							</Text>
						</View>
					)}
					{items.map((e, index) => {
						const { title, price, description, images, currency } = e;
						const photo = images[0];
						return (
							<TouchableOpacity
								style={styles.product}
								activeOpacity={0.6}
								onPress={() => this.showProduct(e)}
							>
								<Image source={{ uri: photo }} style={styles.photo} />
								<Text style={styles.title}>{title}</Text>
								<Text numberOfLines={1} style={styles.desc}>
									{description}
								</Text>
								<View style={styles.priceContainer}>
									<Text numberOfLines={1} style={styles.price}>
										{`${price} `}
									</Text>
									<Text numberOfLines={1} style={styles.price}>
										{currency?.symbol || '$'}
									</Text>
								</View>
								<View style={styles.ticker}>
									{currency?.name === routes.mainNetWork.name ? (
										<NetworkMainAssetLogo style={styles.tokenLogo} />
									) : (
										<AssetIcon logo={currency?.logo} customStyle={styles.tokenLogo} />
									)}
								</View>
							</TouchableOpacity>
						);
					})}
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
	handleSearch = () => (this.query = this.searchText);

	render() {
		return (
			<View style={styles.root}>
				{this.renderNavBar()}
				<View style={{ flexDirection: 'row', alignItems: 'center' }}>
					<Search onChange={this.onSearch} onSearch={this.handleSearch} />
					<Icon
						name="filter"
						size={20}
						style={{ paddingHorizontal: 16, color: colors.white }}
						onPress={this.onViewFilter}
					/>
				</View>
				<TrackingScrollView style={styles.body} nestedScrollEnabled>
					{this.renderCategory()}
				</TrackingScrollView>
			</View>
		);
	}
}

export default inject('store')(observer(MarketSellerOverview));
