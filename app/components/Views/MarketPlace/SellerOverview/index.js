import React, { PureComponent } from 'react';
import { makeObservable, observable } from 'mobx';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import store from '../store';
import { menuKeys } from '../Drawer';
import styles from './styles';
import { colors } from '../../../../styles/common';
import Search from '../components /Search';
import { strings } from '../../../../../locales/i18n';
import { inject, observer } from 'mobx-react';

class MarketSellerOverview extends PureComponent {
	activeTab = 0;
	query = '';
	categories = [];
	products = [];

	constructor(props) {
		super(props)
		makeObservable(this, {
			activeTab: observable,
			query: observable,
			categories: observable,
			products: observable,
		})
	}

	componentDidMount() {
		store.marketMenuKey = menuKeys().store;
		this.fetchProducts();
	}

	async fetchProducts() {
		await store.load();
		const products = await store.marketProducts;
		const categories = await store.marketCategories;

		const categoryIds = products.map(e => e.category?.uuid);
		this.categories = categories.filter(e => categoryIds.includes(e.uuid));
		this.products = [...products];
	}

	toggleDrawer = () => {
		this.props.navigation.toggleDrawer();
	};

	onAddProduct = () => {
		this.props.navigation.navigate('MarketAddEditProduct', {
			onUpdate: () => this.fetchProducts(),
			onDelete: () => this.fetchProducts(),
		});
	};

	showProduct = (product) => {
		this.props.navigation.navigate('MarketProduct', {
			product,
			onUpdate: () => this.fetchProducts(),
		});
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.toggleDrawer.bind(this)} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'bars'} size={16} />
					</TouchableOpacity>
					<Text
						style={{ textAlign: 'center', flex: 1, fontSize: 18, color: colors.white, marginVertical: 5 }}
					>
						{strings('market.my_store')}
					</Text>
					<View style={styles.navButton} />
					<TouchableOpacity onPress={this.onAddProduct.bind(this)} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'plus'} size={16} />
					</TouchableOpacity>
				</View>
			</SafeAreaView>
		);
	}

	renderCategoryTabs() {
		const { query, activeTab, categories } = this;
		const search = query.toLowerCase();
		const searchMode = search && search.length > 0;
		if (searchMode) return;

		return (
			<ScrollView style={styles.tabs} horizontal>
				{categories.map((e, index) => {
					const active = index == activeTab;
					return (
						<TouchableOpacity
							style={styles.tab}
							activeOpacity={0.6}
							onPress={() => this.activeTab = index}
						>
							<Text style={[styles.tabTitle, active && styles.activeTab]}>{e.name}</Text>
							{active && <View style={styles.tabActive} />}
						</TouchableOpacity>
					);
				})}
			</ScrollView>
		);
	}

	renderCategory = () => {
		const { activeTab, categories, products, query } = this;
		const category = categories[activeTab];
		const search = query.toLowerCase();
		const items = search && search.length > 0 ?
			products.filter(e => e.title?.toLowerCase().indexOf(search) >= 0
				|| e.description?.toLowerCase().indexOf(search) >= 0
				|| `${e.price}`.indexOf(search) >= 0) :
			products.filter(e => e.category?.uuid == category.uuid);

		return (
			<View style={styles.category}>
				{
					items.map((e, index) => {
						const { title, price, description, images } = e;
						const photo = images[0];
						return (
							<TouchableOpacity style={styles.product} activeOpacity={0.6} onPress={() => this.showProduct(e)}>
								<Image source={{ uri: photo }} style={styles.photo} />
								<Text style={styles.title}>{title}</Text>
								<Text numberOfLines={1} style={styles.desc}>{description}</Text>
								<Text numberOfLines={1} style={styles.price}>{`$${price}`}</Text>
							</TouchableOpacity>
						);
					})}
			</View>
		);
	};

	onSearch = (text) => this.searchText = text;
	handleSearch = () => this.query = this.searchText;

	render() {
		return (
			<View style={styles.root}>
				{this.renderNavBar()}
				<Search onChange={this.onSearch} onSearch={this.handleSearch} />
				<ScrollView style={styles.body} nestedScrollEnabled>
					{this.renderCategoryTabs()}
					{this.renderCategory()}
				</ScrollView>
			</View>
		);
	}
}

export default inject('store')(observer(MarketSellerOverview));
