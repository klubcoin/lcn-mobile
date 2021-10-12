import React, { PureComponent } from 'react';
import { FlatList, SafeAreaView, StyleSheet, TextInput, View } from 'react-native';
import { colors, fontStyles } from '../../../styles/common';
import { PropTypes } from 'prop-types';
import { strings } from '../../../../locales/i18n';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import { connect } from 'react-redux';
import { setOnlinePeerWallets } from '../../../actions/contacts';
import { toChecksumAddress, stripHexPrefix } from 'ethereumjs-util';
import Engine from '../../../core/Engine';
import APIService from '../../../services/APIService';
import StyledButton from '../../UI/StyledButton';
import Icon from 'react-native-vector-icons/FontAwesome';
import { FriendRequestTypes, LiquichainNameCard } from './FriendRequestMessages';
import CryptoSignature from '../../../core/CryptoSignature';
import base64 from 'base-64';
import Share from 'react-native-share';
import ConfirmModal from '../../UI/ConfirmModal';
import AddressElement from '../SendFlow/AddressElement';
import Messaging, { Ping, Pong, WSEvent } from '../../../services/Messaging';
import FriendMessageOverview from './widgets/FriendMessageOverview';
import Logger from '../../../util/Logger';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.white,
		flex: 1
	},
	addContact: {
		marginHorizontal: 24,
		marginBottom: 16
	},
	searchSection: {
		marginHorizontal: 20,
		marginVertical: 10,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 8,
		borderColor: colors.grey100
	},
	textInput: {
		flex: 1,
		height: 30,
		...fontStyles.normal
	},
	icon: {
		padding: 16
	},
	online: {
		position: 'absolute',
		top: 8,
		right: 10,
		width: 8,
		height: 8,
		borderRadius: 4,
		backgroundColor: colors.green500
	},
	selectedBar: {
		position: 'absolute',
		width: 5,
		height: '100%',
		left: 0,
		backgroundColor: colors.blue
	}
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
		selectedContacts: [],
		searchQuery: '',
		confirmDeleteVisible: false,
		friendRequestVisible: false,
		acceptedNameCardVisible: false
	};

	actionSheet;
	contactToRemove;

	constructor(props) {
		super(props);
		const { selectedAddress } = props;
		this.contactSelection = props.navigation.getParam('contactSelection');
		this.messaging = new Messaging(selectedAddress);
		this.messaging.on(WSEvent.message, data => {
			this.handleWSMessage(data);
		});
	}

	componentDidMount() {
		const { addressBook, network } = this.props;
		const addresses = addressBook[network] || {};
		const contacts = Object.keys(addresses).map(addr => addresses[addr]);
		this.setState({ contacts });

		this.messaging.initConnection();
		this.data = this.props.navigation.getParam('data');
		this.handleFriendRequestUpdate();
		// this.pingFriends(contacts);
		this.announceOnline();
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

	announceOnline() {
		const { selectedAddress, updateOnlinePeerWallets } = this.props;
		const peerId = stripHexPrefix(selectedAddress);

		APIService.announcePeerOnlineStatus(peerId, (success, json) => {
			if (success && json.peers) {
				updateOnlinePeerWallets(json.peers);
			}
		});
	}

	pingFriends(contacts) {
		const { selectedAddress } = this.props;
		contacts.map(e => {
			e.online = false;
			this.messaging.send(Ping(selectedAddress, e.address));
		});
	}

	approveFriendRequest(data) {
		this.setState({ friendRequestVisible: true, address: data.from });
	}

	handleAcceptedNameCard(data) {
		this.setState({ acceptedNameCardVisible: true, address: data.from });
	}

	revokeFriend(data) {
		const address = data.from;
		const index = this.state.contacts.findIndex(e => e.address == address);
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

	async handleWSMessage(json) {
		const { selectedAddress } = this.props;
		const { contacts } = this.state;
		try {
			const data = JSON.parse(json);
			if (data.action == 'ping') {
				this.messaging.send(Pong(selectedAddress, data.from));
			} else if (data.action == 'pong') {
				const from = data.from.toLocaleLowerCase();
				const contact = contacts.find(e => e.address.toLocaleLowerCase() == from);
				if (contact) {
					contact.online = true;
					this.setState({ contacts: [...contacts] });
				}
			}
		} catch (e) {}
	}

	onConfirm() {
		const { selectedContacts } = this.state;
		const onConfirm = this.props.navigation.getParam('onConfirm');
		this.props.navigation.goBack();
		if (onConfirm) onConfirm(selectedContacts);
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
			}
		}
	}

	toggleConfirmDeleteModal = () => {
		this.setState({ confirmDeleteVisible: !this.state.confirmDeleteVisible });
	};

	toggleFriendRequestModal = () => {
		this.setState({ friendRequestVisible: !this.state.friendRequestVisible });
	};

	toggleAcceptContactModal = () => {
		this.setState({ acceptedNameCardVisible: !this.state.acceptedNameCardVisible });
	};

	createFriendRequest = async () => {
		const { selectedAddress, identities } = this.props;
		const account = identities[selectedAddress];

		const data = LiquichainNameCard(selectedAddress, account.name, FriendRequestTypes.Request);
		const rawSig = await CryptoSignature.signMessage(selectedAddress, data.data);
		const base64Content = base64.encode(JSON.stringify({ data, signature: rawSig }));

		setTimeout(() => {
			Share.open({
				title: `${strings('contacts.friend_request')} - ${selectedAddress}`,
				url: `liquichain://namecard?q=${base64Content}`
			}).catch(err => {
				Logger.log('Error while trying to share friend request', err);
			});
		}, 1000);
	};

	onAddContact = () => {
		const { network } = this.props;
		const { AddressBookController } = Engine.context;
		const json = this.data;

		const { data } = json || {};
		if (data && data.data) {
			const payload = JSON.parse(data.data);
			const { message } = payload;
			const name = message.name || '';
			const address = toChecksumAddress(data.from);

			if (this.state.contacts.find(e => e.address == address)) return;

			const contacts = [...this.state.contacts];

			AddressBookController.set(address, name, network);

			contacts.push({
				name,
				address
			});
			this.setState({ contacts });
		}
	};

	onAcceptFriend = async () => {
		this.onAddContact();

		const { selectedAddress, identities } = this.props;
		const account = identities[selectedAddress];
		const to = this.data.data.from;
		const data = LiquichainNameCard(selectedAddress, account.name, FriendRequestTypes.Accept);
		this.messaging.message(to, { data });
	};

	onSelectContact = contact => {
		const { selectedContacts } = this.state;

		if (selectedContacts.find(e => e.address == contact.address)) {
			selectedContacts.splice(selectedContacts.indexOf(contact), 1);
		} else {
			selectedContacts.push(contact);
		}
		this.setState({ selectedContacts: [...selectedContacts] });
	};

	onContactTap = address => {
		this.props.navigation.navigate('ContactForm', {
			mode: EDIT,
			editMode: EDIT,
			address,
			onUpdate: () => this.updateAddressList(),
			onDelete: () => {
				this.contactToRemove = { address };
				this.deleteContact();
			}
		});
	};

	updateAddressList = () => {
		const { network } = this.props;
		const { AddressBookController } = Engine.state;
		const addresses = AddressBookController.addressBook[network] || {};
		const contacts = Object.keys(addresses).map(addr => addresses[addr]);
		this.setState({ contacts });
	};

	onContactLongPress = contact => {
		this.contactToRemove = contact;
		this.toggleConfirmDeleteModal();
	};

	deleteContact = async () => {
		const { address } = this.contactToRemove;
		const index = this.state.contacts.findIndex(e => e.address == address);
		this.state.contacts.splice(index, 1);
		this.setState({ contact: [...this.state.contacts] });

		const { AddressBookController } = Engine.context;
		const { network } = this.props;
		AddressBookController.delete(network, address);

		const { selectedAddress, identities } = this.props;
		const account = identities[selectedAddress];
		const data = LiquichainNameCard(selectedAddress, account.name, FriendRequestTypes.Revoke);
		this.messaging.message(address, { data });
	};

	renderContact = ({ item }) => {
		const { onlinePeers } = this.props;
		const { selectedContacts } = this.state;
		const { address, name } = item;
		const selected = !!selectedContacts.find(e => e.address == address);

		const addressHex = stripHexPrefix(address);
		const online = !!onlinePeers.find(e => e.peer_id == addressHex);

		return (
			<>
				<AddressElement
					key={address}
					address={address}
					name={name}
					onAccountPress={() =>
						this.contactSelection ? this.onSelectContact(item) : this.onContactTap(address)
					}
					onAccountLongPress={() => !this.contactSelection && this.onContactLongPress(item)}
				/>
				{online && <View style={styles.online} />}
				{this.contactSelection && selected && <View style={styles.selectedBar} />}
			</>
		);
	};

	handleSearch = text => {
		this.setState({ searchQuery: text });
	};

	filterContacts = contacts =>
		contacts.filter(e => {
			const { searchQuery } = this.state;
			const query = searchQuery.toLocaleLowerCase();
			return e.name.toLocaleLowerCase().includes(query) || e.address.toLocaleLowerCase().includes(query);
		});

	render() {
		const {
			contacts,
			friendRequestVisible,
			acceptedNameCardVisible,
			confirmDeleteVisible,
			searchQuery
		} = this.state;

		return (
			<SafeAreaView style={styles.wrapper} testID={'contacts-screen'}>
				<View style={styles.searchSection}>
					<Icon name="search" size={22} style={styles.icon} />
					<TextInput
						style={styles.textInput}
						value={searchQuery}
						placeholder={`${strings('contacts.search')}...`}
						placeholderTextColor={colors.grey100}
						onChangeText={this.handleSearch}
					/>
				</View>

				<FlatList
					data={this.filterContacts(contacts)}
					keyExtractor={item => `${item.name}${item.address}`}
					renderItem={data => this.renderContact(data)}
					style={styles.optionList}
				/>
				{this.contactSelection ? (
					<StyledButton
						type={'confirm'}
						containerStyle={styles.addContact}
						onPress={this.onConfirm.bind(this)}
					>
						{strings('contacts.confirm')}
					</StyledButton>
				) : (
					<StyledButton
						type={'confirm'}
						containerStyle={styles.addContact}
						onPress={this.createFriendRequest}
						testID={'add-contact-button'}
					>
						{strings('contacts.create_friend_request')}
					</StyledButton>
				)}

				<ConfirmModal
					visible={confirmDeleteVisible}
					title={strings('contacts.delete_contact')}
					message={`${this.contactToRemove?.name}`}
					subMessage={`${this.contactToRemove?.address}?`}
					confirmLabel={strings('contacts.delete')}
					cancelLabel={strings('contacts.cancel')}
					onConfirm={() => this.deleteContact()}
					hideModal={this.toggleConfirmDeleteModal}
				/>

				<FriendMessageOverview
					visible={friendRequestVisible}
					data={this.data?.data}
					networkInfo={this.data?.data.meta}
					title={strings('contacts.friend_request')}
					message={`${strings('contacts.accept_friend_request')}?`}
					confirmLabel={strings('contacts.accept')}
					cancelLabel={strings('contacts.reject')}
					onConfirm={() => setTimeout(this.onAcceptFriend.bind(this), 1000)}
					hideModal={this.toggleFriendRequestModal}
				/>

				<FriendMessageOverview
					visible={acceptedNameCardVisible}
					data={this.data?.data}
					networkInfo={this.data?.data.meta}
					title={strings('contacts.friend_request_accepted')}
					message={`${strings('contacts.add_this_contact')}?`}
					confirmLabel={strings('contacts.accept')}
					cancelLabel={strings('contacts.reject')}
					onConfirm={this.onAddContact.bind(this)}
					hideModal={this.toggleAcceptContactModal}
				/>
			</SafeAreaView>
		);
	}
}

const mapStateToProps = state => ({
	addressBook: state.engine.backgroundState.AddressBookController.addressBook,
	network: state.engine.backgroundState.NetworkController.network,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	identities: state.engine.backgroundState.PreferencesController.identities,
	onlinePeers: state.contacts.onlineWallets
});

const mapDispatchToProps = dispatch => ({
	updateOnlinePeerWallets: peers => dispatch(setOnlinePeerWallets(peers))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Contacts);
