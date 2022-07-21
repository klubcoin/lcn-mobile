import React, { PureComponent } from 'react';
import {
	KeyboardAvoidingView,
	TouchableOpacity,
	View,
	Text,
	Modal,
	Platform,
	PermissionsAndroid,
	ActivityIndicator
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable, runInAction } from 'mobx';
import preferences from '../../../store/preferences';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import RemoteImage from '../../Base/RemoteImage';
import drawables from '../../../common/drawables';
import * as RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-crop-picker';
import StyledButton from '../../UI/StyledButton';
import { strings } from '../../../../locales/i18n';
import Device from '../../../util/Device';
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
import { setOnboardProfile } from '../../../actions/user';
import { renderAccountName } from '../../../util/address';
import { allCountries } from 'country-telephone-data';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import emojiRegex from 'emoji-regex';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../../styles/common';
import CryptoSignature from '../../../core/CryptoSignature';
import TrackingScrollView from '../../UI/TrackingScrollView';
import { testID } from '../../../util/Logger';

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
		phoneNumber: '',
		email: '',
		firstname: '',
		lastname: ''
	};
	timeoutCheckUniqueEmail = null;
	isValidEmail = true;
	isValidPhoneNumber = true;
	isCheckingEmail = false;
	isChangedAvatar = false;
	nameErrorText = '';
	surnameErrorText = '';
	phoneErrorText = '';

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
			isValidEmail: observable,
			isValidPhoneNumber: observable,
			isCheckingEmail: observable,
			isChangedAvatar: observable,
			nameErrorText: observable,
			surnameErrorText: observable,
			phoneErrorText: observable
		});
	}

	componentDidMount() {
		const { selectedAddress } = Engine.state.PreferencesController;
		const { identities } = Engine.state.PreferencesController;
		const { avatar, firstname, lastname, email, phone } = preferences?.onboardProfile ?? {};
		runInAction(() => {
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
					.join('-') ?? undefined;
			this.preData = {
				phone: phone
					?.replace('+', '')
					.split('-')
					.slice(1, phone?.split('-').length)
					.join('-'),
				countryCode: phone?.replace('+', '').split('-')[0],
				phoneNumber: phone,
				email,
				firstname,
				lastname
			};
		});
	}

	componentDidUpdate() {
		this.updateProfile();
	}

	updateProfile() {
		const { firstname, lastname, email, phone } = preferences?.onboardProfile ?? {};
		if (
			!this.isChangeProfile &&
			(firstname !== this.preData.firstname ||
				lastname !== this.preData.lastname ||
				email !== this.preData.email ||
				phone !== this.preData.phoneNumber)
		) {
			runInAction(() => {
				this.firstname = firstname;
				this.lastname = lastname;
				this.email = email;
				this.countryCode = phone?.replace('+', '').split('-')[0];
				this.phone =
					phone
						?.replace('+', '')
						.split('-')
						.slice(1, phone?.split('-').length)
						.join('-') ?? undefined;
				this.preData = {
					phone: phone
						?.replace('+', '')
						.split('-')
						.slice(1, phone?.split('-').length)
						.join('-'),
					countryCode: phone?.replace('+', '').split('-')[0],
					phoneNumber: phone,
					email,
					firstname,
					lastname
				};
			});
		}
	}

	onPhoneNumberChange = (countryCode, phoneNumber) => {
		runInAction(() => {
			this.phone = phoneNumber;
			this.onCheckPhoneNumberError();
			if (!REGEX_PHONE_NUMBER.test(phoneNumber) || !countryCode) {
				this.isValidPhoneNumber = false;
				return;
			}
			this.isValidPhoneNumber = true;
		});
	};

	onCheckPhoneNumberError = () => {
		runInAction(() => {
			this.phoneErrorText = !this.countryCode
				? strings('profile.missing_country_code')
				: !this.phone
				? strings('profile.missing_phone')
				: !REGEX_PHONE_NUMBER.test(this.phone)
				? strings('profile.invalid_phone')
				: '';
		});
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
									runInAction(() => {
										this.isViewModal = false;
										this.avatar = image.path;
										this.isChangedAvatar = true;
									});
								})
								.catch(err => {
									console.log(err);
									runInAction(() => {
										this.notiMessage = strings('profile.grant_permission_gallery_notification');
									});
									PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(
										response => {
											runInAction(() => {
												this.isViewModal = false;
												this.notiPermissionCamera = !response;
											});
										}
									);
								});
						} else {
							runInAction(() => {
								this.notiMessage = strings('profile.grant_permission_gallery_notification');
								this.isViewModal = false;
								this.notiPermissionCamera = !res;
							});
						}
					});
				} else {
					ImagePicker.openPicker({
						width: 300,
						height: 300,
						cropping: true
					})
						.then(image => {
							runInAction(() => {
								this.isViewModal = false;
								this.avatar = image.path;
								this.isChangedAvatar = true;
							});
						})
						.catch(err => {
							console.log(err);
							runInAction(() => {
								this.notiMessage = strings('profile.grant_permission_gallery_notification');
							});
							PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(
								response => {
									runInAction(() => {
										this.isViewModal = false;
										this.notiPermissionCamera = !response;
									});
								}
							);
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
					runInAction(() => {
						this.isViewModal = false;
						this.avatar = image.path;
						this.isChangedAvatar = true;
					});
				})
				.catch(err => {
					console.log(err);
					runInAction(() => {
						this.notiMessage = strings('profile.grant_permission_gallery_notification');
					});
					check(PERMISSIONS.IOS.PHOTO_LIBRARY)
						.then(result => {
							switch (result) {
								case RESULTS.UNAVAILABLE:
									break;
								case RESULTS.DENIED:
									runInAction(() => {
										this.isViewModal = false;
										this.notiPermissionCamera = true;
									});
									break;
								case RESULTS.LIMITED:
									break;
								case RESULTS.GRANTED:
									break;
								case RESULTS.BLOCKED:
									runInAction(() => {
										this.isViewModal = false;
										this.notiPermissionCamera = true;
									});
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
				runInAction(() => {
					this.isViewModal = false;
					this.avatar = image.path;
					this.isChangedAvatar = true;
				});
			})
			.catch(err => {
				console.log(err);
				runInAction(() => {
					this.notiMessage = strings('profile.grant_permission_camera_notification');
				});
				if (Platform.OS === 'android') {
					PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA).then(res => {
						runInAction(() => {
							this.isViewModal = false;
							this.notiPermissionCamera = !res;
						});
					});
				}
				if (Platform.OS === 'ios') {
					check(PERMISSIONS.IOS.CAMERA)
						.then(result => {
							switch (result) {
								case RESULTS.UNAVAILABLE:
									break;
								case RESULTS.DENIED:
									runInAction(() => {
										this.isViewModal = false;
										this.notiPermissionCamera = true;
									});
									break;
								case RESULTS.LIMITED:
									break;
								case RESULTS.GRANTED:
									break;
								case RESULTS.BLOCKED:
									runInAction(() => {
										this.isViewModal = false;
										this.notiPermissionCamera = true;
									});
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
		runInAction(() => {
			this.isViewModal = true;
		});
	}

	isDataValid() {
		const firstname = this.firstname?.trim();
		const lastname = this.lastname?.trim();
		const email = this.email?.trim();
		const phone = this.phone?.trim();
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
		if (phone && (!REGEX_PHONE_NUMBER.test(phone) || !this.countryCode)) {
			showError(strings('profile.invalid_phone'));
			return;
		}
		return true;
	}

	onPressUpdate() {
		this.onUpdate();
	}

	onSelectCountryCode = item => {
		runInAction(() => {
			this.countryCode = item.dialCode;
			this.onPhoneNumberChange(item.dialCode, this.phone);
			this.showCountryCodePicker = false;
		});
	};

	async onUpdate() {
		if (this.isLoading) {
			return;
		}
		runInAction(() => {
			this.isLoading = true;
		});

		const username = this.username?.trim();
		const firstname = this.firstname?.trim();
		const lastname = this.lastname?.trim();
		const email = this.email?.trim().toLowerCase();
		const phone = this.countryCode && this.phone ? `+${this.countryCode}-${this.phone}`?.trim() : undefined;

		const isValid = this.isDataValid();
		if (!isValid) {
			runInAction(() => {
				this.isLoading = false;
			});
			return;
		}

		try {
			const selectedAddress = Engine.state.PreferencesController.selectedAddress;
			const path = `${RNFS.DocumentDirectoryPath}/avatar.png`;
			if (this.avatar && this.avatar !== path) {
				if (await RNFS.exists(path)) {
					await RNFS.unlink(path);
				} //remove existing file
				await RNFS.moveFile(this.avatar, path); // copy temporary file to persist
				runInAction(() => {
					this.avatar = path;
					this.time = new Date();
				});
			}

			const lowerCaseSelectedAddress = selectedAddress.toLowerCase();
			// const avatarb64 = await RNFS.readFile(path, 'base64');
			const publicInfo = JSON.stringify({ firstname, lastname });
			const privateInfo = JSON.stringify({ emailAddress: email, phoneNumber: phone });
			const signature = await CryptoSignature.signMessage(lowerCaseSelectedAddress, publicInfo);
			const params = [username, lowerCaseSelectedAddress, signature, publicInfo, privateInfo];
			//Update wallet info on server
			Api.postRequest(
				routes.walletUpdate,
				params,
				response => {
					runInAction(() => {
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
							preferences
								.getOnboardProfile()
								.then(value => {
									preferences.setOnboardProfile(Object.assign(value, profile));
								})
								.catch(e => console.log('profile onboarding error', e));
							setOnboardProfile(profile);
							this.preData = {
								email,
								phone: this.phone,
								countryCode: this.countryCode,
								firstname,
								lastname
							};
							this.isChangedAvatar = false;
						}
						this.isLoading = false;
					});
				},
				error => {
					runInAction(() => {
						this.isLoading = false;
						alert(`${error.toString()}`);
					});
				}
			);
		} catch (error) {
			runInAction(() => {
				this.isLoading = false;
				console.log('update wallet failed', error);
			});
		}
	}

	render() {
		let isChangedProfile =
			this.isChangedAvatar ||
			this.preData.countryCode !== this.countryCode ||
			this.preData.phone !== this.phone ||
			this.preData.email !== this.email ||
			this.preData.firstname !== this.firstname ||
			this.preData.lastname !== this.lastname;

		return (
			<OnboardingScreenWithBg screen="a">
				<KeyboardAvoidingView style={styles.container} behavior={'padding'} enabled={Device.isIos()}>
					<TrackingScrollView>
						<View style={styles.body}>
							<TouchableOpacity
								activeOpacity={0.5}
								style={styles.avatarView}
								onPress={() => this.onOpenModal()}
								{...testID('edit-profile-screen-avatar-button')}
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
									testID={'edit-profile-username-field'}
								/>
								<TextField
									value={this.firstname}
									label={strings('profile.name')}
									placeholder={strings('profile.name')}
									onChangeText={text => {
										runInAction(() => {
											this.firstname = text.replace(this.regex, '');
										});
									}}
									autoCapitalize={'words'}
									onBlur={() => {
										runInAction(() => {
											this.nameErrorText = !this.firstname
												? strings('profile.name_required')
												: '';
										});
									}}
									onFocus={() => {
										runInAction(() => {
											this.nameErrorText = '';
										});
									}}
									errorText={this.nameErrorText}
									testID={'edit-profile-name-field'}
								/>
								<TextField
									value={this.lastname}
									label={strings('profile.surname')}
									placeholder={strings('profile.surname')}
									onChangeText={text => {
										runInAction(() => {
											this.lastname = text.replace(this.regex, '');
										});
									}}
									autoCapitalize={'words'}
									onBlur={() => {
										runInAction(() => {
											this.surnameErrorText = !this.lastname
												? strings('profile.surname_required')
												: '';
										});
									}}
									onFocus={() => {
										runInAction(() => {
											this.surnameErrorText = '';
										});
									}}
									errorText={this.surnameErrorText}
									testID={'edit-profile-surname-field'}
								/>
								<TextField
									value={this.email}
									label={strings('login.email')}
									placeholder={strings('login.email')}
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
									testID={'edit-profile-email-field'}
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
										this.onPhoneNumberChange(this.countryCode, text);
										if (!this.countryCode) {
											showError(strings('profile.select_country_code_first'));
											return;
										}
									}}
									keyboardType="number-pad"
									countryCode={this.countryCode}
									onPressCountryCode={() => {
										runInAction(() => {
											this.showCountryCodePicker = true;
										});
									}}
									onFocus={() => {
										runInAction(() => {
											if (!this.countryCode) {
												showError(strings('profile.select_country_code_first'));
											}
											this.phoneErrorText = '';
										});
									}}
									rightItem={
										this.phone || this.countryCode ? (
											this.isValidPhoneNumber ? (
												<Icon name="check" size={16} color={colors.success} />
											) : (
												<Icon name="remove" size={16} color={colors.fontError} />
											)
										) : null
									}
									onBlur={this.onCheckPhoneNumberError}
								/>
								{!!this.phoneErrorText && <Text style={styles.errorText}>{this.phoneErrorText}</Text>}
							</View>
							<StyledButton
								testID={'edit-profile-update-profile-button'}
								type={'white'}
								onPress={this.onPressUpdate.bind(this)}
								containerStyle={styles.next}
								disabled={
									this.isLoading ||
									!this.isValidEmail ||
									!this.isValidPhoneNumber ||
									!isChangedProfile ||
									!this.firstname ||
									!this.lastname
								}
							>
								{strings('wallet.update_profile').toUpperCase()}
							</StyledButton>
						</View>
					</TrackingScrollView>
					{this.showCountryCodePicker && (
						<CountrySearchModal
							placeholder={strings('profile.search')}
							items={allCountries}
							countryCode={this.countryCode}
							onSelectCountryCode={this.onSelectCountryCode}
							onClose={() => {
								runInAction(() => {
									this.showCountryCodePicker = false;
								});
							}}
						/>
					)}
					<Modal visible={this.isViewModal} animationType="fade" transparent style={styles.modal}>
						<TouchableOpacity
							style={styles.centerModal}
							onPress={() => {
								runInAction(() => {
									this.isViewModal = false;
								});
							}}
							activeOpacity={1}
							{...testID('edit-profile-screen-change-avatar-modal')}
						>
							<View style={styles.contentModal}>
								<StyledButton
									testID={'edit-profile-select-image-button'}
									type={'normal'}
									onPress={this.onPickImage.bind(this)}
									containerStyle={styles.buttonModal}
								>
									{strings('profile.select_image')}
								</StyledButton>
								<StyledButton
									testID={'edit-profile-take-a-picture-button'}
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
									testID={'edit-profile-close-button'}
									type={'normal'}
									onPress={() => {
										runInAction(() => {
											this.notiPermissionCamera = false;
										});
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
