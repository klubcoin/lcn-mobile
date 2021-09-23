import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Image, FlatList, ScrollView, TouchableOpacity, Dimensions } from 'react-native'
import Drawer from 'react-native-drawer'
import { strings } from '../../../../locales/i18n';
import { colors } from '../../../styles/common';
import Device from '../../../util/Device';
import RemoteImage from '../../Base/RemoteImage';
import moment from 'moment';
import APIService from '../../../services/APIService';
import preferences from '../../../store/preferences';
import VoteDrawer from './Drawer';
import NavbarTitle from '../../UI/NavbarTitle';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

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
  logo: {
    width: 60,
    height: 60
  },
  row: {
    flex: 1,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  title: {

  },
  lawbook: {

  },
  header: {
    flex: 1,
    alignItems: 'center',
    marginTop: 30,
  },
  heading: {
    marginTop: 5,
    flexDirection: 'row',
    justifyContent: 'center',
  },
  item: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 10,
  },
  title: {
    fontSize: 14,
    color: colors.grey500,
    fontWeight: '600',
    textTransform: 'capitalize',
  },
  lawbook: {
    marginLeft: 8,
    fontWeight: '700',
    color: colors.orange,
  },
  section: {
    paddingHorizontal: 30,
  },
  sectionHeading: {
    color: colors.black,
    fontWeight: '700',
    fontSize: 22,
    marginTop: 30,
    marginBottom: 10,
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
  sectionIndex: {
    fontSize: 12,
    color: colors.grey600,
    fontWeight: '600',
  },
  vote: {
    width: 22,
    height: 22,
    marginLeft: 10,
  }
});

const users = [
  {
    avatar: 'licoin.png',
    name: 'user 1',
  },
  {
    avatar: 'licoin.png',
    name: 'user 2',
  },
  {
    avatar: 'licoin.png',
    name: 'user 3',
  },
];

const sections = [
  {
    title: strings('voting.ongoing_votes'),
    key: 'ongoing',
    users,
  },
  {
    title: strings('voting.coming_votes'),
    key: 'coming',
    users,
  },
  {
    title: strings('voting.proposals'),
    key: 'proposal',
    data: [],
  },
  {
    title: strings('voting.past_votes'),
    key: 'past',
    users,
  }
]

