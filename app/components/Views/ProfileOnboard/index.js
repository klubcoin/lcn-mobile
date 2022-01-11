import React, { PureComponent } from 'react'
import { KeyboardAvoidingView, ScrollView, StyleSheet, TouchableOpacity, View } from 'react-native'
import { inject, observer } from 'mobx-react'
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


const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: 10,
  },
  body: {
    paddingTop: 50,
    paddingBottom: 120,
    alignItems: 'center',
  },
  avatarView: {
    borderRadius: 96,
    borderWidth: 2,
    padding: 2,
    borderColor: colors.blue,
    alignItems: 'center',
    justifyContent: 'center',
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  form: {
    width: '100%',
    maxWidth: 300,
    paddingHorizontal: 20,
    marginTop: 30,
    marginBottom: 30,
  },
  textInput: {
    height: 45,
    ...fontStyles.normal,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 25,
    paddingHorizontal: 10,
    marginBottom: 20,
    fontSize: 18,
    alignItems: 'center',
    textAlign: 'center',
  },
  next: {
    width: 240,
  }
});

class ProfileOnboard extends PureComponent {
  static navigationOptions = ({ navigation }) => getOnboardingNavbarOptions(navigation);

  avatar = '';
  firstname = '';
  lastname = '';

  constructor(props) {
    super(props)
    makeObservable(this, {
      avatar: observable,
      firstname: observable,
      lastname: observable,
    })
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

  async onNext() {
    const firstname = this.firstname.trim();
    const lastname = this.lastname.trim();

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

    const phone = this.props.navigation.getParam('phone');
    preferences.setOnboardProfile({
      phone,
      avatar: path,
      firstname,
      lastname,
    })

    this.props.navigation.navigate('ChoosePassword', {
      [PREVIOUS_SCREEN]: ONBOARDING
    });
  }

  render() {
    return (
      <KeyboardAvoidingView
        style={styles.container}
        behavior={'padding'}
        enabled={Device.isIos()}
      >
        <OnboardingProgress steps={CHOOSE_PASSWORD_STEPS} />
        <ScrollView>
          <View style={styles.body}>
            <TouchableOpacity
              testID={'onboard-profile-avatar'}
              accessibilityLabel={'onboard-profile-avatar'}
              activeOpacity={0.5}
              style={styles.avatarView}
              onPress={() => this.onPickImage()}>
              <RemoteImage source={{ uri: this.avatar || drawables.avatar_user }} style={styles.avatar} />
            </TouchableOpacity>

            <View style={styles.form}>
              <TextInput
                testID={'onboard-profile-firstname'}
                accessibilityLabel={'onboard-profile-firstname'}
                style={styles.textInput}
                value={this.firstname}
                placeholder={strings('profile.firstname')}
                placeholderTextColor={colors.grey300}
                onChangeText={(text) => this.firstname = text}
              />

              <TextInput
                testID={'onboard-profile-lastname'}
                accessibilityLabel={'onboard-profile-lastname'}
                style={styles.textInput}
                value={this.lastname}
                placeholder={strings('profile.lastname')}
                placeholderTextColor={colors.grey300}
                onChangeText={(text) => this.lastname = text}
              />
            </View>

            <StyledButton
              testID={'onboard-profile-submit'}
              accessibilityLabel={'onboard-profile-submit'}
              type={'confirm'}
              onPress={this.onNext.bind(this)}
              containerStyle={styles.next}
            >
              {strings('choose_password.continue')}
            </StyledButton>
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
    )
  }
}

export default inject('store')(observer(ProfileOnboard));
