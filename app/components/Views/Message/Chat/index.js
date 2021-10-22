import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Platform } from 'react-native';
import { GiftedChat } from 'react-native-gifted-chat';
import Identicon from '../../../UI/Identicon';
import preferences from '../../../../store/preferences';
import { makeObservable, observable } from 'mobx';
import { connect } from 'react-redux';
import { colors } from '../../../../styles/common';
import Icon from 'react-native-vector-icons/Ionicons';
import { refWebRTC } from '../../../../services/WebRTC';
import MessagingWebRTC from '../../../../services/MessagingWebRTC';
import { strings } from '../../../../../locales/i18n';
import { ChatProfile, Typing } from '../../../../services/Messages';

class Chat extends Component {
	static navigationOptions = () => ({ header: null });
	messaging;

	state = {
		contact: this.props.navigation.getParam('selectedContact'),
		messages: []
	};

	componentDidMount() {
		const selectedContact = this.state.contact;
		preferences.setActiveChatPeerId(selectedContact.address);
		this.bindContactForAddress();
		this.initConnection();
		this.fetchMessages(selectedContact.address);
	}

	bindContactForAddress() {
		const { addressBook, network } = this.props;
		const addresses = addressBook[network] || {};

		const selectedContact = this.state.contact;
		const user = addresses[selectedContact.address];
		selectedContact.name = user.name;
	}

	componentWillUnmount() {
		if (this.listener) this.listener.remove();
		preferences.setActiveChatPeerId(null);
	}

	initConnection = () => {
		const { selectedAddress } = this.props;
		const to = this.state.contact;
		this.messaging = new MessagingWebRTC(selectedAddress, to.address, refWebRTC());
		this.listener = this.messaging.addListener('message', (data, peerId) => {
			console.log('got chat', peerId, data);
			const { action } = data.message;
			if (action && action == Typing().action) {
				if (`${peerId}`.toLowerCase() == `${to.address}`.toLowerCase()) this.setTyping();
			} else {
				data.message.user['_id'] = peerId;

				this.addNewMessage(data.message, true);
			}
		});
		this.messaging.send(ChatProfile());
		setTimeout(() => (this.initialized = true), 1000);
	};

	fetchMessages = async to => {
		const data = await preferences.getChatMessages(to);

		if (!data) return;
		data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

		this.setState(prevState => ({
			...prevState,
			messages: data
		}));
	};

	onBack = () => {
		this.props.navigation.goBack();
	};

	setTyping = () => {
		this.setState({ typing: true });
		if (this.typingTimeout) clearTimeout(this.typingTimeout);

		this.typingTimeout = setTimeout(() => this.setState({ typing: false }), 3000);
	};

	sendTyping = () => {
		if (this.sentTyping || !this.initialized) return;
		this.sentTyping = true;

		if (this.messaging) this.messaging.send(Typing());

		setTimeout(() => (this.sentTyping = false), 2000);
	};

	onSend = message => {
		this.addNewMessage(message);
		this.messaging.send(message[0]);
	};

	addNewMessage = async (message, incoming) => {
		var messages = this.state.messages.concat(message);
		messages?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

		this.setState(prevState => ({
			...prevState,
			messages
		}));

		if (!incoming) preferences.saveChatMessages(this.state.contact.address, messages);
	};

	renderAvatar = address => {
		return <Identicon address={address} diameter={35} />;
	};

	renderNavBar() {
		const { contact } = this.state;
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack} style={styles.navButton}>
						<Icon name={'arrow-back'} size={22} style={styles.backIcon} />
					</TouchableOpacity>
					<View style={{ alignItems: 'center', flex: 10 }}>
						<Text numberOfLines={1} ellipsizeMode="middle" style={styles.name}>
							{contact?.name}
						</Text>
						<Text numberOfLines={1} ellipsizeMode="middle" style={styles.address}>
							{contact?.address}
						</Text>
					</View>
					<View style={{ flex: 1 }} />
				</View>
			</SafeAreaView>
		);
	}

	renderTypingFooter = () => {
		const { typing, contact } = this.state;

		return (
			!!typing && (
				<Text style={styles.typing}>{strings('chat.user_is_typing', { name: contact.name || '' })}</Text>
			)
		);
	};

	render() {
		const { selectedAddress } = this.props;

		return (
			<>
				{this.renderNavBar()}
				<View style={{ flex: 1 }}>
					<GiftedChat
						messages={this.state.messages}
						onSend={this.onSend}
						user={{
							_id: selectedAddress
						}}
						renderAvatar={() => this.renderAvatar(this.state.contact.address)}
						bottomOffset={Platform.OS === 'ios' && 35}
						onInputTextChanged={this.sendTyping}
						renderFooter={this.renderTypingFooter}
					/>
				</View>
			</>
		);
	}
}

const styles = StyleSheet.create({
	navBar: {
		flexDirection: 'row',
		alignItems: 'center',
		paddingHorizontal: 16,
		paddingVertical: 5,
		borderBottomWidth: 1,
		borderBottomColor: colors.grey200
	},
	navButton: {
		alignItems: 'center',
		justifyContent: 'center',
		flex: 1
	},
	backIcon: {
		color: colors.primaryFox
	},
	name: {
		fontSize: 18,
		fontWeight: '500'
	},
	address: {
		fontSize: 16,
		fontWeight: '300',
		color: colors.grey,
		maxWidth: 180
	},
	typing: {
		fontStyle: 'italic',
		marginVertical: 3,
		marginLeft: 5,
		fontSize: 12,
		opacity: 0.5
	}
});

const mapStateToProps = state => ({
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	identities: state.engine.backgroundState.PreferencesController.identities,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	addressBook: state.engine.backgroundState.AddressBookController.addressBook,
	network: state.engine.backgroundState.NetworkController.network
});

export default connect(mapStateToProps)(Chat);
