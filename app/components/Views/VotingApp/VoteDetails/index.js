import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, TouchableOpacity } from 'react-native'
import { strings } from '../../../../../locales/i18n';
import { colors } from '../../../../styles/common';
import Device from '../../../../util/Device';
import moment from 'moment';
import NavbarTitle from '../../../UI/NavbarTitle';
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
    color: colors.orange,
  },
  heading: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.grey,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  title: {
    marginLeft: 10,
    fontWeight: '600',
  },
  resoTitle: {
    marginTop: 15,
    marginLeft: 40,
  },
  status: {
    fontWeight: 'bold',
    color: colors.orange,
    marginLeft: 10,
  },
  row: {
    marginTop: 20,
    marginLeft: 20,
    flexDirection: 'row',
  },
  resolutions: {
    marginTop: 30,
  },
  resolution: {
    alignItems: 'center',
  },
  button: {
    paddingVertical: 8,
    width: 280,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 4,
    borderWidth: StyleSheet.hairlineWidth,
    marginVertical: 15,
  },
  buttonText: {
    color: colors.white,
    fontWeight: '600'
  }
});

const options = [
  {
    title: strings('voting.i_accept_resolution'),
    color: '#11DB0D',
  },
  {
    title: strings('voting.i_refuse_resolution'),
    color: '#FF3823',
  },
  {
    title: strings('voting.i_dont_want_to_vote'),
    color: '#CFCFCF'
  }
];

export class VoteDetails extends PureComponent {
  static navigationOptions = () => ({ header: null });

  constructor(props) {
    super(props);
    this.vote = this.props.navigation.getParam('vote');
  }

  onBack = () => {
    this.props.navigation.goBack();
  }

  acceptVote() {

  }

  refuseVote() {

  }

  ignoreVote() {

  }

  handleVote(index) {
    switch (index) {
      case 0:
        this.acceptVote();
        break;
      case 1:
        this.refuseVote();
        break;
      default:
        this.ignoreVote();
    }
  }

  renderResolutions() {
    return (
      <View style={styles.resolutions}>
        {
          options.map((e, index) => {
            const { title, color } = e;
            const backgroundColor = color;

            return (
              <View style={styles.resolution}>
                <TouchableOpacity
                  style={[styles.button, { backgroundColor }]}
                  activeOpacity={0.8}
                  onPress={() => this.handleVote(index)}>
                  <Text style={styles.buttonText}>{title}</Text>
                </TouchableOpacity>
              </View>
            )
          })
        }
      </View>
    )
  }

  renderNavBar() {
    return (
      <SafeAreaView >
        <View style={styles.navBar}>
          <TouchableOpacity onPress={this.onBack.bind(this)} style={styles.navButton}>
            <Icon
              name={'arrow-left'}
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
    const { title, voteStartDate, voteEndDate } = this.vote || {};
    const startTime = voteStartDate.epochSecond * 1000;
    const endTime = voteEndDate.epochSecond * 1000;
    const dateFormat = 'MMM DD YYYY HH:mm:ss';

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={'padding'}
        enabled={Device.isIos()}
      >
        {this.renderNavBar()}
        <ScrollView contentContainerStyle={{ paddingBottom: 80 }}>
          <Text style={styles.heading}>{strings('voting.vote')}</Text>

          <View style={styles.row}>
            <Text style={styles.title}>{strings('voting.resolution_title')}</Text>
          </View>
          <Text style={styles.resoTitle}>{title}</Text>

          <View style={styles.row}>
            <Text style={styles.title}>{strings('voting.resolution')}</Text>
            <Text style={styles.status}>{'complete'}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.title}>{strings('voting.vote_start_date')}:</Text>
            <Text style={styles.title}>{moment(startTime).format(dateFormat)}</Text>
          </View>

          <View style={styles.row}>
            <Text style={styles.title}>{strings('voting.vote_end_date')}:</Text>
            <Text style={styles.title}>{moment(endTime).format(dateFormat)}</Text>
          </View>

          <View style={[styles.row, { marginTop: 30 }]}>
            <Text style={styles.title}>{strings('voting.cast_your_vote')}:</Text>
          </View>
          {this.renderResolutions()}
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

export default inject('store')(observer(VoteDetails));
