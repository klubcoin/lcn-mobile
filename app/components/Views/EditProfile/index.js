import React, { PureComponent } from 'react';
import {
	KeyboardAvoidingView,
	ScrollView,
	TouchableOpacity,
	View,
	Text,
	Modal,
	Platform,
	PermissionsAndroid,
	ActivityIndicator
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
import APIService from '../../../services/APIService';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../../styles/common';
import { SUCCESS, ALREADY_EXISTS } from '../ProfileOnboard';

export const REGEX_PHONE_NUMBER = /^[\d]{4,13}$/;

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
	time = new Date();
	preData = {
		phone: '',
		countryCode: '',
		email: ''
	};
	timeoutCheckUniqueEmail = null;
	timeoutCheckUniquePhoneNumber = null;
	isValidEmail = true;
	isValidPhoneNumber = true;
	isCheckingEmail = false;
	isCheckingPhoneNumber = false;

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
			notiMessage: observable,
			time: observable,
			preData: observable,
			timeoutCheckUniqueEmail: observable,
			timeoutCheckUniquePhoneNumber: observable,
			isValidEmail: observable,
			isValidPhoneNumber: observable,
			isCheckingEmail: observable,
			isCheckingPhoneNumber: observable
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
		this.phone =
			phone
				?.replace('+', '')
				.split('-')
				.slice(1, phone?.split('-').length)
				.join('-') ?? '';
		this.preData = {
			phone: phone
				?.replace('+', '')
				.split('-')
				.slice(1, phone?.split('-').length)
				.join('-'),
			countryCode: phone?.replace('+', '').split('-')[0],
			email
		};
	}

	onEmailChange = val => {
		const email = val.replace(this.regex, '').trim()
		this.email = val.replace(this.regex, '');
		if (this.preData.email === email) {
			return;
		}
		if (!validator.isEmail(email)) {
			this.isCheckingEmail = false;
			this.isValidEmail = false;
			return;
		}
		this.isCheckingEmail = true;
		this.isValidEmail = false;
		if (this.timeoutCheckUniqueEmail) {
			clearTimeout(this.timeoutCheckUniqueEmail);
		}
		this.timeoutCheckUniqueEmail = setTimeout(() => {
			APIService.checkUniqueField('email', email, (success, json) => {
				this.isCheckingEmail = false;
				if (this.email !== email) {
					return;
				}
				if (json === SUCCESS) {
					this.isValidEmail = true;
				} else {
					this.isValidEmail = false;
				}
			});
		}, 2000);
	};

	onPhoneNumberChange = (countryCode, phoneNumber) => {
		this.phone = phoneNumber;
		if (!REGEX_PHONE_NUMBER.test(phoneNumber)) {
			this.isCheckingPhoneNumber = false;
			this.isValidPhoneNumber = false;
			return;
		}
		this.isCheckingPhoneNumber = true;
		this.isValidPhoneNumber = false;
		if (this.timeoutCheckUniquePhoneNumber) {
			clearTimeout(this.timeoutCheckUniquePhoneNumber);
		}
		this.timeoutCheckUniquePhoneNumber = setTimeout(() => {
			APIService.checkUniqueField('phoneNumber', `+${countryCode}-${phoneNumber}`, (success, json) => {
				this.isCheckingPhoneNumber = false;
				if (`+${this.countryCode}-${this.phone}` !== `+${countryCode}-${phoneNumber}`) {
					return;
				}
				if (json === SUCCESS) {
					this.isValidPhoneNumber = true;
				} else {
					this.isValidPhoneNumber = false;
				}
			});
		}, 2000);
	};

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
		if (phone && (!REGEX_PHONE_NUMBER.test(phone) || !this.countryCode)) {
			showError(strings('profile.invalid_phone'));
			return;
		}
		return true;
	}

	onPressUpdate() {
		this.onUpdate();
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
				this.time = new Date();
			}

			const name = `${firstname} ${lastname}`;
			// const avatarb64 = await RNFS.readFile(path, 'base64');
			const publicInfo = JSON.stringify({ name });
			const privateInfo = JSON.stringify({ emailAddress: email, phoneNumber: phone });
			const hash = sha3JS.keccak_256(firstname + lastname + selectedAddress + publicInfo);
			const params = [username, selectedAddress, publicInfo, privateInfo];

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
						const profile = {
							avatar: this.avatar ? path : '',
							firstname,
							lastname,
							email,
							phone
						};
						preferences.setOnboardProfile(profile);
						setOnboardProfile(profile);
						this.preData = {
							email,
							phone: this.phone,
							countryCode: this.countryCode
						};
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
									source={
										this.avatar
											? { uri: `file://${this.avatar}?v=${this.time.getTime()}` }
											: drawables.avatar_user
									}
									style={styles.avatar}
								/>
							</TouchableOpacity>
							<Text style={styles.fullname}>
								{this.firstname} {this.lastname}
							</Text>

							<View style={styles.form}>
								<TextField
									value={this.username}
									disabled
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
									onChangeText={text => this.onEmailChange(text)}
									keyboardType="email-address"
									disabled
									rightItem={
										!this.email || this.email === this.preData.email ? null : this
												.isCheckingEmail ? (
											<ActivityIndicator size="small" color="#fff" />
										) : this.isValidEmail ? (
											<Icon name="check" size={16} color={colors.success} />
										) : (
											<Icon name="remove" size={16} color={colors.fontError} />
										)
									}
								/>
								{!!this.email &&
									validator.isEmail(this.email) &&
									!this.isCheckingEmail &&
									!this.isValidEmail && (
										<Text style={styles.errorText}>{strings('profile.email_used')}</Text>
									)}
								<PhoneTextField
									value={this.phone}
									label={strings('profile.phone')}
									placeholder={strings('profile.phone')}
									onChangeText={text => {
										if (!this.countryCode) {
											showError(strings('profile.select_country_code_first'));
											return;
										}
										this.onPhoneNumberChange(this.countryCode, text);
									}}
									keyboardType="number-pad"
									countryCode={this.countryCode}
									onPressCountryCode={() => (this.showCountryCodePicker = true)}
									onFocus={() => {
										if (!this.countryCode) {
											showError(strings('profile.select_country_code_first'));
										}
									}}
									rightItem={
										!this.phone ||
										(this.phone === this.preData.phone &&
											this.countryCode === this.preData.countryCode) ? null : this
												.isCheckingPhoneNumber ? (
											<ActivityIndicator size="small" color="#fff" />
										) : this.isValidPhoneNumber ? (
											<Icon name="check" size={16} color={colors.success} />
										) : (
											<Icon name="remove" size={16} color={colors.fontError} />
										)
									}
								/>
								{!!this.phone &&
									!this.isCheckingPhoneNumber &&
									!this.isValidPhoneNumber &&
									REGEX_PHONE_NUMBER.test(this.phone) && (
										<Text style={styles.errorText}>{strings('profile.phone_number_used')}</Text>
									)}
							</View>
							<StyledButton
								type={'white'}
								onPress={this.onPressUpdate.bind(this)}
								containerStyle={styles.next}
								disabled={this.isLoading || !this.isValidEmail || !this.isValidPhoneNumber}
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
							onSelectCountryCode={item => {
								this.countryCode = item.dialCode;
								this.onPhoneNumberChange(item.dialCode, this.phone);
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
