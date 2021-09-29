import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, TouchableOpacity, } from 'react-native'
import { strings } from '../../../../../locales/i18n';
import { colors } from '../../../../styles/common';
import Device from '../../../../util/Device';
import APIService from '../../../../services/APIService';
import preferences from '../../../../store/preferences';
import NavbarTitle from '../../../UI/NavbarTitle';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import StyledButton from '../../../UI/StyledButton';


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
  headingTitle: {
    fontSize: 24,
    fontWeight: '600',
    color: colors.grey,
    marginTop: 20,
    paddingHorizontal: 10,
  },
  line: {
    height: 1,
    backgroundColor: colors.grey100,
    marginHorizontal: 40,
    marginVertical: 20,
  },
  heading: {
    paddingHorizontal: 20,
    marginTop: 15,
    fontSize: 16,
    fontWeight: '600'
  },
  content: {
    marginTop: 10,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    fontSize: 16,
  },
  approve: {
    width: 240,
    marginTop: 30,
    alignSelf: 'center',
  }
});

export class ProposalDetails extends PureComponent {
  static navigationOptions = () => ({ header: null });

  category = '';
  type = '';
  title = '';
  content = '';
  canApprove = false;

  constructor(props) {
    super(props);
    makeObservable(this, {
      category: observable,
      type: observable,
      title: observable,
      content: observable,
      canApprove: observable,
    })

    this.prefs = props.store;
    this.proposal = props.navigation.getParam('proposal');

    const { category, title, content } = this.proposal || {};
    this.category = category;
    this.title = title;
    this.content = content;
  }

  componentDidMount() {
    this.readApprovalStatus()
  }

  async readApprovalStatus() {
    const app = await preferences.getCurrentApp();
    const voterId = app.voterId;

    const { approvals, status } = this.proposal || {};
    this.canApprove = status == 'OPEN' && !approvals.find(e => e.uuid == voterId);
  }

  onBack = () => {
    this.props.navigation.goBack();
  }

  onEdit = () => {
    const onUpdate = this.props.navigation.getParam('onUpdate');
    const onDelete = () => {
      if (onUpdate) onUpdate();
      this.onBack();
    }
    this.props.navigation.navigate('VoteProposalAddEdit', { proposal: this.proposal, onUpdate: this.onUpdate, onDelete })
  }

  onUpdate = (proposal) => {
    const { category, title, content } = proposal.properties;
    this.category = category;
    this.title = title;
    this.content = content;

    const onUpdate = this.props.navigation.getParam('onUpdate');
    if (onUpdate) onUpdate();
  }

  async approveProposal() {
    const app = await preferences.getCurrentApp();
    const voterId = app.voterId;

    APIService.approveVoteProposal(this.proposal.uuid, voterId, (success, json) => {
      if (success && !json.error) {
        alert(strings('voting.thanks_for_approving'));
        this.canApprove = false;
      } else {
        alert(json.error);
      }
    })
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
          <TouchableOpacity onPress={this.onEdit.bind(this)} style={styles.navButton}>
            <Icon
              name={'edit'}
              size={16}
              style={styles.backIcon}
            />
          </TouchableOpacity>
        </View>
      </SafeAreaView>
    )
  }

  render() {
    const canApprove = this.canApprove;

    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={'padding'}
        enabled={Device.isIos()}
      >
        {this.renderNavBar()}
        <ScrollView contentContainerStyle={{ paddingBottom: 80, }}>
          <Text style={styles.headingTitle}>{strings('voting.proposal')}</Text>
          <View style={styles.line} />

          <Text style={styles.heading}>{strings('voting.categories_proposal_applies_to')}</Text>
          <Text style={styles.content}>{this.category}</Text>

          <Text style={styles.heading}>{strings('voting.vote_type')}</Text>
          <Text style={styles.content}>{this.type}</Text>

          <Text style={styles.heading}>{strings('voting.propsal_title')}</Text>
          <Text style={styles.content}>{this.title}</Text>

          <Text style={styles.heading}>{strings('voting.proposal_content')}</Text>
          <Text style={styles.content}>{this.content}</Text>

          {canApprove &&
            <StyledButton
              type={'confirm'}
              containerStyle={styles.approve}
              onPress={this.approveProposal.bind(this)}
            >
              {strings('voting.approve')}
            </StyledButton>
          }
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

export default inject('store')(observer(ProposalDetails));