const OngoingVote = ({ item, voteInstance, onTap }) => {
  const { index } = item;
  const { avatar, title } = item.item;
  const { application } = voteInstance || {};
  return (
    <TouchableOpacity style={styles.item} onPress={onTap} activeOpacity={0.6}>
      <RemoteImage
        fadeIn
        resizeMode='contain'
        source={{ uri: application?.iconUrl }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{title}</Text>
      <Text style={styles.sectionIndex}>{strings('voting.section')} {index}</Text>
      <Image source={{ uri: 'licoin.png' }} style={styles.vote} />
    </TouchableOpacity>
  );
};

const ComingVote = ({ item, voteInstance, onTap }) => {
  const { voteStartDate, title } = item.item;
  const { application } = voteInstance || {};
  return (
    <TouchableOpacity style={styles.item} onPress={onTap} activeOpacity={0.6}>
      <RemoteImage
        fadeIn
        resizeMode='contain'
        source={{ uri: application?.iconUrl }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{title}</Text>
      <Text>{moment(voteStartDate.epochSecond * 1000).format('MMM DD YYYY')}</Text>
    </TouchableOpacity>
  );
};

const Proposal = ({ item, voteInstance, onTap }) => {
  const { index } = item;
  const { title } = item.item;
  const { application } = voteInstance || {};

  return (
    <TouchableOpacity style={styles.item} onPress={onTap} activeOpacity={0.6}>
      <RemoteImage
        fadeIn
        resizeMode='contain'
        source={{ uri: application?.iconUrl }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{title}</Text>
      <Image source={{ uri: 'licoin.png' }} style={styles.vote} />
    </TouchableOpacity>
  );
};

const PastVote = ({ item, voteInstance, onTap }) => {
  const { voteEndDate, title } = item.item;
  const { application } = voteInstance || {};
  return (
    <TouchableOpacity style={styles.item} onPress={onTap} activeOpacity={0.6}>
      <RemoteImage
        fadeIn
        resizeMode='contain'
        source={{ uri: application?.iconUrl }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{title}</Text>
      <Text>{moment(voteEndDate.epochSecond * 1000).format('MMM DD YYYY')}</Text>
    </TouchableOpacity>
  );
};


export class VotingApp extends PureComponent {
  static navigationOptions = () => ({ header: null });

  app = {};
  proposals = [];
  ongoingVotes = [];
  comingVotes = [];
  pastVotes = [];
  openProposals = [];
  voteInstance = {};

  constructor(props) {
    super(props);
    makeObservable(this, {
      app: observable,
      openProposals: observable,
      voteInstance: observable,
      ongoingVotes: observable,
      comingVotes: observable,
      pastVotes: observable,
    })

    this.prefs = props.store;
    const { params } = props.navigation.state;
    this.app = params.app;
  }

  componentDidMount() {
    this.fetchApp();
  }

  componentDidUpdate(prevProp) {
    if (this.props != prevProp) {
      this.fetchApp();
    }
  }

  onBack = () => {
    this.drawer && this.drawer.open();
  }

  async fetchApp() {
    const app = await preferences.getCurrentApp();

    this.voteInstance = app.instance;
    this.voterId = app.voterId;
    this.app = app.application;

    this.fetchProposals();
    this.fetchVotes();
  }

  async fetchProposals() {
    const voteInstance = this.voteInstance;
    const voterId = this.voterId;

    APIService.getVoteProposals(voteInstance.uuid, voterId,
      (success, json) => {
        this.proposals = [...json];
        this.openProposals = json.filter(e => e.status == 'OPEN');
        console.warn('openProposals', JSON.parse(JSON.stringify(this.openProposals)))

      })
  }

  async fetchVotes() {
    const voteInstance = this.voteInstance;
    const voterId = this.voterId;

    APIService.getVoteList(voteInstance.uuid, voterId,
      (success, json) => {
        this.votes = [...json];
        const currentTime = moment().unix();
        this.ongoingVotes = json.filter(e => e.voteStartDate.epochSecond < currentTime && currentTime < e.voteEndDate.epochSecond);
        this.comingVotes = json.filter(e => currentTime < e.voteStartDate.epochSecond);
        this.pastVotes = json.filter(e => currentTime > e.voteEndDate.epochSecond);
      })
  }

  openProposal(proposal) {
    this.props.navigation.navigate('VoteProposalDetails', { proposal })
  }

  dataForSection(key) {
    return ({
      proposal: this.openProposals,
      ongoing: this.ongoingVotes,
      coming: this.comingVotes,
      past: this.pastVotes
    })[key];
  }

  openVote(vote) {
    this.props.navigation.navigate('VoteDetails', { vote });
  }

  renderItem(item, section) {
    switch (section) {
      case 0:
        return <OngoingVote item={item} voteInstance={this.voteInstance} onTap={() => this.openVote(item.item)} />;
      case 1:
        return <ComingVote item={item} voteInstance={this.voteInstance} onTap={() => this.openVote(item.item)} />;
      case 2:
        return <Proposal item={item} voteInstance={this.voteInstance}
          onTap={() => this.openProposal(item.item)} />;
      case 3:
        return <PastVote item={item} voteInstance={this.voteInstance} onTap={() => this.openVote(item.item)} />;
    }
  }

  renderNavBar() {
    const { application } = this.voteInstance || {};
    return (
      <SafeAreaView >
        <View style={styles.navBar}>
          <TouchableOpacity onPress={this.onBack.bind(this)} style={styles.navButton}>
            <Icon
              name={'bars'}
              size={16}
              style={styles.backIcon}
            />
          </TouchableOpacity>
          <NavbarTitle title={'voting.title'} disableNetwork />
          <View style={styles.navButton} />
        </View>
      </SafeAreaView>
    )
  }

  render() {
    const { navigation } = this.props;
    const { name } = this.app;
    const { application } = this.voteInstance || {};
    const { iconUrl } = application || {};

    return (
      <Drawer
        ref={e => this.drawer = e}
        type={'overlay'}
        content={<VoteDrawer drawer={this.drawer} navigation={navigation} menuKey={'votes'} />}
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
          <ScrollView contentContainerStyle={{ paddingBottom: 80, }}>
            <View style={styles.header}>
              <RemoteImage
                fadeIn
                resizeMode='contain'
                source={{ uri: iconUrl }}
                style={styles.logo}
              />
              <View style={styles.heading}>
                <Text style={styles.title}>{name}</Text>
                <TouchableOpacity activeOpacity={0.6} onPress={() => { }}>
                  <Text style={styles.lawbook}>{strings('voting.see_lawbook')}</Text>
                </TouchableOpacity>
              </View>
            </View>
            {
              sections.map((section, index) => {
                let data = this.dataForSection(section.key);
                return (
                  <View style={styles.section}>
                    <Text style={styles.sectionHeading}>
                      {section.title}
                    </Text>
                    <FlatList
                      data={data}
                      keyExtractor={(item) => item.uuid}
                      renderItem={(data) => this.renderItem(data, index)}
                      style={styles.optionList}
                    />
                  </View>
                );
              })
            }
          </ScrollView>
        </KeyboardAvoidingView>
      </Drawer>
    );
  }
}

export default inject('store')(observer(VotingApp));
