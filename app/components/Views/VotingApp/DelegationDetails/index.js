import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react'
import moment from 'moment';
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, TouchableOpacity, } from 'react-native'
import { strings } from '../../../../../locales/i18n';
import { colors } from '../../../../styles/common';
import Device from '../../../../util/Device';
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
});

export class DelegationDetails extends PureComponent {
  static navigationOptions = () => ({ header: null });

  delegatedTo = '';
  category = '';
  fromDate = '';
  toDate = '';

  constructor(props) {
    super(props);
    makeObservable(this, {
      delegatedTo: observable,
      category: observable,
      fromDate: observable,
      toDate: observable,
    })

    this.prefs = props.store;
    this.delegation = props.navigation.getParam('delegation');

    const { delegatedTo, category, fromDate, toDate } = this.delegation || {};
    this.delegatedTo = delegatedTo;
    this.category = category;
    this.fromDate = moment(fromDate).format('MMM DD YYYY');
    this.toDate = moment(toDate).format('MMM DD YYYY');
  }

  onBack = () => {
    this.props.navigation.goBack();
  }

  onEdit = () => {
    this.props.navigation.navigate('VoteDelegationAddEdit', { delegation: this.delegation })
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
    return (
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={'padding'}
        enabled={Device.isIos()}
      >
        {this.renderNavBar()}
        <ScrollView contentContainerStyle={{ paddingBottom: 80, }}>
          <Text style={styles.headingTitle}>{strings('voting.delegation')}</Text>
          <View style={styles.line} />

          <Text style={styles.heading}>{strings('voting.delegee')}</Text>
          <Text style={styles.content}>{this.delegatedTo}</Text>

          <Text style={styles.heading}>{strings('voting.category')}</Text>
          <Text style={styles.content}>{this.category}</Text>

          <Text style={styles.heading}>{strings('voting.from')}</Text>
          <Text style={styles.content}>{this.fromDate}</Text>

          <Text style={styles.heading}>{strings('voting.to')}</Text>
          <Text style={styles.content}>{this.toDate}</Text>
        </ScrollView>
      </KeyboardAvoidingView>
    );
  }
}

export default inject('store')(observer(DelegationDetails));
