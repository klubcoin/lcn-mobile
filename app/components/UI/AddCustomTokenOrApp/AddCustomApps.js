import React, { PureComponent } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '../../../styles/common';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import ActionView from '../ActionView';
import Engine from '../../../core/Engine';
import APIService from '../../../services/APIService';
import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import Text from '../../Base/Text';
import RemoteImage from '../../Base/RemoteImage';
import { addHexPrefix } from 'ethereumjs-util';
import preferences from '../../../store/preferences';

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    flex: 1
  },
  options: {

  },
  option: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: 20,
    paddingHorizontal: 15,
    paddingVertical: 15,
    borderColor: colors.grey300,
    borderBottomWidth: StyleSheet.hairlineWidth,
  },
  highlight: {
    borderColor: colors.blue200,
    borderRadius: 20,
    borderWidth: 2,
    borderBottomWidth: 2,
  },
  name: {
    fontSize: 16,
  },
  desc: {
    fontSize: 12,
  },
  logo: {
    width: 32,
    height: 32,
    borderRadius: 16,
    marginLeft: 10,
  },
});

/**
 * PureComponent that provides ability to add select contracts
 */
export class AddCustomApps extends PureComponent {

  static propTypes = {
    selectedApp: PropTypes.object,
    onAddToken: PropTypes.func,
    onCancel: PropTypes.func,
  };

  appInstances = [];
  selectedInstance = {};
  selectedAsset = {};

  constructor(props) {
    super(props);
    this.prefs = props.store;
    makeObservable(this, {
      appInstances: observable,
      selectedInstance: observable,
      selectedAsset: observable,
    })
  }

  componentDidMount() {
    const { selectedApp } = this.props;
    this.fetchIstances(selectedApp.cetCode || 'LiquivoteInstance');
  }

  componentDidUpdate(prevProps) {
    const { selectedApp } = this.props;
    if (prevProps != this.props) {
      this.selectedAsset = {};

      this.fetchIstances(selectedApp.cetCode);
    }
  }

  addApp = async () => {
    const { AssetsController } = Engine.context;
    const { selectedAddress } = Engine.state.PreferencesController;
    const { hexHash, name, symbol, decimals } = this.selectedAsset;
    const { uuid, iconUrl } = this.selectedInstance;
    const { selectedApp, onAddToken } = this.props;
    const address = addHexPrefix(hexHash);
    const icon = iconUrl || selectedApp.iconUrl;
    await AssetsController.addToken(address, symbol || name, decimals || 0, icon);

    await this.prefs.saveApp({
      address,
      ...this.selectedAsset,
      instance: this.selectedInstance,
      application: selectedApp,
    })

    const isVotingApp = selectedApp.name?.toLowerCase().includes('vote')
      || selectedApp.description?.toLowerCase().includes('vote');

    if (isVotingApp) {
      APIService.registerVoter(uuid, selectedAddress, (success, json) => {
        if (success && json.registration) {
          preferences.setVoteInstance({ ...this.selectedInstance, application: selectedApp });
          preferences.setVoterId(json.registration);

          if (onAddToken) onAddToken();
        }
      })
    } else if (onAddToken) onAddToken();
  };

  cancelAddToken = () => {
    const { onCancel } = this.props;
    if (onCancel) onCancel();
  };

  onSelect(item) {
    this.selectedInstance = item;
    if (item.cetCode) {
      this.fetchIstances(item.cetCode);
    } else if (item.appWallet) {
      this.selectedAsset = item;
      this.getContractAddress(item.appWallet);
    } else if (item.ownerWallet) {
      this.selectedAsset = item;
      this.getContractAddress(item.ownerWallet);
    }
  }

  fetchIstances(cetCode) {
    if (!cetCode) {
      this.appInstances = [];
      return;
    }
    APIService.getAppInstances(cetCode, (success, json) => {
      if (success && json) {
        this.appInstances = [...json];
      }
    })
  }

  getContractAddress(appWallet) {
    APIService.getWalletContract(appWallet, (success, json) => {
      if (success && json.application) {
        this.selectedAsset = json;
      }
    })
  }

  renderItem = ({ item }) => {
    const { selectedApp } = this.props;
    const { name, description, shortCode, iconUrl, uuid } = item || {};
    const isSelected = this.selectedInstance?.uuid == uuid;

    return (
      <TouchableOpacity
        style={[styles.option, isSelected && styles.highlight]}
        activeOpacity={0.55}
        onPress={() => this.onSelect(item)}
      >
        <View style={{ flex: 1 }}>
          <Text bold black style={styles.name}>{name || ''}{shortCode ? ` (${shortCode})` : ''}</Text>
          {!!description && <Text style={styles.desc}>{description || ''}</Text>}
        </View>
        <RemoteImage
          resizeMode={'contain'}
          source={{ uri: iconUrl || selectedApp.iconUrl }}
          style={styles.logo}
        />
      </TouchableOpacity >
    );
  };

  render() {
    return (
      <View style={styles.wrapper}>
        <ActionView
          cancelText={strings('add_asset.cancel')}
          confirmText={strings('add_asset.add_app')}
          onCancelPress={this.cancelAddToken}
          onConfirmPress={this.addApp}
          confirmDisabled={!(this.selectedAsset && this.selectedAsset.uuid)}
        >
          <View>
            <FlatList
              data={this.appInstances}
              keyExtractor={(item) => item.uuid}
              renderItem={this.renderItem.bind(this)}
              style={styles.options}
            />
          </View>
        </ActionView>
      </View>
    );
  };
}

export default inject('store')(observer(AddCustomApps));