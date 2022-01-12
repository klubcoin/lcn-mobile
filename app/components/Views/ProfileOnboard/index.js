import React, { PureComponent } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, TouchableOpacity, View, Text } from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import preferences from '../../../store/preferences';
import { getOnboardingNavbarOptions } from '../../UI/Navbar';
import RemoteImage from '../../Base/RemoteImage';
import drawables from '../../../common/drawables';
import * as RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-crop-picker';
import { colors, fontStyles } from '../../../styles/common';
import OnboardingProgress from '../../UI/OnboardingProgress';
import { CHOOSE_PASSWORD_STEPS } from '../../../constants/onboarding';
import { ONBOARDING, PREVIOUS_SCREEN } from '../../../constants/navigation';
import StyledButton from '../../UI/StyledButton';
import { strings } from '../../../../locales/i18n';
import { TextInput } from 'react-native-gesture-handler';
import Device from '../../../util/Device';
import Toast from 'react-native-toast-message';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';
import TextField from '../../UI/TextField';
import validator from 'validator';
import { showError } from '../../../util/notify';

class ProfileOnboard extends PureComponent {
	static navigationOptions = ({ navigation }) => getOnboardingNavbarOptions(navigation);

	avatar = '';
	firstname = '';
	lastname = '';
	email = '';
	phone = '';

	constructor(props) {
		super(props);
		makeObservable(this, {
			avatar: observable,
			firstname: observable,
			lastname: observable,
			email: observable,
			phone: observable
		});
	}

	onPickImage() {
		ImagePicker.openCamera({
			width: 300,
			height: 300,
			cropping: true
		}).then(image => {
			this.avatar = image.path;
		});
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
		if (!firstname || !lastname) {
			showError(strings('profile.missing_name'));
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
		if (!phone) {
			showError(strings('profile.missing_phone'));
			return;
		}
		if (!/^\+?[\d\s]{8,15}$/.test(phone)) {
			showError(strings('profile.invalid_phone'));
			return;
		}
		return true;
	}

	async onNext() {
		const firstname = this.firstname.trim();
		const lastname = this.lastname.trim();
		const email = this.email.trim().toLowerCase();
		const phone = this.phone.trim();

		const isValid = this.isDataValid();
		if (!isValid) return;

		const path = `${RNFS.DocumentDirectoryPath}/avatar.png`;
		if (await RNFS.exists(path)) await RNFS.unlink(path); //remove existing file
		await RNFS.moveFile(this.avatar, path); // copy temporary file to persist

		preferences.setOnboardProfile({
			avatar: path,
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
								onPress={() => this.onPickImage()}
							>
								<RemoteImage
									source={{ uri: this.avatar || drawables.avatar_user }}
									style={styles.avatar}
								/>
							</TouchableOpacity>

							<View style={styles.form}>
								<TextField
									value={this.firstname}
									label={strings('profile.name')}
									placeholder={strings('profile.name')}
									onChangeText={text => (this.firstname = text)}
								/>
								<TextField
									value={this.lastname}
									label={strings('profile.lastname')}
									placeholder={strings('profile.lastname')}
									onChangeText={text => (this.lastname = text)}
								/>
								<TextField
									value={this.email}
									label={strings('login.email')}
									placeholder={strings('login.email')}
									onChangeText={text => (this.email = text)}
									keyboardType="email-address"
								/>
								<TextField
									value={this.phone}
									label={strings('profile.phone')}
									placeholder={strings('profile.phone')}
									onChangeText={text => (this.phone = text)}
									keyboardType="number-pad"
								/>
							</View>

							<StyledButton type={'normal'} onPress={this.onNext.bind(this)} containerStyle={styles.next}>
								{strings('choose_password.continue')}
							</StyledButton>
						</View>
					</ScrollView>
				</KeyboardAvoidingView>
			</OnboardingScreenWithBg>
		);
	}
}

export default inject('store')(observer(ProfileOnboard));
