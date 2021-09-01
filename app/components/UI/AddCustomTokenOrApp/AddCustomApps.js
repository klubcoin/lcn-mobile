import React, { PureComponent } from 'react';
import { View, StyleSheet, FlatList, TouchableOpacity } from 'react-native';
import { colors } from '../../../styles/common';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import ActionView from '../ActionView';
import Engine from '../../../core/Engine';
import APIService from '../../../services/APIService';
import { makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import Text from '../../Base/Text';
import RemoteImage from '../../Base/RemoteImage';
import { addHexPrefix } from 'ethereumjs-util';

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
export default class AddCustomApps extends PureComponent {

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
    makeObservable(this, {
      appInstances: observable,
      selectedInstance: observable,
      selectedAsset: observable,
    })
  }

  componentDidMount() {
    const { selectedApp } = this.props;
    this.fetchIstances(selectedApp.cetCode);
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
    const { hexHash, name, symbol, decimals } = this.selectedAsset;
    const address = addHexPrefix(hexHash);
    await AssetsController.addToken(address, symbol || name, decimals || 0);

    const { onAddToken } = this.props;
    if (onAddToken) onAddToken();
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

observer(AddCustomApps);