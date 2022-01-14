import React, { Component } from 'react';
import { Text, View, FlatList, TouchableOpacity } from 'react-native';
import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { SafeAreaView } from 'react-native-safe-area-context';
import Button from 'react-native-button';
import Identicon from '../../../UI/Identicon';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import { colors } from '../../../../styles/common';
import Engine from '../../../../core/Engine';
import EthereumAddress from '../../../UI/EthereumAddress';
import { strings } from '../../../../../locales/i18n';
import styles from './styles';
import store from '../../MarketPlace/store';
import RemoteImage from '../../../Base/RemoteImage';
import preferences from '../../../../store/preferences';

export const menuKeys = () => ({
	home: 'home',
	shopping: 'buyer',
	store: 'seller',
	orders: 'orders',
	shippingInfo: 'shippingInfo',
	messages: 'messages',
	profile: 'profile',
	reviews: 'reviews',
	settings: 'settings',
});

const menuItems = () => [
	{
		key: menuKeys().home,
		title: strings('market.home'),
		icon: 'home',
		screen: 'Dashboard'
	},
	{
		key: menuKeys().shopping,
		title: strings('market.shopping'),
		icon: 'cart',
		screen: 'MarketPlaceSearch'
	},
	{
		key: menuKeys().store,
		title: strings('market.my_store'),
		icon: 'widgets-outline',
		screen: 'MarketSeller'
	},
	{
		key: menuKeys().shippingInfo,
		title: strings('market.shipping_info'),
		icon: 'truck-delivery-outline',
		screen: 'ShippingInfo'
	},
	{
		key: menuKeys().orders,
		title: strings('market.my_orders'),
		icon: 'inbox-full',
		screen: 'PurchasedOrders'
	},
	{
		key: menuKeys().messages,
		title: strings('market.messages'),
		icon: 'chat',
		screen: 'MarketMessages'
	}
];

const menuItemsVendor = () => [
	{
		key: menuKeys().home,
		title: strings('market.home'),
		icon: 'home',
		screen: 'Dashboard'
	},
	{
		key: menuKeys().shopping,
		title: strings('market.shopping'),
		icon: 'cart',
		screen: 'MarketPlaceSearch'
	},
	{
		key: menuKeys().store,
		title: strings('market.my_store'),
		icon: 'widgets-outline',
		screen: 'MarketSeller'
	},
	{
		key: menuKeys().orders,
		title: strings('market.orders'),
		icon: 'inbox-full',
		screen: 'VendorOrders'
	},
	{
		key: menuKeys().messages,
		title: strings('market.messages'),
		icon: 'chat',
		screen: 'MarketMessages'
	},
	{
		key: menuKeys().profile,
		title: strings('market.store_profile'),
		icon: 'account',
		screen: 'StoreProfile'
	},
	{
		key: menuKeys().reviews,
		title: strings('market.store_reviews'),
		icon: 'store',
		screen: 'StoreReviews'
	}
];

const menuSettings = {
	key: menuKeys().settings,
	title: strings('drawer.settings'),
	icon: 'cog',
	screen: 'Settings'
};

const Roles = {
	customer: 'customer',
	vendor: 'vendor',
}

export class MarketDrawer extends Component {
	role = Roles.customer;

	constructor(props) {
		super(props)
		makeObservable(this, {
			role: observable,
		})
	}

	toggleDrawer = () => {
		this.props.navigation.toggleDrawer();
	};

	openMenu(item) {
		const { key, screen } = item;
		const { navigation } = this.props;

		this.toggleDrawer();
		if (key == store.marketMenuKey) return;

		if (key != menuKeys().settings) store.marketMenuKey = key;

		if (key == menuKeys().shopping) {
			this.role = Roles.customer;
		} else if (key == menuKeys().store) {
			this.role = Roles.vendor;
		}
		navigation.navigate(screen, { drawer: true });
	}

	renderItem({ item }) {
		const { key, icon, title } = item;
		const selected = key == store.marketMenuKey;
		const backgroundColor = selected ? '#FEEFF0' : null;

		return (
			<TouchableOpacity
				style={[styles.menuItem, { backgroundColor }]}
				activeOpacity={0.8}
				onPress={() => this.openMenu(item)}
				testID={`drawer-menu-item-${item.key}`}
				accessibilityLabel={`drawer-menu-item-${item.key}`}
			>
				<Icon name={icon} size={25} color={selected ? colors.orange : colors.grey200} />
				<Text style={styles.menuTitle}>{title}</Text>
				<Icon
					size={22}
					name={selected ? 'chevron-left' : 'chevron-right'}
					color={selected ? colors.orange : colors.grey300}
				/>
			</TouchableOpacity>
		);
	}

	renderFooter() {
		const { icon, title } = menuSettings;

		return (
			<View style={styles.footer}>
				<TouchableOpacity
					style={styles.setting}
					activeOpacity={0.6}
					onPress={() => this.openMenu(menuSettings)}
					testID={'drawer-menu-item-settings'}
					accessibilityLabel={'drawer-menu-item-settings'}
				>
					<Icon name={icon} size={25} color={colors.grey200} />
					<Text style={styles.settingText}>{title}</Text>
				</TouchableOpacity>
			</View>
		);
	}

	render() {
		const { PreferencesController } = Engine.state;
		const { identities, selectedAddress } = PreferencesController;
		const account = identities[selectedAddress];
		const { avatar, firstname, lastname } = preferences.onboardProfile || {};
		const name = `${firstname} ${lastname}`.trim();

		return (
			<View style={styles.root}>
				<View style={styles.body}>
					<SafeAreaView />
					<Button onPress={this.toggleDrawer}
						testID={'drawer-close'}
						accessibilityLabel={'drawer-close'}
					>
						<Icon name={'close'} size={25} color={colors.orange} style={styles.close} />
					</Button>
					<View style={styles.profile}>
						{!!avatar
							? <RemoteImage source={{ uri: `file://${avatar}` }} style={styles.avatar} />
							: <Identicon diameter={48} address={selectedAddress} />
						}
						<Text style={styles.name}>{name || account?.name?.name || account?.name}</Text>
						{account && <EthereumAddress type={'short'} address={account.address} style={styles.address} />}
					</View>
					<FlatList
						data={this.role == Roles.customer ? menuItems() : menuItemsVendor()}
						keyExtractor={item => item.key}
						renderItem={this.renderItem.bind(this)}
						style={{ marginTop: 40 }}
					/>
					{this.renderFooter()}
				</View>
			</View>
		);
	}
}

export default inject('store')(observer(MarketDrawer));
