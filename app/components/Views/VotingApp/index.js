import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Image, FlatList, ScrollView, TouchableOpacity } from 'react-native'
import Drawer from 'react-native-drawer'
import { strings } from '../../../../locales/i18n';
import { colors } from '../../../styles/common';
import Device from '../../../util/Device';
import RemoteImage from '../../Base/RemoteImage';
import { getVoteAppNavbar } from '../../UI/Navbar';
import moment from 'moment';
import APIService from '../../../services/APIService';
import preferences from '../../../store/preferences';
import VoteDrawer from './Drawer';
import NavbarTitle from '../../UI/NavbarTitle';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';

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
    title: 'Ongoing ballots',
    key: 'ongoing',
    users,
  },
  {
    title: 'Coming ballots',
    key: 'coming',
    users,
  },
  {
    title: 'Proposals',
    key: 'proposal',
    data: [],
  },
  {
    title: 'Past ballots',
    key: 'past',
    users,
  }
]

const OngoingBallot = ({ item, voteInstance }) => {
  const { index } = item;
  const { avatar, title } = item.item;
  const { application } = voteInstance || {};
  return (
    <View style={styles.item}>
      <RemoteImage
        fadeIn
        resizeMode='contain'
        source={{ uri: application?.iconUrl }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{title}</Text>
      <Text style={styles.sectionIndex}>{strings('voting.section')} {index}</Text>
      <Image source={{ uri: 'licoin.png' }} style={styles.vote} />
    </View>
  );
};

const ComingBallot = ({ item, voteInstance }) => {
  const { voteStartDate, title } = item.item;
  const { application } = voteInstance || {};
  return (
    <View style={styles.item}>
      <RemoteImage
        fadeIn
        resizeMode='contain'
        source={{ uri: application?.iconUrl }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{title}</Text>
      <Text>{moment(voteStartDate.epochSecond * 1000).format('MMM DD YYYY')}</Text>
    </View>
  );
};

const Proposal = ({ item, voteInstance, onTap }) => {
  const { index } = item;
  const { title } = item.item;
  const { application } = voteInstance || {};
  console.log('voteInstance', JSON.parse(JSON.stringify(application)))
  return (
    <TouchableOpacity style={styles.item} onPress={onTap}>
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

const PastBallot = ({ item, voteInstance }) => {
  const { voteEndDate, title } = item.item;
  const { application } = voteInstance || {};
  return (
    <TouchableOpacity style={styles.item}>
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
    this.fetchProposals();
    this.fetchVotes();
  }

  onBack = () => {
    this.drawer && this.drawer.open();
  }

  async fetchProposals() {
    const voteInstance = await preferences.getVoteInstance();
    const voterId = await preferences.getVoterId();

    this.voteInstance = voteInstance;
    this.voterId = voterId;
    this.app = voteInstance.application;

    APIService.getVoteProposals(voteInstance.uuid, voterId,
      (success, json) => {
        this.proposals = [...json];
        this.openProposals = json.filter(e => e.status == 'OPEN');
        console.warn('openProposals', JSON.parse(JSON.stringify(this.openProposals)))

      })
  }

  async fetchVotes() {
    const voteInstance = await preferences.getVoteInstance();
    const voterId = await preferences.getVoterId();

    APIService.getVoteList(voteInstance.uuid, voterId,
      (success, json) => {
        console.warn('fetchVotes', json)
        this.votes = [...json];
        const currentTime = moment().unix();
        this.ongoingVotes = json.filter(e => e.voteStartDate.epochSecond < currentTime && currentTime < e.voteEndDate.epochSecond);
        this.comingVotes = json.filter(e => currentTime < e.voteStartDate.epochSecond);
        this.pastVotes = json.filter(e => currentTime > e.voteEndDate.epochSecond);
      })
  }

  openProposal(proposal) {
    //this.props.navigation.navigate('Proposal', { proposal })
    console.log('appro', JSON.stringify(proposal))
    APIService.approveVoteProposal(proposal.uuid, this.voterId, (success, json) => {
      console.warn('approve', json)
    })
  }

  dataForSection(key) {
    return ({
      proposal: this.openProposals,
      ongoing: this.ongoingVotes,
      coming: this.comingVotes,
      past: this.pastVotes
    })[key];
  }

  renderItem(item, section) {
    switch (section) {
      case 0:
        return <OngoingBallot item={item} voteInstance={this.voteInstance} />;
      case 1:
        return <ComingBallot item={item} voteInstance={this.voteInstance} />;
      case 2:
        return <Proposal item={item} voteInstance={this.voteInstance}
          onTap={() => this.openProposal(item.item)} />;
      case 3:
        return <PastBallot item={item} voteInstance={this.voteInstance} />;
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
    const { name } = this.app;
    const { application } = this.voteInstance || {};
    const { iconUrl } = application || {};
    return (
      <Drawer
        ref={e => this.drawer = e}
        type={'overlay'}
        content={<VoteDrawer drawer={this.drawer} />}
        openDrawerOffset={100}
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
