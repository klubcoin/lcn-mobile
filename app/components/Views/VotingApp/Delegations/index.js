import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, FlatList, ScrollView, TouchableOpacity, Dimensions, TextInput } from 'react-native'
import Drawer from 'react-native-drawer'
import { strings } from '../../../../../locales/i18n';
import { colors } from '../../../../styles/common';
import Device from '../../../../util/Device';
import RemoteImage from '../../../Base/RemoteImage';
import APIService from '../../../../services/APIService';
import preferences from '../../../../store/preferences';
import VoteDrawer from '../Drawer';
import NavbarTitle from '../../../UI/NavbarTitle';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import moment from 'moment';
import Toast from 'react-native-toast-message';
import ConfirmModal from '../../../UI/ConfirmModal';

const window = Dimensions.get('window');
const screenWidth = window.width;

const styles = StyleSheet.create({
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: colors.blue
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  section: {
    paddingHorizontal: 30,
    marginBottom: 30,
  },
  sectionTitle: {
    marginBottom: 20,
    fontSize: 22,
    fontWeight: '600',
  },
  avatar: {
    width: 30,
    height: 30,
  },
  name: {
    flex: 1,
    marginLeft: 10,
    fontWeight: '700',
    fontSize: 14,
    color: colors.grey700,
  },
  searchSection: {
    backgroundColor: '#EEF0F2',
    marginHorizontal: 20,
    marginTop: 20,
    marginBottom: 30,
    borderRadius: 4,
    height: 48,
  },
  placeHolder: {
    position: 'absolute',
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 12,
  },
  placeHolderText: {
    marginLeft: 8,
    fontSize: 16,
    color: colors.grey600,
  },
  textInput: {
    flex: 1,
    paddingHorizontal: 10,
    fontSize: 16,
  }
});


export class Delegations extends PureComponent {
  static navigationOptions = () => ({ header: null });

  delegations = [];
  searchQuery = '';
  confirmDeleteVisible = false;

  constructor(props) {
    super(props);
    makeObservable(this, {
      delegations: observable,
      searchQuery: observable,
      confirmDeleteVisible: observable,
    })

    this.prefs = props.store;
  }

  componentDidMount() {
    this.fetchDelegations();
  }

  onMenu = () => {
    this.drawer && this.drawer.open();
  }

  async fetchDelegations() {
    const app = await preferences.getCurrentApp();
    const voteInstance = app.instance;
    const voterId = app.voterId;

    APIService.getVoteDelegations((success, json) => {
      this.delegations = [...json];
    })
  }

  addDelegation() {
    this.props.navigation.navigate('VoteDelegationAddEdit', { onUpdate: () => this.fetchDelegations() })
  }

  editDelegation(delegation) {
    this.props.navigation.navigate('VoteDelegationAddEdit', { delegation, onUpdate: () => this.fetchDelegations() })
  }

  deleteDelegation(item) {
    this.itemToDelete = item;
    this.confirmDeleteVisible = true;
  }

  openDelegation(delegation) {
    this.props.navigation.navigate('VoteDelegationDetails', { delegation })
  }

  showNotice(message, type) {
    Toast.show({
      type: type || 'error',
      text1: message,
      text2: strings('profile.notice'),
      visibilityTime: 1000
    });
  }

  onDelete() {
    const uuid = this.itemToDelete.uuid;
    this.confirmDeleteVisible = false;

    APIService.deleteVoteDelegation(uuid, (success, json) => {
      if (success) {
        this.removeFromList(this.itemToDelete);
      } else {
        this.showNotice(json.error);
      }
    })
  }

  removeFromList(itemToDelete) {
    const removeIndex = this.delegations.indexOf(itemToDelete);
    this.delegations.splice(removeIndex, 1);
    this.setState({});
  }

