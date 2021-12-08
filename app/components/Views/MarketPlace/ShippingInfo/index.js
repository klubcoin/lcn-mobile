import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react';
import {
	View,
	Text,
	KeyboardAvoidingView,
	ScrollView,
	TouchableOpacity,
	TextInput
} from 'react-native';
import { strings } from '../../../../../locales/i18n';
import { colors } from '../../../../styles/common';
import Device from '../../../../util/Device';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import StyledButton from '../../../UI/StyledButton';
import styles from './styles';
import store from '../store';
import { showError, showSuccess } from '../../../../util/notify';
import Engine from '../../../../core/Engine';
import CryptoSignature from '../../../../core/CryptoSignature';
import APIService from '../../../../services/APIService';
import Api from '../../../../services/api';
import Routes from '../../../../common/routes';
import preferences from '../../../../store/preferences';
import Geolocation from '@react-native-community/geolocation';

export class ShippingInfo extends PureComponent {
	static navigationOptions = () => ({ header: null });

	account = '';
	name = '';
	shippingAddress = {};
	processing = false;
	coords = null;

	constructor(props) {
		super(props);
		makeObservable(this, {
			account: observable,
			name: observable,
			shippingAddress: observable,
			coords: observable,
			processing: observable,
		});

		const { name, phone } = store.shippingInfo || {};
		this.name = name || '';
	}

	componentDidMount() {
		this.initFieldsData();
	}

	async initFieldsData() {
		const { identities } = Engine.state.PreferencesController;
		const { selectedAddress } = Engine.state.PreferencesController;
		this.account = identities[selectedAddress];

		const { name } = this.account || {};
		this.name = name;
		const profileOnboard = await preferences.getOnboardProfile();
		const { publicInfo } = profileOnboard;
		const { shippingAddress, coords } = publicInfo || {};

		this.shippingAddress.phone = shippingAddress.phone || '';
		this.shippingAddress.address = shippingAddress.address || '';
		this.shippingAddress.street = shippingAddress.street || '';
		this.shippingAddress.zipCode = shippingAddress.zipCode || '';
		this.shippingAddress.city = shippingAddress.city || '';
		this.shippingAddress.country = shippingAddress.country || ''
		this.coords = coords || null;
	}

	onBack = () => {
		this.props.navigation.goBack();
	};

	onSave() {
		const { phone, address, street, zipCode, city, country } = this.shippingAddress;

		if (!this.name) {
			return showError(strings('market.missing_name'));
		}
		if (!phone) {
			return showError(strings('market.missing_phone'));
		}
		if (!/^(\+\d{1,2}\s)?\(?\d{3}\)?[\s.-]?\d{3}[\s.-]?\d{4}$/.test(phone)) {
			return showError(strings('market.invalid_phone'));
		}
		if (!address) {
			return showError(strings('market.missing_address'));
		}
		if (!street) {
			return showError(strings('market.missing_street'));
		}
		if (!zipCode) {
			return showError(strings('market.missing_zip_code'));
		}
		if (!city) {
			return showError(strings('market.missing_city'));
		}
		if (!country) {
			return showError(strings('market.missing_country'));
		}
		this.updateShippingInfo();
	}

	updateShippingInfo = async () => {
		const { identities } = Engine.state.PreferencesController;
		const { selectedAddress } = Engine.state.PreferencesController;
		const account = identities[selectedAddress];
		const shippingAddress = { shippingAddress: this.shippingAddress, coords: this.coords };
		const addressString = JSON.stringify(shippingAddress);
		const signature = await CryptoSignature.signMessage(selectedAddress, addressString);
		const params = [account.name, selectedAddress, addressString, signature];

		Api.postRequest(
			Routes.walletUpdate,
			params,
			response => {
				if (response.error) {
					alert(`${response.error.message}`);
				} else {
					const { phone, address, street, zipCode, city, country } = this.shippingAddress || {};
					store.shippingInfo = {
						name: account.name,
						phone,
						address: `${address}, ${street}, ${city} ${zipCode}, ${country}`,
						coords: this.coords,
					}
					store.setShippingInfo(store.shippingInfo);
					showSuccess(strings('market.saved_successfully'));
					this.onBack();
					preferences.getOnboardProfile()
						.then(value => preferences.setOnboardProfile(Object.assign(value, { publicInfo: shippingAddress })))
				}
			},
			error => {
				alert(`${error.toString()}`);
			}
		);
	};

