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

class MarketSellerCategory extends PureComponent {
	categories = [];
	selectedCategory = {};
	selectedSubCategory = {};

	constructor(props) {
		super(props);
		makeObservable(this, {
			categories: observable,
			selectedCategory: observable,
			selectedSubCategory: observable,
			initData: action,
			onSelectSubCategory: action
		});
	}

	componentDidMount() {
		this.fetchProducts();
	}

	async fetchProducts() {
		await store.load();
		const products = await store.marketProducts;
		const fetchedCategories = await store.marketCategories;

		this.initData(fetchedCategories);
	}

	initData(fetchedCategories) {
		const idMapping = fetchedCategories.reduce((acc, el, i) => {
			acc[el.uuid] = i;
			return acc;
		}, {});

		fetchedCategories.forEach(el => {
			if (!el.parent) {
				this.categories.push(el);
				return;
			}
			const parentEl = fetchedCategories[idMapping[el.parent]];
			parentEl.children = [...(parentEl.children || []), el];
		});

		this.selectedCategory = this.categories[0];
	}

	getMenuIcon(hash) {
		switch (hash) {
			case 'd8277c2b-3045-4c56-8182-d166ffa56097':
				return 'car';
			case 'b5aecea2-9d00-49cf-a196-fdd178b80d83':
				return 'wrench';
			case '41f0a90c-f191-4c5a-9d08-9a42c9dbab9c':
				return 'briefcase';
			default:
				return 'question';
		}
	}

	onSelectSubCategory(item) {
		if (Object.keys(this.selectedSubCategory).length !== 0) this.selectedSubCategory = {};
		else this.selectedSubCategory = item;
	}

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<Text
						style={{
							textAlign: 'center',
							flex: 1,
							fontSize: 18,
							color: colors.fontPrimary,
							marginVertical: 5
						}}
					>
						{strings('market.my_store')}
					</Text>
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	renderMenu() {
		return (
			<View style={styles.menuWrapper}>
				{this.categories.map(e => (
					<TouchableOpacity
						key={e.uuid}
						style={[styles.menuItem, this.selectedCategory.uuid === e.uuid && styles.selectedMenuItem]}
						onPress={() => (this.selectedCategory = e)}
					>
						<Icon
							name={this.getMenuIcon(e.uuid)}
							size={28}
							style={[styles.icon, this.selectedCategory.uuid === e.uuid && styles.selected]}
						/>
						<Text style={[styles.menuName, this.selectedCategory.uuid === e.uuid && styles.selected]}>
							{e.name}
						</Text>
					</TouchableOpacity>
				))}
			</View>
		);
	}

	renderMenuContent() {
		return (
			<View style={{ flex: 3 }}>
				<View style={styles.selectedCategoryWrapper}>
					<SafeAreaView>
						<ScrollView>
							{this.selectedCategory.children &&
								this.selectedCategory.children.map(e => (
									<View>
										<View style={styles.contentItem}>
											<Text style={styles.contentItemText}>{e.name}</Text>
											{e.children && (
												<TouchableOpacity onPress={() => this.onSelectSubCategory(e)}>
													<Icon
														name={`chevron-${
															Object.keys(this.selectedSubCategory).length !== 0
																? 'up'
																: 'down'
														}`}
														size={20}
													/>
												</TouchableOpacity>
											)}
										</View>
										{this.selectedSubCategory.uuid === e.uuid &&
											e.children?.map(e => this.renderSubCategories(e.name))}
									</View>
								))}
						</ScrollView>
					</SafeAreaView>
				</View>
			</View>
		);
	}

	renderSubCategories(name) {
		return (
			<View style={[styles.contentItem, styles.subItem]}>
				<Text style={styles.contentItemText}>{name}</Text>
			</View>
		);
	}

	render() {
		return (
			<View style={styles.root}>
				{this.renderNavBar()}
				<View style={styles.contentWrapper}>
					{this.renderMenu()}
					{this.renderMenuContent()}
				</View>
			</View>
		);
	}
}

export default inject('store')(observer(MarketSellerCategory));
