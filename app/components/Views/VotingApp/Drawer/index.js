import React, { Component } from 'react'
import { StyleSheet, Text, View, FlatList, TouchableOpacity } from 'react-native'
import { inject, observer } from 'mobx-react'
import { SafeAreaView } from 'react-native-safe-area-context'
import Button from 'react-native-button'
import Identicon from '../../../UI/Identicon'
import Icon from 'react-native-vector-icons/MaterialCommunityIcons'
import { colors } from '../../../../styles/common'
import Engine from '../../../../core/Engine'
import EthereumAddress from '../../../UI/EthereumAddress'
import { strings } from '../../../../../locales/i18n'


const styles = StyleSheet.create({
  root: {
    flex: 1,
    backgroundColor: 'transparent'
  },
  body: {
    backgroundColor: '#fff',
    flex: 1,
    width: 200,
    shadowColor: colors.black,
    shadowOffset: {
      width: 1,
      height: 0
    },
    shadowOpacity: 0.3,
    shadowRadius: 1,
  },
  close: {
    marginLeft: 10,
    marginTop: 10,
    width: 25
  },
  profile: {
    alignItems: 'center',
    marginTop: 30
  },
  name: {
    marginTop: 10,
    fontSize: 16,
    fontWeight: '600',
  },
  address: {
    fontSize: 12,
    marginTop: 5,
    color: colors.grey600
  },
  menuItem: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center',
  },
  menuTitle: {
    flex: 1,
    marginLeft: 10,
    fontWeight: '600',
    fontSize: 14,
  },
  footer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 20
  },
  setting: {
    padding: 10,
    flexDirection: 'row',
    alignItems: 'center'
  },
  settingText: {
    marginLeft: 10,
    fontWeight: '600',
    fontSize: 14,
  }
});

const menuItems = () => [
  {
    key: 'home',
    title: strings('voting.home'),
    icon: 'home',
    screen: 'Dashboard',
  },
  {
    key: 'votes',
    title: strings('voting.votes'),
    icon: 'poll-box',
    screen: 'VotingApp',
  },
  {
    key: 'delegations',
    title: strings('voting.delegations'),
    icon: 'account-box',
    screen: 'VoteDelegations',
  },
  {
    key: 'proposals',
    title: strings('voting.proposals'),
    icon: 'heart',
    screen: 'VoteProposals',
  }
];

const menuSettings = {
  key: 'settings',
  title: strings('voting.settings'),
  icon: 'cog',
  screen: 'Settings',
};

export class VoteDrawer extends Component {

  toggleDrawer = () => {
    const { drawer } = this.props;
    drawer && drawer.close()
  };

  openMenu(item) {
    const { key, screen } = item;
    const { menuKey, navigation } = this.props;

    this.toggleDrawer();

    if (key == menuKey) return;

    navigation.navigate(screen);
  }

  renderItem({ item }) {
    const { menuKey } = this.props;
    const { key, icon, title } = item;
    const selected = key == menuKey;
    const backgroundColor = selected ? '#FEEFF0' : null;

    return (
      <TouchableOpacity style={[styles.menuItem, { backgroundColor }]}
        activeOpacity={0.8}
        onPress={() => this.openMenu(item)}
      >
        <Icon name={icon}
          size={25}
          color={selected ? colors.orange : colors.grey200}
        />
        <Text style={styles.menuTitle}>{title}</Text>
        <Icon
          size={22}
          name={selected ? 'chevron-left' : 'chevron-right'}
          color={selected ? colors.orange : colors.grey300}
        />
      </TouchableOpacity>
    )
  }

  renderFooter() {
    const { icon, title } = menuSettings;

    return (
      <View style={styles.footer}>
        <TouchableOpacity style={styles.setting}
          activeOpacity={0.6}
          onPress={() => this.openMenu(menuSettings)}
        >
          <Icon name={icon}
            size={25}
            color={colors.grey200}
          />
          <Text style={styles.settingText}>{title}</Text>
        </TouchableOpacity>
      </View>
    )
  }

  render() {
    const { PreferencesController } = Engine.state;
    const { identities, selectedAddress } = PreferencesController;
    const account = identities[selectedAddress];

    return (
      <View style={styles.root}>

        <View style={styles.body}>
          <SafeAreaView >
            <Button onPress={this.toggleDrawer} >
              <Icon name={'close'} size={25} color={colors.orange} style={styles.close} />
            </Button>
          </SafeAreaView>
          <View style={styles.profile}>
            <Identicon diameter={48} address={selectedAddress} />
            <Text style={styles.name}>{account?.name?.name || account?.name}</Text>
            {
              account && (
                <EthereumAddress
                  type={'short'}
                  address={account.address}
                  style={styles.address}
                />
              )
            }
          </View>
          <FlatList
            data={menuItems()}
            keyExtractor={(item) => item.key}
            renderItem={this.renderItem.bind(this)}
            style={{ marginTop: 40 }}
          />
          {this.renderFooter()}
        </View>
      </View>
    )
  }
}

export default inject('store')(observer(VoteDrawer));
