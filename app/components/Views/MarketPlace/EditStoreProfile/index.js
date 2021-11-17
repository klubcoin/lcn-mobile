import React, { Component, PureComponent } from 'react';
import {
	KeyboardAvoidingView,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
	SafeAreaView,
	Text,
	Slider,
	Modal
} from 'react-native';
import { action, makeObservable, observable, ObservableMap } from 'mobx';
import preferences from '../../../../store/preferences';
import { getOnboardingNavbarOptions } from '../../../UI/Navbar';
import RemoteImage from '../../../Base/RemoteImage';
import drawables from '../../../../common/drawables';
import * as RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-crop-picker';
import { colors, fontStyles } from '../../../../styles/common';
import OnboardingProgress from '../../../UI/OnboardingProgress';
import { CHOOSE_PASSWORD_STEPS } from '../../../../constants/onboarding';
import { ONBOARDING, PREVIOUS_SCREEN } from '../../../../constants/navigation';
import StyledButton from '../../../UI/StyledButton';
import { strings } from '../../../../../locales/i18n';
import { TextInput } from 'react-native-gesture-handler';
import Device from '../../../../util/Device';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import styles from './styles/index';
import { OutlinedTextField } from 'react-native-material-textfield';
import { inject, observer } from 'mobx-react';
import store from '../store';
import validator from 'validator';
import SelectComponent from '../../../UI/SelectComponent';
import Engine from '../../../../core/Engine';
import contractMap from '@metamask/contract-metadata';
import TokenImage from '../../../UI/TokenImage';
import AssetList from '../../../UI/AssetList';

const showNotice = (message, type) => {
	Toast.show({
		type: type || 'error',
		text1: message,
		text2: strings('profile.notice'),
		visibilityTime: 1000
	});
};

class EditStoreProfile extends Component {
	logoStore = '';
	storeName = '';
	phone = '';
	email = '';
	about = '';
	orderPayment = 1;
	deliveryPayment = 0;
	isChangedAvatar = false;
	tokenOpts = [];
	defaultCurrency = {};
	selectingToken = false;

	constructor(props) {
		super(props);
		makeObservable(this, {
			logoStore: observable,
			storeName: observable,
			phone: observable,
			email: observable,
			about: observable,
			orderPayment: observable,
			deliveryPayment: observable,
			isChangedAvatar: observable,
			tokenOpts: observable,
			defaultCurrency: observable,
			selectingToken: observable
		});
	}

	componentDidMount() {
		this.fetchStoreProfile();
	}

	fetchStoreProfile = async () => {
		await store.load();
		this.profile = store.storeProfile;
		this.updateInfo();
		this.updateTokenOpts();
	};

	updateTokenOpts = async () => {
		const savedApps = await preferences.getSavedAppList();
		const savedAppAddresses = savedApps.map(e => e.address);
		const userTokens =
			Engine.state.AssetsController.tokens?.filter(e => !savedAppAddresses.includes(e.address.toLowerCase())) ||
			[];

		this.tokenOpts = userTokens.map(e => contractMap[e.address]) || [];
	};

	updateInfo = () => {
		const {
			storeName,
			phone,
			email,
			about,
			logoStore,
			orderPayment,
			deliveryPayment,
			defaultCurrency
		} = this.profile;

		this.storeName = storeName;
		this.storeNameRef.setValue(storeName);

		this.phone = phone;
		this.phoneRef.setValue(phone);

		this.email = email;
		this.emailRef.setValue(email);

		this.about = about;
		this.aboutRef.setValue(about);

		this.orderPayment = orderPayment ?? 0.5;
		this.orderPaymentRef.setValue((this.orderPayment * 100).toFixed(0));

		this.deliveryPayment = deliveryPayment ?? 0.5;
		this.deliveryPaymentRef.setValue((this.deliveryPayment * 100).toFixed(0));

		this.logoStore = logoStore;
		this.defaultCurrency = defaultCurrency;
	};

