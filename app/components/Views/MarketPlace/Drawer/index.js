import React, { Component } from 'react';
import { Text, View, FlatList, TouchableOpacity } from 'react-native';
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
import store from '../store';

export const menuKeys = () => ({
	home: 'home',
	shopping: 'buyer',
	store: 'seller'
});

const menuItems = () => [
	{
		key: 'home',
		title: strings('market.home'),
		icon: 'home',
		screen: 'WalletView'
	},
	{
		key: 'buyer',
		title: strings('market.shopping'),
		icon: 'cart',
		screen: 'MarketPlace'
	},
	{
		key: 'seller',
		title: strings('market.my_store'),
		icon: 'widgets-outline',
		screen: 'MarketSeller'
	}
];

const menuSettings = {
	key: 'settings',
	title: strings('drawer.settings'),
	icon: 'cog',
	screen: 'Settings'
};

export class MarketDrawer extends Component {
	toggleDrawer = () => {
		this.props.navigation.toggleDrawer();
	};

	openMenu(item) {
		const { key, screen } = item;
		const { navigation } = this.props;

		this.toggleDrawer();
		if (key == store.marketMenuKey) return;

		store.marketMenuKey = key;
		navigation.navigate(screen);
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

		return (
			<View style={styles.root}>
				<View style={styles.body}>
					<SafeAreaView>
						<Button onPress={this.toggleDrawer}>
							<Icon name={'close'} size={25} color={colors.orange} style={styles.close} />
						</Button>
					</SafeAreaView>
					<View style={styles.profile}>
						<Identicon diameter={48} address={selectedAddress} />
						<Text style={styles.name}>{account?.name}</Text>
						{account && <EthereumAddress type={'short'} address={account.address} style={styles.address} />}
					</View>
					<FlatList
						data={menuItems()}
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
