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
  addIcon: {
    color: colors.orange
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


export class Proposals extends PureComponent {
  static navigationOptions = () => ({ header: null });

  proposals = [];
  searchQuery = '';

  constructor(props) {
    super(props);
    makeObservable(this, {
      proposals: observable,
      searchQuery: observable,
    })

    this.prefs = props.store;
  }

  componentDidMount() {
    this.fetchProposals();
  }

  onMenu = () => {
    this.drawer && this.drawer.open();
  }

  async fetchProposals() {
    const app = await preferences.getCurrentApp();
    const voteInstance = app.instance;
    const voterId = app.voterId;

    APIService.getVoteProposals(voteInstance.uuid, voterId,
      (success, json) => {
        this.proposals = [...json];
      })
  }

  addProposal() {
    this.props.navigation.navigate('VoteProposalAddEdit')
  }

  openProposal(proposal) {
    this.props.navigation.navigate('VoteProposalDetails', { proposal })
  }

  renderItem({ item }) {
    const { title, creationDate } = item;

    return (
      <TouchableOpacity style={styles.item}
        activeOpacity={0.6}
        onPress={() => this.openProposal(item)}
      >
        <RemoteImage
          fadeIn
          resizeMode='contain'
          source={{ uri: 'licoin.png' }}
          style={styles.avatar}
        />
        <Text style={styles.name} numberOfLines={2}>{title}</Text>
        <Text>{moment(creationDate.epochSecond * 1000).format('MMM DD YYYY')}</Text>
      </TouchableOpacity>
    );
  }

  handleSearch = text => {
    this.searchQuery = text;
  };

  filterItems = () => {
    const query = this.searchQuery.toLocaleLowerCase();

    return this.proposals.filter(e => {
      const endTime = e.creationDate.epochSecond * 1000;
      const date = moment(endTime).format('MMM DD YYYY');

      return e.title.toLocaleLowerCase().includes(query)
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
          <NavbarTitle title={'voting.manage_proposals'} disableNetwork />
          <TouchableOpacity onPress={this.addProposal.bind(this)} style={styles.navButton}>
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

  render() {
    const { navigation } = this.props;

    return (
      <Drawer
        ref={e => this.drawer = e}
        type={'overlay'}
        content={<VoteDrawer drawer={this.drawer} navigation={navigation} menuKey={'proposals'} />}
        openDrawerOffset={screenWidth - 200}
        tapToClose={true}
      >
        <KeyboardAvoidingView
          style={{ flex: 1 }}
          behavior={'padding'}
          keyboardVerticalOffset={120}
          enabled={Device.isIos()}
        >
          {this.renderNavBar()}

          <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
            <View style={styles.searchSection}>
              {!this.searchQuery &&
                <View style={styles.placeHolder}>
                  <Icon name={'search'} size={22} style={styles.icon} color={colors.grey300} />
                  <Text style={styles.placeHolderText}>{strings('voting.search_proposals')}</Text>
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
              <FlatList
                style={styles.list}
                data={this.filterItems()}
                keyExtractor={(item) => item.uuid}
                renderItem={(data) => this.renderItem(data)}
              />
            </View>

          </ScrollView>
        </KeyboardAvoidingView>
      </Drawer>
    );
  }
}

export default inject('store')(observer(Proposals));
