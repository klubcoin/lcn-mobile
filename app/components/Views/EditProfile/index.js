import React, { PureComponent } from 'react';
import {
	KeyboardAvoidingView,
	ScrollView,
	TouchableOpacity,
	View,
	Text,
	Modal,
	Platform,
	PermissionsAndroid
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import preferences from '../../../store/preferences';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import RemoteImage from '../../Base/RemoteImage';
import drawables from '../../../common/drawables';
import * as RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-crop-picker';
import StyledButton from '../../UI/StyledButton';
import { strings } from '../../../../locales/i18n';
import Device from '../../../util/Device';
import Toast from 'react-native-toast-message';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';
import TextField from '../../UI/TextField';
import PhoneTextField from '../../UI/PhoneTextField';
import CountrySearchModal from '../../UI/CountrySearchModal';
import validator from 'validator';
import { showError, showSuccess } from '../../../util/notify';
import Api from '../../../services/api';
import routes from '../../../common/routes';
import Engine from '../../../core/Engine';
import * as sha3JS from 'js-sha3';
import { setOnboardProfile } from '../../../actions/user';
import { renderAccountName } from '../../../util/address';
import { allCountries } from 'country-telephone-data';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import emojiRegex from 'emoji-regex';

class EditProfile extends PureComponent {
	static navigationOptions = ({ navigation }) =>
		getNavigationOptionsTitle(strings('wallet.edit_profile'), navigation);

	avatar = '';
	username = '';
	firstname = '';
	lastname = '';
	email = '';
	phone = '';
	isLoading = false;
	isViewModal = false;
	showCountryCodePicker = false;
	countryCode = '';
	notiPermissionCamera = false;
	notiMessage = '';
	regex = emojiRegex();

	constructor(props) {
		super(props);
		makeObservable(this, {
			avatar: observable,
			username: observable,
			firstname: observable,
			lastname: observable,
			email: observable,
			phone: observable,
			isLoading: observable,
			isViewModal: observable,
			showCountryCodePicker: observable,
			countryCode: observable,
			notiPermissionCamera: observable,
			notiMessage: observable
		});
	}

	componentDidMount() {
		const { selectedAddress } = Engine.state.PreferencesController;
		const { identities } = Engine.state.PreferencesController;
		const { avatar, firstname, lastname, email, phone } = preferences?.onboardProfile ?? {};
		this.username = renderAccountName(selectedAddress, identities);
		this.avatar = avatar;
		this.firstname = firstname;
		this.lastname = lastname;
		this.email = email;
		this.countryCode = phone?.replace('+', '').split('-')[0];
		this.phone = phone
			?.replace('+', '')
			.split('-')
			.slice(1, phone?.split('-').length)
			.join('-');
	}

	onPickImage() {
		if (Platform.OS === 'android') {
			PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(res => {
				if (!res) {
					PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(granted => {
						if (granted === PermissionsAndroid.RESULTS.GRANTED) {
							ImagePicker.openPicker({
								width: 300,
								height: 300,
								cropping: true
							})
								.then(image => {
									this.isViewModal = false;
									this.avatar = image.path;
								})
								.catch(err => {
									this.notiMessage = strings('profile.grant_permission_gallery_notification');
									PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(
										res => {
											this.isViewModal = false;
											this.notiPermissionCamera = !res;
										}
									);
								});
						} else {
							this.notiMessage = strings('profile.grant_permission_gallery_notification');
							this.isViewModal = false;
							this.notiPermissionCamera = !res;
						}
					});
				} else {
					ImagePicker.openPicker({
						width: 300,
						height: 300,
						cropping: true
					})
						.then(image => {
							this.isViewModal = false;
							this.avatar = image.path;
						})
						.catch(err => {
							this.notiMessage = strings('profile.grant_permission_gallery_notification');
							PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(res => {
								this.isViewModal = false;
								this.notiPermissionCamera = !res;
							});
						});
				}
			});
		}
		if (Platform.OS === 'ios') {
			ImagePicker.openPicker({
				width: 300,
				height: 300,
				cropping: true
			})
				.then(image => {
					this.isViewModal = false;
					this.avatar = image.path;
				})
				.catch(err => {
					this.notiMessage = strings('profile.grant_permission_gallery_notification');
					check(PERMISSIONS.IOS.PHOTO_LIBRARY)
						.then(result => {
							switch (result) {
								case RESULTS.UNAVAILABLE:
									break;
								case RESULTS.DENIED:
									this.isViewModal = false;
									this.notiPermissionCamera = true;
									break;
								case RESULTS.LIMITED:
									break;
								case RESULTS.GRANTED:
									break;
								case RESULTS.BLOCKED:
									this.isViewModal = false;
									this.notiPermissionCamera = true;
									break;
							}
						})
						.catch(error => {
							// …
						});
				});
		}
	}

	onTakePicture() {
		ImagePicker.openCamera({
			width: 300,
			height: 300,
			cropping: true
		})
			.then(image => {
				this.isViewModal = false;
				this.avatar = image.path;
			})
			.catch(err => {
				this.notiMessage = strings('profile.grant_permission_camera_notification');
				if (Platform.OS === 'android') {
					PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA).then(res => {
						this.isViewModal = false;
						this.notiPermissionCamera = !res;
					});
				}
				if (Platform.OS === 'ios') {
					check(PERMISSIONS.IOS.CAMERA)
						.then(result => {
							switch (result) {
								case RESULTS.UNAVAILABLE:
									break;
								case RESULTS.DENIED:
									this.isViewModal = false;
									this.notiPermissionCamera = true;
									break;
								case RESULTS.LIMITED:
									break;
								case RESULTS.GRANTED:
									break;
								case RESULTS.BLOCKED:
									this.isViewModal = false;
									this.notiPermissionCamera = true;
									break;
							}
						})
						.catch(error => {
							// …
						});
				}
			});
	}

	onOpenModal() {
		this.isViewModal = true;
	}

	showNotice(message) {
		Toast.show({
			type: 'error',
			text1: message,
			text2: strings('profile.notice'),
			visibilityTime: 1000
		});
	}

	isDataValid() {
		const firstname = this.firstname?.trim();
		const lastname = this.lastname?.trim();
		const email = this.email?.trim();
		const phone = this.phone?.trim();

		if (!this.avatar) {
			showError(strings('profile.missing_photo'));
			return;
		}
		if (!firstname) {
			showError(strings('profile.missing_name'));
			return;
		}
		if (!lastname) {
			showError(strings('profile.missing_surname'));
			return;
		}
		if (!email) {
			showError(strings('profile.missing_email'));
			return;
		}
		if (!validator.isEmail(email)) {
			showError(strings('profile.invalid_email'));
			return;
		}
		// if (!phone) {
		// 	showError(strings('profile.missing_phone'));
		// 	return;
		// }
		if (phone && (!/^[\d]{10}$/.test(phone) || !this.countryCode)) {
			showError(strings('profile.invalid_phone'));
			return;
		}
		return true;
	}

	async onUpdate() {
		if (this.isLoading) return;
		this.isLoading = true;

		const username = this.username?.trim();
		const firstname = this.firstname?.trim();
		const lastname = this.lastname?.trim();
		const email = this.email?.trim().toLowerCase();
		const phone = `+${this.countryCode}-${this.phone}`?.trim();

		const isValid = this.isDataValid();
		if (!isValid) {
			this.isLoading = false;
			return;
		}

		try {
			const selectedAddress = Engine.state.PreferencesController.selectedAddress;
			const path = `${RNFS.DocumentDirectoryPath}/avatar.png`;

			if (this.avatar && this.avatar !== path) {
				if (await RNFS.exists(path)) await RNFS.unlink(path); //remove existing file
				await RNFS.moveFile(this.avatar, path); // copy temporary file to persist
				this.avatar = path;
			}

			const name = `${firstname} ${lastname}`;
			// const avatarb64 = await RNFS.readFile(path, 'base64');
			const publicInfo = JSON.stringify({ name, email, phone });
			const hash = sha3JS.keccak_256(firstname + lastname + selectedAddress + publicInfo);
			const params = [username, selectedAddress, publicInfo, hash];

			const profile = {
				avatar: this.avatar ? path : '',
				firstname,
				lastname,
				email,
				phone
			};
			preferences.setOnboardProfile(profile);
			setOnboardProfile(profile);

			//Update wallet info on server
			Api.postRequest(
				routes.walletUpdate,
				params,
				response => {
					if (response.error) {
						alert(`${response.error.message}`);
					} else {
						const { PreferencesController } = Engine.context;
						PreferencesController.setAccountLabel(selectedAddress, username);
						showSuccess(strings('wallet.update_profile_success'));
					}
					this.isLoading = false;
				},
				error => {
					this.isLoading = false;
					alert(`${error.toString()}`);
				}
			);
		} catch (error) {
			this.isLoading = false;
			console.log('update wallet failed', error);
		}
	}

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<KeyboardAvoidingView style={styles.container} behavior={'padding'} enabled={Device.isIos()}>
					<ScrollView>
						<View style={styles.body}>
							<TouchableOpacity
								activeOpacity={0.5}
								style={styles.avatarView}
								onPress={() => this.onOpenModal()}
							>
								<RemoteImage
									source={this.avatar ? { uri: `file://${this.avatar}` } : drawables.avatar_user}
									style={styles.avatar}
								/>
							</TouchableOpacity>
							<Text style={styles.fullname}>
								{this.firstname} {this.lastname}
							</Text>

							<View style={styles.form}>
								<TextField
									value={this.username}
									label={strings('choose_password.username')}
									placeholder={strings('choose_password.username')}
									onChangeText={text => (this.username = text.replace(this.regex, ''))}
								/>
								<TextField
									value={this.firstname}
									label={strings('profile.name')}
									placeholder={strings('profile.name')}
									onChangeText={text => (this.firstname = text.replace(this.regex, ''))}
								/>
								<TextField
									value={this.lastname}
									label={strings('profile.surname')}
									placeholder={strings('profile.surname')}
									onChangeText={text => (this.lastname = text.replace(this.regex, ''))}
								/>
								<TextField
									value={this.email}
									label={strings('login.email')}
									placeholder={strings('login.email')}
									onChangeText={text => (this.email = text)}
									keyboardType="email-address"
								/>
								<PhoneTextField
									value={this.phone}
									label={strings('profile.phone')}
									placeholder={strings('profile.phone')}
									onChangeText={text => {
										if (!this.countryCode) {
											showError(strings('profile.select_country_code_first'));
											return;
										}
										this.phone = text;
									}}
									keyboardType="number-pad"
									countryCode={this.countryCode}
									onPressCountryCode={() => (this.showCountryCodePicker = true)}
									onFocus={() => {
										if (!this.countryCode) {
											showError(strings('profile.select_country_code_first'));
										}
									}}
								/>
							</View>
							<StyledButton
								type={'white'}
								onPress={this.onUpdate.bind(this)}
								containerStyle={styles.next}
								disabled={this.isLoading}
							>
								{strings('wallet.update_profile').toUpperCase()}
							</StyledButton>
						</View>
					</ScrollView>
					{this.showCountryCodePicker && (
						<CountrySearchModal
							placeholder={strings('profile.search')}
							items={allCountries}
							countryCode={this.countryCode}
							countryCode={this.countryCode}
							onSelectCountryCode={item => {
								this.countryCode = item.dialCode;
								this.showCountryCodePicker = false;
							}}
							onClose={() => (this.showCountryCodePicker = false)}
						/>
					)}
					<Modal visible={this.isViewModal} animationType="fade" transparent style={styles.modal}>
						<TouchableOpacity
							style={styles.centerModal}
							onPress={() => {
								this.isViewModal = false;
							}}
							activeOpacity={1}
						>
							<View style={styles.contentModal}>
								<StyledButton
									type={'normal'}
									onPress={this.onPickImage.bind(this)}
									containerStyle={styles.buttonModal}
								>
									{strings('profile.select_image')}
								</StyledButton>
								<StyledButton
									type={'normal'}
									onPress={this.onTakePicture.bind(this)}
									containerStyle={styles.buttonModal}
								>
									{strings('profile.take_a_picture')}
								</StyledButton>
							</View>
						</TouchableOpacity>
					</Modal>
					<Modal visible={this.notiPermissionCamera} animationType="fade" transparent>
						<View style={styles.notiCenterModal}>
							<View style={styles.notiContentModal}>
								<Text style={styles.notiContentText}>{this.notiMessage}</Text>
								<StyledButton
									type={'normal'}
									onPress={() => {
										this.notiPermissionCamera = false;
									}}
									containerStyle={styles.notiButtonModal}
								>
									{strings('navigation.close')}
								</StyledButton>
							</View>
						</View>
					</Modal>
				</KeyboardAvoidingView>
			</OnboardingScreenWithBg>
		);
	}
}

export default inject('store')(observer(EditProfile));
