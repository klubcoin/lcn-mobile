import React, { PureComponent } from 'react';
import {
	KeyboardAvoidingView,
	ScrollView,
	TouchableOpacity,
	View,
	Modal,
	Text,
	Platform,
	PermissionsAndroid,
	ActivityIndicator
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
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import emojiRegex from 'emoji-regex';
import APIService from '../../../services/APIService';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../../styles/common';

export const SUCCESS = 'success';
export const ALREADY_EXISTS = 'already_exists';

class ProfileOnboard extends PureComponent {
	static navigationOptions = ({ navigation }) => getOnboardingNavbarOptions(navigation);

	avatar = '';
	firstname = '';
	lastname = '';
	email = '';
	username = '';
	isViewModal = false;
	hasUpdateAvatar = false;
	notiPermissionCamera = false;
	notiMessage = '';
	regex = emojiRegex();
	timeoutCheckUniqueUsername = null;
	timeoutCheckUniqueEmail = null;
	isValidEmail = false;
	isValidUsername = false;
	isCheckingEmail = false;
	isCheckingUsername = false;

	constructor(props) {
		super(props);
		makeObservable(this, {
			avatar: observable,
			firstname: observable,
			lastname: observable,
			email: observable,
			isViewModal: observable,
			hasUpdateAvatar: observable,
			notiPermissionCamera: observable,
			notiMessage: observable,
			username: observable,
			timeoutCheckUniqueUsername: observable,
			timeoutCheckUniqueEmail: observable,
			isValidEmail: observable,
			isValidUsername: observable,
			isCheckingEmail: observable,
			isCheckingUsername: observable
		});
	}

	onUsernameChange = val => {
		this.username = val.replace(this.regex, '');
		this.isCheckingUsername = true;
		this.isValidUsername = false;
		if (this.timeoutCheckUniqueUsername) {
			clearTimeout(this.timeoutCheckUniqueUsername);
		}
		this.timeoutCheckUniqueUsername = setTimeout(() => {
			APIService.checkUniqueField('name', val, (success, json) => {
				this.isCheckingUsername = false;
				if (json === SUCCESS) {
					this.isValidUsername = true;
				} else {
					this.isValidUsername = false;
				}
			});
		}, 2000);
	};

	onEmailChange = val => {
		this.email = val.replace(this.regex, '');
		if (!validator.isEmail(val)) {
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
			APIService.checkUniqueField('email', val, (success, json) => {
				this.isCheckingEmail = false;
				if (json === SUCCESS) {
					this.isValidEmail = true;
				} else {
					this.isValidEmail = false;
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
									this.hasUpdateAvatar = true;
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
							this.hasUpdateAvatar = true;
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
					this.hasUpdateAvatar = true;
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
		const username = this.username.trim();
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
		if (!username) {
			showError(strings('profile.missing_username'));
			return;
		}
		return true;
	}

	async onNext() {
		const firstname = this.firstname.trim();
		const lastname = this.lastname.trim();
		const email = this.email.trim().toLowerCase();
		const username = this.username;

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
			email
		});

		this.props.navigation.navigate('ChoosePassword', {
			[PREVIOUS_SCREEN]: ONBOARDING,
			username
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
									onChangeText={text => (this.firstname = text.replace(this.regex, ''))}
									autoCapitalize={'words'}
								/>
								<TextField
									value={this.lastname}
									label={strings('profile.surname')}
									placeholder={strings('profile.surname')}
									onChangeText={text => (this.lastname = text.replace(this.regex, ''))}
									autoCapitalize={'words'}
								/>
								<TextField
									value={this.email}
									label={strings('login.email')}
									placeholder={strings('login.email')}
									onChangeText={text => this.onEmailChange(text)}
									keyboardType="email-address"
									rightItem={
										!this.email ? null : this.isCheckingEmail ? (
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
								<TextField
									value={this.username}
									label={strings('choose_password.username')}
									placeholder={strings('login.type_here')}
									containerStyle={styles.usernameField}
									onChangeText={this.onUsernameChange}
									rightItem={
										!this.username ? null : this.isCheckingUsername ? (
											<ActivityIndicator size="small" color="#fff" />
										) : this.isValidUsername ? (
											<Icon name="check" size={16} color={colors.success} />
										) : (
											<Icon name="remove" size={16} color={colors.fontError} />
										)
									}
								/>
								{!!this.username && !this.isCheckingUsername && !this.isValidUsername && (
									<Text style={styles.errorText}>{strings('profile.email_used')}</Text>
								)}
							</View>
							<StyledButton
								type={'normal'}
								onPress={this.onNext.bind(this)}
								containerStyle={styles.next}
								disabled={!this.isValidEmail || !this.isValidUsername}
							>
								{strings('choose_password.continue')}
							</StyledButton>
						</View>
					</ScrollView>
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
