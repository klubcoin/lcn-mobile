import React, { PureComponent } from 'react';
import { FlatList, SafeAreaView, StyleSheet } from 'react-native';
import { colors } from '../../../styles/common';
import { PropTypes } from 'prop-types';
import { strings } from '../../../../locales/i18n';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import { connect } from 'react-redux';
import StyledButton from '../../UI/StyledButton';
import { FriendRequestTypes, LiquichainNameCard } from './FriendRequestMessages'
import CryptoSignature from '../../../core/CryptoSignature'
import base64 from 'base-64';
import Share from 'react-native-share';
import ConfirmModal from '../../UI/ConfirmModal';
import AddressElement from '../SendFlow/AddressElement';
import Messaging, { WSEvent } from '../../../services/Messaging';

const styles = StyleSheet.create({
  wrapper: {
    backgroundColor: colors.white,
    flex: 1
  },
  addContact: {
    marginHorizontal: 24,
    marginBottom: 16
  },
});

const EDIT = 'edit';

/**
 * View that list contacts and friends
 */
class Contacts extends PureComponent {
  static navigationOptions = ({ navigation }) =>
    getNavigationOptionsTitle(strings('app_settings.contacts_title'), navigation);

  static propTypes = {
    /**
     * Map representing the address book
     */
    addressBook: PropTypes.object,
    /**
     * Network id
     */
    network: PropTypes.string
  };

  state = {
    contacts: [],
    confirmDeleteVisible: false,
    friendRequestVisible: false,
    acceptedNameCardVisible: false,
  };

  actionSheet;
  contactToRemove;

  constructor(props) {
    super(props);
    const { selectedAddress } = props;
    this.messaging = new Messaging(selectedAddress);
    this.messaging.on(WSEvent.message, (data) => {
      this.handleWSMessage(data);
    })
  }

  componentDidMount() {
    const { addressBook, network } = this.props;
    const addresses = addressBook[network] || {};
    const contacts = Object.keys(addresses).map(addr => addresses[addr]);
    this.setState({ contacts })

    this.messaging.initConnection();
    this.data = this.props.navigation.getParam('data');
    this.handleFriendRequestUpdate();
  }

  componentDidUpdate = prevProps => {
    if (this.props != prevProps) {
      const data = this.props.navigation.getParam('data');
      if (data && JSON.stringify(this.data) != base64.decode(data)) {
        this.data = data;
        this.handleFriendRequestUpdate();
      }
    }
  };

  componentWillUnmount() {
    this.messaging && this.messaging.disconnect();
  }

  approveFriendRequest(data) {
    this.setState({ friendRequestVisible: true, address: data.from })
  }

  handleAcceptedNameCard(data) {
    this.setState({ acceptedNameCardVisible: true, address: data.from })
  }

  revokeFriend(data) {
    const address = data.from;
    const index = this.state.contacts.findIndex((e) => e.address == address);
    this.state.contacts.splice(index, 1);
    this.setState({ contact: [...this.state.contacts] });
    alert(`${address} revoked friend`);
  }

  validateSignature(data, signature) {
    if (data && data.from && data.data) {
      const sender = CryptoSignature.recoverMessageSignature(data.data, signature);
      return sender == data.from.toLocaleLowerCase();
    }
    return false;
  }

  handleWSMessage(json) {
    try {
      const data = JSON.parse(json);
      if (data && data.data && data.data.from) {
        this.data = data;

        this.handleFriendRequestUpdate();
      }
    } catch (e) { }
  }

  handleFriendRequestUpdate() {
    if (!this.data) return;

    if (!this.data.data) {
      this.data = JSON.parse(base64.decode(this.data));
    }

    const json = this.data;

    // verify message signature
    const { data, signature } = json || {};

    if (data && data.data) {
      const payload = JSON.parse(data.data);
      if (payload.message?.type == FriendRequestTypes.Request) {
        if (!this.validateSignature(data, signature)) {
          alert(strings('contacts.invalid_signature'));
          return;
        }
        this.approveFriendRequest(data);
      } else if (payload.message?.type == FriendRequestTypes.Accept) {
        this.handleAcceptedNameCard(data);
      } else if (payload.message?.type == FriendRequestTypes.Revoke) {
        this.revokeFriend(data);
      }
    }
  }

  toggleConfirmDeleteModal = () => {
    this.setState({ confirmDeleteVisible: !this.state.confirmDeleteVisible })
  }

  toggleFriendRequestModal = () => {
    this.setState({ friendRequestVisible: !this.state.friendRequestVisible })
  }

