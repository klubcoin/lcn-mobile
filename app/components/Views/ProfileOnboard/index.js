import React, { PureComponent } from 'react';
import {
	KeyboardAvoidingView,
	ScrollView,
	TouchableOpacity,
	View,
	Modal,
	Text,
	Platform,
	PermissionsAndroid
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import preferences from '../../../store/preferences';
import { getOnboardingNavbarOptions } from '../../UI/Navbar';
import RemoteImage from '../../Base/RemoteImage';
import drawables from '../../../common/drawables';
import * as RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-crop-picker';
import OnboardingProgress from '../../UI/OnboardingProgress';
import { CHOOSE_PASSWORD_STEPS } from '../../../constants/onboarding';
import { ONBOARDING, PREVIOUS_SCREEN } from '../../../constants/navigation';
import StyledButton from '../../UI/StyledButton';
import { strings } from '../../../../locales/i18n';
import Device from '../../../util/Device';
import Toast from 'react-native-toast-message';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';
import TextField from '../../UI/TextField';
import validator from 'validator';
import { showError } from '../../../util/notify';
import PhoneTextField from '../../UI/PhoneTextField';
import CountrySearchModal from '../../UI/CountrySearchModal';
import { allCountries } from 'country-telephone-data';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';

class ProfileOnboard extends PureComponent {
	static navigationOptions = ({ navigation }) => getOnboardingNavbarOptions(navigation);

	avatar = '';
	firstname = '';
	lastname = '';
	email = '';
	phone = '';
	isViewModal = false;
	showCountryCodePicker = false;
	countryCode = '';
	hasUpdateAvatar = false;
	notiPermissionCamera = false;
	notiMessage = '';

	constructor(props) {
		super(props);
		makeObservable(this, {
			avatar: observable,
			firstname: observable,
			lastname: observable,
			email: observable,
			phone: observable,
			isViewModal: observable,
			showCountryCodePicker: observable,
			countryCode: observable,
			hasUpdateAvatar: observable,
			notiPermissionCamera: observable,
			notiMessage: observable
		});
	}

	onPickImage() {
		ImagePicker.openPicker({
			width: 300,
			height: 300,
			cropping: true
		})
			.then(image => {
				this.isViewModal = false;
				this.avatar = image.path;
				this.hasUpdateAvatar = true;
			})
			.catch(err => {
				this.notiMessage = strings('profile.grant_permission_gallery_notification');
				if (Platform.OS === 'android') {
					PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(res => {
						this.isViewModal = false;
						this.notiPermissionCamera = !res;
					});
				}
				if (Platform.OS === 'ios') {
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
				}
			});
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
				this.hasUpdateAvatar = true;
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
		const firstname = this.firstname.trim();
		const lastname = this.lastname.trim();
		const email = this.email.trim();
		const phone = this.phone.trim();

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
		if (phone && (!/^\+?[\d\s]{10}$/.test(phone) || !this.countryCode)) {
			showError(strings('profile.invalid_phone'));
			return;
		}
		return true;
	}

	async onNext() {
		const firstname = this.firstname.trim();
		const lastname = this.lastname.trim();
		const email = this.email.trim().toLowerCase();
		const phone = `+${this.countryCode}-${this.phone}`.trim();

		const isValid = this.isDataValid();
		if (!isValid) return;
		const path = `${RNFS.DocumentDirectoryPath}/avatar.png`;
		if (this.avatar && this.hasUpdateAvatar) {
			//remove existing file
			try {
				if (await RNFS.exists(path)) await RNFS.unlink(path);
				await RNFS.moveFile(this.avatar, path); // copy temporary file to persist
				this.hasUpdateAvatar = false;
			} catch (err) {
				console.log(err);
			}
		}

		preferences.setOnboardProfile({
			avatar: this.avatar ? path : '',
			firstname,
			lastname,
			email,
			phone
		});

		this.props.navigation.navigate('ChoosePassword', {
			[PREVIOUS_SCREEN]: ONBOARDING
		});
	}

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<KeyboardAvoidingView style={styles.container} behavior={'padding'} enabled={Device.isIos()}>
					<OnboardingProgress steps={CHOOSE_PASSWORD_STEPS} />
					<ScrollView>
						<View style={styles.body}>
							<TouchableOpacity
								activeOpacity={0.5}
								style={styles.avatarView}
								onPress={() => this.onOpenModal()}
							>
								<RemoteImage
									source={this.avatar ? { uri: this.avatar } : drawables.avatar_user}
									style={styles.avatar}
								/>
							</TouchableOpacity>

							<View style={styles.form}>
								<TextField
									value={this.firstname}
									label={strings('profile.name')}
									placeholder={strings('profile.name')}
									onChangeText={text => (this.firstname = text)}
									autoCapitalize={'words'}
								/>
								<TextField
									value={this.lastname}
									label={strings('profile.surname')}
									placeholder={strings('profile.surname')}
									onChangeText={text => (this.lastname = text)}
									autoCapitalize={'words'}
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

							<StyledButton type={'normal'} onPress={this.onNext.bind(this)} containerStyle={styles.next}>
								{strings('choose_password.continue')}
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

export default inject('store')(observer(ProfileOnboard));