  renderActiveItem({ item }) {
    const { category, toDate } = item;

    return (
      <TouchableOpacity style={styles.item}
        activeOpacity={0.6}
        onPress={() => this.openDelegation(item)}
      >
        <RemoteImage
          fadeIn
          resizeMode='contain'
          source={{ uri: 'licoin.png' }}
          style={styles.avatar}
        />
        <Text style={styles.name} numberOfLines={2}>{category}</Text>
        <Text>{moment(toDate).format('MMM DD YYYY')}</Text>
        <TouchableOpacity onPress={() => this.editDelegation(item)} style={styles.navButton}>
          <Icon
            name={'pencil'}
            size={16}
            style={styles.addIcon}
          />
        </TouchableOpacity>
        <TouchableOpacity onPress={() => this.deleteDelegation(item)} style={styles.navButton}>
          <Icon
            name={'trash'}
            size={16}
            style={styles.addIcon}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  renderInactiveItem({ item }) {
    const { category, toDate } = item;

    return (
      <TouchableOpacity style={styles.item}
        activeOpacity={0.6}
        onPress={() => this.openDelegation(item)}
      >
        <RemoteImage
          fadeIn
          resizeMode='contain'
          source={{ uri: 'licoin.png' }}
          style={styles.avatar}
        />
        <Text style={styles.name} numberOfLines={2}>{category}</Text>
        <Text>{moment(toDate).format('MMM DD YYYY')}</Text>
        <TouchableOpacity onPress={() => this.editDelegation(item)} style={styles.navButton}>
          <Icon
            name={'pencil'}
            size={16}
            style={styles.addIcon}
          />
        </TouchableOpacity>
      </TouchableOpacity>
    );
  }

  handleSearch = text => {
    this.searchQuery = text;
  };

  filterItems = () => {
    const query = this.searchQuery.toLocaleLowerCase();

    return this.delegations.filter(e => {
      const endTime = e.toDate;
      const date = moment(endTime).format('MMM DD YYYY');

      return e.category.toLocaleLowerCase().includes(query)
        || date.toLocaleLowerCase().includes(query);
    })
  };

  renderNavBar() {
    return (
      <SafeAreaView >
        <View style={styles.navBar}>
          <TouchableOpacity onPress={this.onMenu.bind(this)} style={styles.navButton}>
            <Icon
              name={'bars'}
              size={16}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <NavbarTitle title={'voting.manage_delegations'} disableNetwork />
          <TouchableOpacity onPress={this.addDelegation.bind(this)} style={styles.navButton}>
            <Icon
              name={'plus'}
              size={16}
              style={styles.addIcon}
              color={colors.orange}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  renderConfirmDelete() {
    return (
      <ConfirmModal
        visible={this.confirmDeleteVisible}
        title={strings('proposal.delete')}
        message={strings('proposal.confirm_delete_message')}
        confirmLabel={strings('proposal.yes')}
        cancelLabel={strings('proposal.no')}
        onConfirm={() => this.onDelete()}
        hideModal={() => this.confirmDeleteVisible = false}
      />
    )
  }

  render() {
    const { navigation } = this.props;
    const filteredItems = this.filterItems();

    return (
      <Drawer
        ref={e => this.drawer = e}
        type={'overlay'}
        content={<VoteDrawer drawer={this.drawer} navigation={navigation} menuKey={'delegations'} />}
        openDrawerOffset={screenWidth - 200}
        tapToClose={true}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={'padding'}
          enabled={Device.isIos()}
        >
          {this.renderNavBar()}

          <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            <View style={styles.searchSection}>
              {!this.searchQuery &&
                <View style={styles.placeHolder}>
                  <Icon name={'search'} size={22} style={styles.icon} color={colors.grey300} />
                  <Text style={styles.placeHolderText}>{strings('voting.search_delegations')}</Text>
                </View>
              }
              <TextInput
                style={styles.textInput}
                value={this.searchQuery}
                placeholderTextColor={colors.grey100}
                onChangeText={this.handleSearch}
              />
            </View>

            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{strings('voting.active_delegations')}</Text>
              <FlatList
                style={styles.list}
                data={filteredItems}
                keyExtractor={(item) => item.uuid}
                renderItem={(data) => this.renderActiveItem(data)}
              />
            </View>
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>{strings('voting.inactive_delegations')}</Text>
              <FlatList
                style={styles.list}
                data={filteredItems}
                keyExtractor={(item) => item.uuid}
                renderItem={(data) => this.renderInactiveItem(data)}
              />
            </View>
          </ScrollView>
          {this.renderConfirmDelete()}
        </KeyboardAvoidingView>
      </Drawer>
    );
  }
}

export default inject('store')(observer(Delegations));