	onPickImage() {
		ImagePicker.openPicker({
			width: 300,
			height: 300,
			cropping: true
		}).then(image => {
			this.logoStore = image.path;
			this.isChangedAvatar = true;
		});
	}

	onUpdate = async () => {
		const storeName = this.storeName?.trim() || '';
		const phone = this.phone?.trim();
		const email = this.email?.trim();
		const about = this.about;
		const orderPayment = this.orderPayment;
		const deliveryPayment = this.deliveryPayment;
		const defaultCurrency = this.defaultCurrency;

		var isValid = this.isDataValid();
		if (!isValid) return;

		var fileName = '';
		if (this.logoStore.length > 0) fileName = this.logoStore.substring(this.logoStore.lastIndexOf('/') + 1);

		const path = `${RNFS.DocumentDirectoryPath}/${fileName || 'logo_store.png'}`;

		if ((await RNFS.exists(path)) && this.isChangedAvatar) await RNFS.unlink(path); //remove existing file
		await RNFS.moveFile(this.logoStore, path); // copy temporary file to persist

		this.isChangedAvatar = false;
		store
			.saveProfile({
				storeName,
				logoStore: path,
				phone,
				email,
				about,
				orderPayment,
				deliveryPayment,
				defaultCurrency
			})
			.then(value => showNotice(strings('market.update_success'), 'success'));
	};

	isDataValid() {
		const storeName = this.storeName?.trim() || '';
		const phone = this.phone?.trim();
		const email = this.email?.trim();
		const about = this.about?.trim();

		if (!this.logoStore) {
			showNotice(strings('market.missing_logo'));
			return;
		}
		if (!storeName) {
			showNotice(strings('market.missing_store_name'));
			return;
		}
		if (!about) {
			showNotice(strings('market.missing_description'));
			return;
		}
		if (!phone) {
			showNotice(strings('market.missing_phone'));
			return;
		}
		if (!validator.isMobilePhone(phone)) {
			showNotice(strings('market.invalid_phone'));
			return;
		}
		if (!email) {
			showNotice(strings('market.missing_email'));
			return;
		}
		if (!validator.isEmail(email)) {
			showNotice(strings('market.invalid_email'));
			return;
		}
		if (!this.defaultCurrency || Object.keys(this.defaultCurrency).length <= 0) {
			showNotice(strings('market.invalid_currency'));
			return;
		}

		return true;
	}

	onBack = () => {
		this.props.navigation.goBack();
	};

	onChangeSlider = value => {
		this.orderPayment = parseFloat((1 - value).toFixed(2));
		this.deliveryPayment = parseFloat(value.toFixed(2));

		this.orderPaymentRef.setValue((this.orderPayment * 100).toFixed(0));
		this.deliveryPaymentRef.setValue((this.deliveryPayment * 100).toFixed(0));
	};

