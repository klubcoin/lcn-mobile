import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import React, { PureComponent } from 'react'
import { View, Text, StyleSheet, KeyboardAvoidingView, ScrollView, TouchableOpacity, } from 'react-native'
import { strings } from '../../../../../locales/i18n';
import { colors, fontStyles } from '../../../../styles/common';
import Device from '../../../../util/Device';
import APIService from '../../../../services/APIService';
import preferences from '../../../../store/preferences';
import NavbarTitle from '../../../UI/NavbarTitle';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome';
import StyledButton from '../../../UI/StyledButton';
import ModalSelector from '../../../UI/AddCustomTokenOrApp/ModalSelector';
import { TextInput } from 'react-native-gesture-handler';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';


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
  selectOption: {
    flexDirection: 'row',
    marginHorizontal: 20,
    borderWidth: StyleSheet.hairlineWidth,
    borderRadius: 4,
    borderColor: colors.grey300,
    alignItems: 'center',
    marginTop: 8,
  },
  option: {
    flex: 1,
    padding: 10,
  },
  dropdownIcon: {
    marginHorizontal: 10,
    alignSelf: 'center',
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
  },
  buttons: {
    flexDirection: 'row',
    justifyContent: 'center',
    marginTop: 30,
  },
  save: {
    width: 140,
  },
  cancel: {
    width: 140,
    marginLeft: 20,
  }
});

export class ProposalAddEdit extends PureComponent {
  static navigationOptions = () => ({ header: null });

  categories = [];
  voteTypes = [];
  category = '';
  showCategories = false;
  type = '';
  showTypes = false;
  title = '';
  content = '';

  constructor(props) {
    super(props);
    makeObservable(this, {
      category: observable,
      categories: observable,
      showCategories: observable,
      type: observable,
      voteTypes: observable,
      showTypes: observable,
      title: observable,
      content: observable,
    })

    this.prefs = props.store;
    this.proposal = props.navigation.getParam('proposal');

    const { uuid, category, title, content, type } = this.proposal || {};
    this.category = category;
    this.title = title;
    this.content = content;
    this.type = type;
    this.uuid = uuid;

    // this.voteTypes = [this.type];
  }

  componentDidMount() {
    this.fetchData()
  }

  async addProposal() {
    const app = await preferences.getCurrentApp();
    const voteInstance = app.instance;

    APIService.createVoteProposal({
      liquivoteInstance: voteInstance.uuid,
      category: this.category,
      title: this.title,
      content: this.content,
    }, (success, json) => {
      if (success && Array.isArray(json)) {
        this.showNotice(strings('proposal.saved_successfully'), 'success');
        const onUpdate = this.props.navigation.getParam('onUpdate');
        if (onUpdate) onUpdate([json[0]]);
        this.onBack();
      } else {
        alert(JSON.stringify(json));
      }
    })
  }

  async fetchData() {
    const app = await preferences.getCurrentApp();
    const voteInstance = app.instance;
    this.categories = [...voteInstance.delegationCategories];
  }

  onBack = () => {
    this.props.navigation.goBack();
  }

  showNotice(message, type) {
    Toast.show({
      type: type || 'error',
      text1: message,
      text2: strings('profile.notice'),
      visibilityTime: 1000
    });
  }

  onSave() {
    if (!this.category) {
      return this.showNotice(strings('proposal.missing_category'));
    }
    if (!this.title) {
      return this.showNotice(strings('proposal.missing_title'));
    }
    if (!this.content) {
      return this.showNotice(strings('proposal.missing_content'));
    }

    this.addProposal();
  }

  onDelete() {
    APIService.deleteVoteProposal(this.uuid, (success, json) => {
      if (success) {
        const onDelete = this.props.navigation.getParam('onDelete');
        if (onDelete) onDelete();
        this.onBack();
      } else {
        this.showNotice(json.error);
      }
    })
  }

  onCancel() {
    this.onBack();
  }

  renderCategoryModal = () => {
    const options = this.categories.map(e => ({
      key: e,
      value: e,
    }));

    return (
      <ModalSelector
        visible={!!this.showCategories}
        options={options}
        hideKey={true}
        onSelect={(item) => {
          this.category = item.value;
          this.showCategories = false;
        }}
        onClose={() => this.showCategories = false}
      />
    );
  };

  renderVoteTypeModal = () => {
    const options = this.voteTypes.map(e => ({
      key: e.shortCode,
      value: e.name,
    }));

    return (
      <ModalSelector
        visible={this.showTypes}
        options={options}
        hideKey={true}
        onSelect={(item) => {
          this.type = e.value;
          this.showTypes = false;
        }}
        onClose={() => this.showTypes = false}
      />
    );
  };

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

  renderSelector({ selected, onTap }) {
    const value = selected;

    return (
      <TouchableOpacity
        style={styles.selectOption}
        activeOpacity={0.8}
        onPress={() => onTap && onTap()}
      >
        <Text style={[fontStyles.normal, styles.option]}>
          {value}
        </Text>
        <FontAwesome
          name={'caret-down'}
          size={20}
          style={styles.dropdownIcon}
        />
      </TouchableOpacity>
    )
  }

  render() {
    const editing = !!this.uuid;

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
          {this.renderSelector({
            selected: this.category,
            onTap: () => this.showCategories = true
          })}

          <Text style={styles.heading}>{strings('voting.vote_type')}</Text>
          {this.renderSelector({
            selected: this.type,
            onTap: () => this.showTypes = true
          })}

          <Text style={styles.heading}>{strings('voting.propsal_title')}</Text>
          <TextInput
            value={this.title}
            onChangeText={text => this.title = text}
            style={{
              height: 36,
              marginTop: 10,
              paddingHorizontal: 10,
              marginHorizontal: 20,
              borderRadius: 4,
              borderColor: colors.grey400,
              borderWidth: StyleSheet.hairlineWidth,
            }}
          />

          <Text style={styles.heading}>{strings('voting.proposal_content')}</Text>
          <TextInput
            multiline={true}
            numberOfLines={5}
            value={this.content}
            onChangeText={text => this.content = text}
            style={{
              height: 100,
              marginTop: 10,
              paddingHorizontal: 10,
              marginHorizontal: 20,
              borderRadius: 4,
              borderColor: colors.grey400,
              borderWidth: StyleSheet.hairlineWidth,
            }}
          />

          <View style={styles.buttons}>
            <StyledButton
              type={'confirm'}
              containerStyle={styles.save}
              onPress={this.onSave.bind(this)}
            >
              {strings('voting.save')}
            </StyledButton>
            {editing ?
              <StyledButton
                type={'danger'}
                containerStyle={styles.cancel}
                onPress={this.onDelete.bind(this)}
              >
                {strings('proposal.delete')}
              </StyledButton> :
              <StyledButton
                type={'normal'}
                containerStyle={styles.cancel}
                onPress={this.onCancel.bind(this)}
              >
                {strings('voting.cancel')}
              </StyledButton>
            }
          </View>
        </ScrollView>

        {this.renderCategoryModal()}
        {this.renderVoteTypeModal()}
      </KeyboardAvoidingView>
    );
  }
}

export default inject('store')(observer(ProposalAddEdit));