  toggleAcceptContactModal = () => {
    this.setState({ acceptedNameCardVisible: !this.state.acceptedNameCardVisible })
  }

  createFriendRequest = async () => {
    const { selectedAddress } = this.props;

    const data = LiquichainNameCard(selectedAddress, FriendRequestTypes.Request);
    const rawSig = await CryptoSignature.signMessage(selectedAddress, data.data);
    const base64Content = base64.encode(JSON.stringify({ data, signature: rawSig }));

    setTimeout(() => {
      Share.open({
        title: `${strings('contacts.friend_request')} - ${selectedAddress}`,
        url: `liquichain://namecard?q=${base64Content}`
      })
        .catch(err => {
          Logger.log('Error while trying to share friend request', err);
        });
    }, 1000);
  }

  onAddContact = () => {
    const json = this.data;

    const { data } = json || {};
    if (data && data.data) {
      const payload = JSON.parse(data.data);
      const { message } = payload;
      const contacts = [...this.state.contacts];

      contacts.push({
        name: message.name,
        address: data.from,
      })
      this.setState({ contacts });
    }
  }

  onAcceptFriend = async () => {
    this.onAddContact();

    const { selectedAddress } = this.props;
    const to = this.data.data.from;
    const data = LiquichainNameCard(selectedAddress, FriendRequestTypes.Accept);
    this.messaging.message(to, { data });
  }

  onContactTap = address => {
    this.props.navigation.navigate('ContactForm', {
      mode: EDIT,
      editMode: EDIT,
      address,
      onDelete: () => this.updateAddressList()
    });
  };

  updateAddressList = () => {

  };

  onContactLongPress = contact => {
    this.contactToRemove = contact;
    this.toggleConfirmDeleteModal();
  };

  deleteContact = async () => {
    const contact = this.contactToRemove;
    const index = this.state.contacts.findIndex((e) => e.address == contact.address);
    this.state.contacts.splice(index, 1);
    this.setState({ contact: [...this.state.contacts] });

    const { selectedAddress } = this.props;
    const data = LiquichainNameCard(selectedAddress, FriendRequestTypes.Revoke);
    this.messaging.message(contact.address, { data });
  };

  renderContact = ({ item }) => {
    const { address, name } = item;
    return (
      <AddressElement
        key={address}
        address={address}
        name={name}
        onAccountPress={() => this.onContactTap(address)}
        onAccountLongPress={() => this.onContactLongPress(item)}
      />
    );
  }

  render() {
    const {
      contacts,
      friendRequestVisible,
      acceptedNameCardVisible,
      confirmDeleteVisible,
      address
    } = this.state;

    return (
      <SafeAreaView style={styles.wrapper} testID={'contacts-screen'}>
        <FlatList
          data={contacts}
          keyExtractor={(item) => item.toString()}
          renderItem={(data) => this.renderContact(data)}
          style={styles.optionList}
        />

        <StyledButton
          type={'confirm'}
          containerStyle={styles.addContact}
          onPress={this.createFriendRequest}
          testID={'add-contact-button'}
        >
          {strings('contacts.create_friend_request')}
        </StyledButton>

        <ConfirmModal
          visible={confirmDeleteVisible}
          title={strings('contacts.delete_contact')}
          subMessage={`${this.contactToRemove?.address}?`}
          confirmLabel={strings('contacts.delete')}
          cancelLabel={strings('contacts.cancel')}
          onConfirm={() => this.deleteContact()}
          hideModal={this.toggleConfirmDeleteModal}
        />

        <ConfirmModal
          visible={friendRequestVisible}
          title={strings('contacts.friend_request')}
          message={`${strings('contacts.accept_friend_request')}?`}
          subMessage={address}
          confirmLabel={strings('contacts.accept')}
          cancelLabel={strings('contacts.reject')}
          onConfirm={() => setTimeout(this.onAcceptFriend.bind(this), 1000)}
          hideModal={this.toggleFriendRequestModal}
        />

        <ConfirmModal
          visible={acceptedNameCardVisible}
          title={strings('contacts.friend_request_accepted')}
          message={`${strings('contacts.add_this_contact')}?`}
          subMessage={address}
          confirmLabel={strings('contacts.accept')}
          cancelLabel={strings('contacts.reject')}
          onConfirm={this.onAddContact.bind(this)}
          hideModal={this.toggleAcceptContactModal}
        />
      </SafeAreaView>
    );
  };
}

const mapStateToProps = state => ({
  addressBook: state.engine.backgroundState.AddressBookController.addressBook,
  network: state.engine.backgroundState.NetworkController.network,
  selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
});

export default connect(mapStateToProps)(Contacts);
