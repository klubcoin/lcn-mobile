import React, { PureComponent } from 'react';
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome5';
import store from '../store';
import NavbarTitle from '../../../UI/NavbarTitle';
import { menuKeys } from '../Drawer';
import styles from './styles';
import test, { photos } from '../test';
import { colors } from '../../../../styles/common';
import Search from '../components /Search';
import { strings } from '../../../../../locales/i18n';

class MarketSellerOverview extends PureComponent {
	state = {
		activeTab: 0,
		query: ''
	};

	componentDidMount() {
		store.marketMenuKey = menuKeys().store;
	}

	toggleDrawer = () => {
		this.props.navigation.toggleDrawer();
	};

	onAddProduct = () => {
		this.props.navigation.navigate('MarketAddEditProduct');
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
		const { activeTab } = this.state;
		const categories = Array(10)
			.fill(1)
			.map(() => ({
				title: 'category 1'
			}));
		return (
			<ScrollView style={styles.tabs} horizontal>
				{categories.map((e, index) => {
					const active = index == activeTab;
					return (
						<TouchableOpacity
							style={styles.tab}
							activeOpacity={0.6}
							onPress={() => this.setState({ activeTab: index })}
						>
							<Text style={[styles.tabTitle, active && styles.activeTab]}>{e.title}</Text>
							{active && <View style={styles.tabActive} />}
						</TouchableOpacity>
					);
				})}
			</ScrollView>
		);
	}

	renderCategories = () => {
		const { activeTab } = this.state;
		const categories = test;
		const tabCategory = categories[activeTab];

		return this.renderCategory(tabCategory.categories[0]);
	};

	renderCategory = category => {
		const { activeTab } = this.state;
		const { apps } = category;
		return (
			<View style={styles.category}>
				{apps &&
					apps.map((e, index) => {
						const photo = photos[(activeTab * 3 + index) % photos.length];
						return (
							<TouchableOpacity style={styles.app} activeOpacity={0.6} onPress={() => this.showApp(e)}>
								<Image source={{ uri: photo }} style={styles.icon} />
								<Text numberOfLines={2} style={{ textAlign: 'center', color: colors.grey }}>
									{'Awesome product name and brief description'}
								</Text>
								<Text
									numberOfLines={1}
									style={{ textAlign: 'center', marginTop: 5, color: '#f84880', fontWeight: 'bold' }}
								>
									{'$89'}
								</Text>
								<Text
									numberOfLines={1}
									style={{
										textAlign: 'center',
										textDecorationLine: 'line-through',
										color: colors.grey500
									}}
								>
									{'$99'}
								</Text>
							</TouchableOpacity>
						);
					})}
			</View>
		);
	};

	render() {
		const { query } = this.state;
		return (
			<View style={{ flex: 1, backgroundColor: '#748cfb' }}>
				{this.renderNavBar()}
				<Search value={query} onChange={() => {}} onSearch={() => {}} />
				<ScrollView style={styles.categories} nestedScrollEnabled>
					<View style={{ paddingTop: 30, paddingBottom: 40 }}>
						{this.renderCategoryTabs()}
						{this.renderCategories()}
					</View>
				</ScrollView>
			</View>
		);
	}
}

export default MarketSellerOverview;
