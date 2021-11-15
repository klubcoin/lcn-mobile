import React, { Component, PureComponent } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, TouchableOpacity, View, SafeAreaView, Text } from 'react-native';
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
import { RFValue } from 'react-native-responsive-fontsize';
import styles from './styles/index';
import { OutlinedTextField } from 'react-native-material-textfield';
import { inject, observer } from 'mobx-react';
import store from '../store';

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
	isChangedAvatar = false;

	constructor(props) {
		super(props);
		makeObservable(this, {
			logoStore: observable,
			storeName: observable,
			phone: observable,
			email: observable,
			about: observable,
			isChangedAvatar: observable
		});
	}

	componentDidMount() {
		this.fetchStoreProfile();
	}

	fetchStoreProfile = async () => {
		await store.load();
		this.profile = store.storeProfile;
		this.updateInfo();
	};

	updateInfo = () => {
		const { storeName, phone, email, about, logoStore } = this.profile;

		this.storeName = storeName;
		this.storeNameRef.setValue(storeName);

		this.phone = phone;
		this.phoneRef.setValue(phone);

		this.email = email;
		this.emailRef.setValue(email);

		this.about = about;
		this.aboutRef.setValue(about);

		this.logoStore = logoStore;
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
		const about = this.about?.trim();

		if (!this.logoStore) {
			showNotice('Missing photo');
			return;
		}
		if (!storeName) {
			showNotice('Missing store name');
			return;
		}
		if (!phone) {
			showNotice('Missing phone of store');
			return;
		}
		if (!email) {
			showNotice('Missing email of store');
			return;
		}
		if (!about) {
			showNotice('Missing description of store');
			return;
		}

		var fileName = '';
		if (this.logoStore.length > 0) fileName = this.logoStore.substring(this.logoStore.lastIndexOf('/') + 1);

		const path = `${RNFS.DocumentDirectoryPath}/${fileName || 'logo_store.png'}`;

		if ((await RNFS.exists(path)) && this.isChangedAvatar) await RNFS.unlink(path); //remove existing file
		await RNFS.moveFile(this.logoStore, path); // copy temporary file to persist

		store
			.saveProfile({
				storeName,
				logoStore: path,
				phone,
				email,
				about
			})
			.then(value => showNotice('Update successfully', 'success'));
	};

	onBack = () => {
		this.props.navigation.goBack();
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
								ref={ref => (this.storeNameRef = ref)}
								placeholder={'Enter your store name'}
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
								placeholder={'Enter your business phone'}
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
								placeholder={'Enter your business email'}
								returnKeyType="next"
								label={strings('market.email')}
								onChangeText={text => (this.email = text)}
								value={this.email}
								keyboardType="email-address"
								baseColor={colors.grey500}
								tintColor={colors.blue}
								containerStyle={styles.input}
							/>
							<OutlinedTextField
								ref={ref => (this.aboutRef = ref)}
								placeholder={'Enter your business description'}
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