	selectToken = value => {
		this.defaultCurrency = value;
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'arrow-left'} size={RFValue(15)} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{strings('market.edit_store_profile')}</Text>
				</View>
			</SafeAreaView>
		);
	}

	render() {
		return (
			<KeyboardAvoidingView style={styles.container} behavior={'padding'} enabled={Device.isIos()}>
				<ScrollView>
					{this.renderNavBar()}
					<View style={styles.body}>
						<TouchableOpacity
							activeOpacity={0.5}
							style={styles.avatarView}
							onPress={() => this.onPickImage()}
						>
							<RemoteImage source={{ uri: this.logoStore || drawables.noImage }} style={styles.avatar} />
						</TouchableOpacity>

						<View style={styles.form}>
							<OutlinedTextField
								ref={ref => (this.aboutRef = ref)}
								placeholder={strings('market.desc_placeholder')}
								returnKeyType="next"
								label={strings('market.about')}
								onChangeText={text => (this.about = text)}
								value={this.about}
								labelOffset={{ y1: -4 }}
								baseColor={colors.grey500}
								tintColor={colors.blue}
								multiline
								scrollEnabled={true}
								style={styles.outline}
								containerStyle={[styles.containerOutline, styles.input]}
								inputContainerStyle={styles.inputOutline}
							/>
							<OutlinedTextField
								ref={ref => (this.storeNameRef = ref)}
								placeholder={strings('market.store_name_placeholder')}
								returnKeyType="next"
								label={strings('market.store_name')}
								onChangeText={text => (this.storeName = text)}
								value={this.storeName}
								baseColor={colors.grey500}
								tintColor={colors.blue}
								containerStyle={styles.input}
							/>
							<OutlinedTextField
								ref={ref => (this.phoneRef = ref)}
								placeholder={strings('market.phone_placeholder')}
								returnKeyType="next"
								onChangeText={text => (this.phone = text)}
								value={this.phone}
								label={strings('market.phone')}
								keyboardType="phone-pad"
								baseColor={colors.grey500}
								tintColor={colors.blue}
								containerStyle={styles.input}
							/>
							<OutlinedTextField
								ref={ref => (this.emailRef = ref)}
								placeholder={strings('market.email_placeholder')}
								returnKeyType="next"
								label={strings('market.email')}
								onChangeText={text => (this.email = text)}
								value={this.email}
								keyboardType="email-address"
								baseColor={colors.grey500}
								tintColor={colors.blue}
								containerStyle={styles.input}
							/>

							<View style={styles.section}>
								<Text style={styles.header}>{strings('market.default_currency')}</Text>
								<Text style={styles.explainText}>{strings('market.default_currency_explain')}</Text>
								<TouchableOpacity
									onPress={() => (this.selectingToken = !this.selectingToken)}
									style={[styles.optionButton, this.selectingToken && styles.selected]}
								>
									<Text style={styles.optionLabel} numberOfLines={1}>
										{this.defaultCurrency?.symbol || strings('market.default_currency_holder')}
									</Text>
									<Icon
										name={`chevron-${this.selectingToken ? 'up' : 'down'}`}
										size={RFPercentage(2)}
									/>
								</TouchableOpacity>
								{this.selectingToken && (
									<View style={{ maxHeight: 300 }}>
										<AssetList
											searchResults={this.tokenOpts}
											handleSelectAsset={this.selectToken}
											selectedAsset={this.defaultCurrency}
											searchQuery={''}
											isHideLabel={true}
										/>
									</View>
								)}
							</View>

							<Text style={styles.header}>{strings('market.payment_term')}</Text>
							<Text style={styles.explainText}>{strings('market.payment_explain')}</Text>
							<View style={styles.paymentSection}>
								<OutlinedTextField
									disabled
									ref={ref => (this.orderPaymentRef = ref)}
									placeholder={strings('market.percentage')}
									label={strings('market.first_payment')}
									value={this.orderPayment * 100}
									baseColor={colors.black}
									containerStyle={styles.orderPayment}
									keyboardType="phone-pad"
									suffix={'%'}
								/>
								<OutlinedTextField
									disabled
									ref={ref => (this.deliveryPaymentRef = ref)}
									placeholder={strings('market.percentage')}
									label={strings('market.second_payment')}
									value={this.deliveryPayment * 100}
									baseColor={colors.black}
									containerStyle={styles.deliveryPayment}
									keyboardType="phone-pad"
									suffix={'%'}
								/>
							</View>

							<Slider
								style={{ height: 40 }}
								minimumValue={0}
								maximumValue={1}
								minimumTrackTintColor={colors.primaryFox}
								maximumTrackTintColor={colors.black}
								value={this.deliveryPayment}
								onValueChange={this.onChangeSlider}
							/>
						</View>

						<StyledButton type={'confirm'} onPress={this.onUpdate} containerStyle={styles.next}>
							{strings('market.update')}
						</StyledButton>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		);
	}
}

export default inject('store')(observer(EditStoreProfile));