	getCurrentLocation() {
		if (this.readingGPS) return;
		this.readingGPS = true;

		Geolocation.getCurrentPosition(
			info => {
				this.readingGPS = false;
				const { latitude, longitude } = info.coords;
				this.coords = { latitude, longitude };
			},
			err => {
				this.readingGPS = false;
				alert(err.message);
			},
		);
	}

	onCancel() {
		this.onBack();
	}

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack.bind(this)} style={styles.navButton}>
						<Icon name={'arrow-left'} size={16} style={styles.backIcon} color={colors.white} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{strings('market.shipping_info')}</Text>
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	render() {
		return (
			<KeyboardAvoidingView style={styles.root} behavior={'padding'} enabled={Device.isIos()}>
				{this.renderNavBar()}
				<ScrollView contentContainerStyle={styles.scroll}>
					<Text style={styles.desc}>{strings('market.shipping_info_desc')}</Text>

					<Text style={styles.heading}>{strings('market.name')}</Text>
					<TextInput
						editable={false}
						style={styles.input}
						value={this.name}
						onChangeText={text => (this.name = text)}
					/>

					<Text style={styles.heading}>{strings('market.phone')}</Text>
					<TextInput
						value={this.shippingAddress.phone}
						onChangeText={text => (this.shippingAddress.phone = text)}
						style={styles.input}
						keyboardType={'numeric'}
					/>

					<Text style={styles.heading}>{strings('market.address_name')}</Text>
					<TextInput
						numberOfLines={1}
						value={this.shippingAddress.address}
						onChangeText={text => (this.shippingAddress.address = text)}
						style={styles.input}
					/>

					<Text style={styles.heading}>{strings('market.street')}</Text>
					<TextInput
						numberOfLines={1}
						value={this.shippingAddress.street}
						onChangeText={text => (this.shippingAddress.street = text)}
						style={styles.input}
					/>

					<Text style={styles.heading}>{strings('market.zip_code')}</Text>
					<TextInput
						numberOfLines={1}
						value={this.shippingAddress.zipCode}
						onChangeText={text => (this.shippingAddress.zipCode = text)}
						style={styles.input}
						keyboardType={'numeric'}
					/>

					<Text style={styles.heading}>{strings('payQR.city')}</Text>
					<TextInput
						numberOfLines={1}
						value={this.shippingAddress.city}
						onChangeText={text => (this.shippingAddress.city = text)}
						style={styles.input}
					/>

					<Text style={styles.heading}>{strings('payQR.country')}</Text>
					<TextInput
						numberOfLines={1}
						value={this.shippingAddress.country}
						onChangeText={text => (this.shippingAddress.country = text)}
						style={styles.input}
					/>

					<Text style={styles.heading}>{strings('market.coordinate')}</Text>
					<View style={styles.location}>
						<TouchableOpacity activeOpacity={0.6} onPress={() => this.getCurrentLocation()}>
							<Icon name={'map-marker-alt'} size={22} />
						</TouchableOpacity>
						<Text style={styles.coords}>{this.coords ? `${this.coords.latitude}, ${this.coords.longitude}` : ''}</Text>
					</View>

					<View style={styles.buttons}>
						<StyledButton
							type={'confirm'}
							containerStyle={styles.save}
							onPress={this.onSave.bind(this)}
						>
							{strings('market.save')}
						</StyledButton>

						<StyledButton
							type={'normal'}
							containerStyle={styles.cancel}
							onPress={this.onCancel.bind(this)}
						>
							{strings('market.cancel')}
						</StyledButton>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		);
	}
}

export default inject('store')(observer(ShippingInfo));
