import React, { PureComponent } from 'react';
import {
	KeyboardAvoidingView,
	ScrollView,
	TouchableOpacity,
	View,
	Image,
	Text,
	SafeAreaView,
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import drawables from '../../../../common/drawables';
import { strings } from '../../../../../locales/i18n';
import Device from '../../../../util/Device';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import styles from './styles/index';
import store from '../../MarketPlace/store';
import AssetIcon from '../../../UI/AssetIcon';
import routes from '../../../../common/routes';
import NetworkMainAssetLogo from '../../../UI/NetworkMainAssetLogo';

class StoreProfile extends PureComponent {
	profile = {};

	constructor(props) {
		super(props);
		makeObservable(this, {
			profile: observable
		});
	}

	toggleDrawer = () => {
		this.props.navigation.toggleDrawer();
	};

	onEdit = () => {
		this.props.navigation.navigate('EditStoreProfile');
	};

	fetchStoreProfile = async () => {
		await store.load();
		this.profile = store.storeProfile;
	};

	componentDidMount() {
		this.fetchStoreProfile();
		this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
			this.fetchStoreProfile();
		});
	}

	componentWillUnmount() {
		if (this.willFocusSubscription) this.willFocusSubscription.remove();
	}

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.toggleDrawer.bind(this)} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'bars'} size={RFValue(15)} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{strings('market.store_profile')}</Text>
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	render() {
		const {
			logoStore,
			storeName,
			about,
			phone,
			email,
			orderPayment,
			deliveryPayment,
			defaultCurrency,
			coords,
		} = this.profile;

		return (
			<KeyboardAvoidingView style={styles.container} behavior={'padding'} enabled={Device.isIos()}>
				{this.renderNavBar()}
				<View style={styles.topBody} />
				<View>
					<ScrollView>
						<View style={styles.body}>
							<TouchableOpacity onPress={this.onEdit} style={styles.editIcon}>
								<Icon name={'edit'} size={RFPercentage(2)} />
							</TouchableOpacity>
							<Text style={styles.storeName}>{storeName}</Text>
							<View style={styles.content}>
								<Text style={styles.header}>{strings('market.about')}</Text>
								<Text style={styles.desc}>{about || 'No description'}</Text>
								<Text style={styles.header}>{strings('market.contacts')}</Text>
								<Text style={styles.contact}>
									{strings('market.phone')}: {phone || 'No phone'}
								</Text>
								<Text style={[styles.contact, styles.desc]}>
									{strings('market.email')}: {email || 'No email'}
								</Text>
								<Text style={styles.header}>{strings('market.store_location')}</Text>
								<Text style={styles.location}>
									{strings('market.coordinate')}: {coords ? `${coords.latitude}, ${coords.longitude}` : ''}
								</Text>
								<Text style={styles.header}>{strings('market.payment_term')}</Text>
								<Text style={styles.contact}>
									{strings('market.first_payment') + ': '}
									{((orderPayment ?? 0) * 100).toFixed(0)}%
								</Text>
								<Text style={[styles.contact, styles.desc]}>
									{strings('market.second_payment') + ': '}
									{((deliveryPayment ?? 0) * 100).toFixed(0)}%
								</Text>
								<Text style={styles.header}>{strings('market.default_currency')}</Text>
								{defaultCurrency && (
									<View style={styles.tokenRow}>
										{defaultCurrency?.name === routes.mainNetWork.name ? (
											<NetworkMainAssetLogo style={styles.tokenLogo} />
										) : (
											<AssetIcon logo={defaultCurrency?.logo} customStyle={styles.tokenLogo} />
										)}
										<Text style={[styles.desc, styles.tokenName]}>
											{defaultCurrency?.symbol + ' '}({defaultCurrency?.name})
										</Text>
									</View>
								)}
							</View>
						</View>
					</ScrollView>
					<Image source={{ uri: 'file://' + logoStore || drawables.noImage }} style={styles.logo} resizeMode={'cover'} />
				</View>
			</KeyboardAvoidingView>
		);
	}
}

export default inject('store')(observer(StoreProfile));
