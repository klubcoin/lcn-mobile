import React, { PureComponent } from 'react'
import { StyleSheet, TouchableOpacity, View } from 'react-native'
import { inject, observer } from 'mobx-react'
import { makeObservable, observable } from 'mobx';
import preferences from '../../../store/preferences';
import { strings } from '../../../../locales/i18n';
import Engine from '../../../core/Engine';
import Identicon from '../../UI/Identicon';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import RemoteImage from '../../../components/Base/RemoteImage';
import Text from '../../../components/Base/Text';
import ImagePicker from 'react-native-image-crop-picker';
import { colors } from '../../../styles/common';


const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  body: {
    alignItems: 'center',
    marginTop: 80,
  },
  avatarView: {
    borderRadius: 96,
    borderWidth: 2,
    padding: 2,
    borderColor: colors.blue
  },
  avatar: {
    width: 96,
    height: 96,
    borderRadius: 48,
    overflow: 'hidden',
    alignSelf: 'center',
  },
  name: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: '600',
    color: colors.black,
  },
  email: {
    fontSize: 18,
    fontWeight: '600',
  },
});

class Profile extends PureComponent {
  static navigationOptions = ({ navigation }) =>
    getNavigationOptionsTitle(strings('drawer.profile'), navigation);

  account = {};
  selectedAddress = '';

  constructor(props) {
    super(props)
    makeObservable(this, {
      account: observable,
      selectedAddress: observable,
    })

    const { selectedAddress } = Engine.state.PreferencesController;
    this.selectedAddress = selectedAddress;
  }

  componentDidMount() {
    this.fetchUser();
  }

  async fetchUser() {
    this.account = await preferences.getKeycloakAccount();
  }

  onPickImage() {
    ImagePicker.openCamera({
      width: 300,
      height: 300,
      cropping: true
    }).then(image => {
      this.account.avatar = image.path;
    });
  }

  render() {
    const { email, name, avatar } = this.account;

    return (
      <View style={styles.container}>
        <View style={styles.body}>
          <TouchableOpacity
            activeOpacity={0.5}
            style={styles.avatarView}
            onPress={() => this.onPickImage()}>
            {avatar
              ? <RemoteImage source={{ uri: avatar }} style={styles.avatar} />
              : <Identicon diameter={96} address={this.selectedAddress} />}
          </TouchableOpacity>
          <Text style={styles.name}>{name}</Text>
          <Text style={styles.email}>{email}</Text>
        </View>
      </View>
    )
  }
}

export default inject('store')(observer(Profile));