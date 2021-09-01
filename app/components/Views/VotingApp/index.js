import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, Image, FlatList, ScrollView, TouchableOpacity } from 'react-native'
import { strings } from '../../../../locales/i18n';
import { colors } from '../../../styles/common';
import Device from '../../../util/Device';
import RemoteImage from '../../Base/RemoteImage';
import getNavbarOptions from '../../UI/Navbar';
import moment from 'moment';

const styles = StyleSheet.create({
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
    title: 'Past ballots',
    key: 'past',
    users,
  }
]

const OngoingBallot = ({ item }) => {
  const { index } = item;
  const { avatar, name } = item.item;
  console.log('vgar', index, item)
  return (
    <View style={styles.item}>
      <RemoteImage
        fadeIn
        resizeMode='contain'
        source={{ uri: avatar }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{name}</Text>
      <Text style={styles.sectionIndex}>{strings('voting.section')} {index}</Text>
      <Image source={{ uri: 'licoin.png' }} style={styles.vote} />
    </View>
  );
};
const ComingBallot = ({ item }) => {
  const { avatar, name } = item.item;
  return (
    <View style={styles.item}>
      <RemoteImage
        fadeIn
        resizeMode='contain'
        source={{ uri: avatar }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{name}</Text>
      <Text>{moment().format('MMM DD YYYY')}</Text>
    </View>
  );
};
const PastBallot = ({ item }) => {
  const { avatar, name } = item.item;
  return (
    <View style={styles.item}>
      <RemoteImage
        fadeIn
        resizeMode='contain'
        source={{ uri: avatar }}
        style={styles.avatar}
      />
      <Text style={styles.name}>{name}</Text>
      <Text>{moment().format('MMM DD YYYY')}</Text>
    </View>
  );
};


export class VotingApp extends PureComponent {
  static navigationOptions = ({ navigation }) => {
    return getNavbarOptions('voting.title', navigation, true);
  };

  app = {};

  constructor(props) {
    super(props);
    makeObservable(this, {
      app: observable,
    })

    this.prefs = props.store;
    const { params } = props.navigation.state;
    this.app = params.app;
  }

  renderItem(item, section) {
    switch (section) {
      case 0:
        return <OngoingBallot item={item} />;
      case 1:
        return <ComingBallot item={item} />;
      case 2:
        return <PastBallot item={item} />;
    }
  }

  render() {
    const { name, application } = this.app;
    const { iconUrl } = application;
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={'padding'}
        keyboardVerticalOffset={120}
        enabled={Device.isIos()}
      >
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
              return (
                <View style={styles.section}>
                  <Text style={styles.sectionHeading}>
                    {section.title}
                  </Text>
                  <FlatList
                    data={section.users}
                    keyExtractor={(item) => item.toString()}
                    renderItem={(data) => this.renderItem(data, index)}
                    style={styles.optionList}
                  />
                </View>
              );
            })
          }
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

export default inject('store')(observer(VotingApp));
