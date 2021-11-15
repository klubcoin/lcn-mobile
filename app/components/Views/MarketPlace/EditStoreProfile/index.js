import React, { PureComponent } from 'react';
import { KeyboardAvoidingView, ScrollView, StyleSheet, TouchableOpacity, View, SafeAreaView, Text } from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
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

class EditStoreProfile extends PureComponent {
	static navigationOptions = ({ navigation }) => getOnboardingNavbarOptions(navigation);

	avatar = '';
	storeName = '';
	phone = '';
	email = '';
	about = '';

	constructor(props) {
		super(props);
		makeObservable(this, {
			avatar: observable,
			storeName: observable,
			phone: observable,
			email: observable,
			about: observable
		});
	}

	onPickImage() {
		ImagePicker.openPicker({
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

	async onNext() {
		const firstname = this.storeName.trim();
		const lastname = this.phone.trim();

		if (!this.avatar) {
			this.showNotice(strings('profile.missing_photo'));
			return;
		}
		if (!firstname || !lastname) {
			this.showNotice(strings('profile.missing_name'));
			return;
		}

		const path = `${RNFS.DocumentDirectoryPath}/avatar.png`;
		if (await RNFS.exists(path)) await RNFS.unlink(path); //remove existing file
		await RNFS.moveFile(this.avatar, path); // copy temporary file to persist

		preferences.setOnboardProfile({
			avatar: path,
			firstname,
			lastname
		});

		this.props.navigation.navigate('ChoosePassword', {
			[PREVIOUS_SCREEN]: ONBOARDING
		});
	}

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
							<RemoteImage source={{ uri: this.avatar || drawables.noImage }} style={styles.avatar} />
						</TouchableOpacity>

						<View style={styles.form}>
							<OutlinedTextField
								placeholder={'Enter your store name'}
								returnKeyType="next"
								label={strings('market.store_name')}
								onChange={text => (this.storeName = text)}
								value={this.storeName}
								baseColor={colors.grey500}
								tintColor={colors.blue}
								containerStyle={styles.input}
							/>
							<OutlinedTextField
								placeholder={'Enter your business phone'}
								returnKeyType="next"
								onChange={text => (this.phone = text)}
								value={this.phone}
								label={strings('market.phone')}
								keyboardType="phone-pad"
								baseColor={colors.grey500}
								tintColor={colors.blue}
								containerStyle={styles.input}
							/>
							<OutlinedTextField
								placeholder={'Enter your business email'}
								returnKeyType="next"
								label={strings('market.email')}
								onChange={text => (this.email = text)}
								value={this.email}
								keyboardType="email-address"
								baseColor={colors.grey500}
								tintColor={colors.blue}
								containerStyle={styles.input}
							/>
							<OutlinedTextField
								placeholder={'Enter your business description'}
								returnKeyType="next"
								label={strings('market.about')}
								onChange={text => (this.about = text)}
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

						<StyledButton
							type={'confirm'}
							onPress={() => console.log('onChange')}
							containerStyle={styles.next}
						>
							{strings('market.edit')}
						</StyledButton>
					</View>
				</ScrollView>
			</KeyboardAvoidingView>
		);
	}
}

export default inject('store')(observer(EditStoreProfile));
