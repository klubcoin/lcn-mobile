import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Platform, Image } from 'react-native';
import { Actions, GiftedChat, Message } from 'react-native-gifted-chat';
import Identicon from '../../../UI/Identicon';
import preferences from '../../../../store/preferences';
import { makeObservable, observable } from 'mobx';
import { connect } from 'react-redux';
import { colors } from '../../../../styles/common';
import Icon from 'react-native-vector-icons/FontAwesome';
import { refWebRTC } from '../../../../services/WebRTC';
import MessagingWebRTC from '../../../../services/MessagingWebRTC';
import { strings } from '../../../../../locales/i18n';
import { ChatProfile, RequestPayment, Typing } from '../../../../services/Messages';
import ModalSelector from '../../../UI/AddCustomTokenOrApp/ModalSelector';
import routes from '../../../../common/routes';
import uuid from 'react-native-uuid';
import QRCode from 'react-native-qrcode-svg';
import DeeplinkManager from '../../../../core/DeeplinkManager';
import AppConstants from '../../../../core/AppConstants';
import { setRecipient } from '../../../../actions/transaction';

class Chat extends Component {
	static navigationOptions = () => ({ header: null });
	messaging;

	state = {
		contact: this.props.navigation.getParam('selectedContact'),
		messages: [],
		isOnline: false
	};

	componentDidMount() {
		const selectedContact = this.state.contact;
		preferences.setActiveChatPeerId(selectedContact.address);
		this.bindContactForAddress();
		this.initConnection();
		this.fetchMessages(selectedContact.address);
		this.fetchProfile();
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
			const { action } = data.message;

			if (action && action == Typing().action) {
				if (`${peerId}`.toLowerCase() == `${to.address}`.toLowerCase()) this.setTyping();

				if (!this.state.isOnline)
					this.setState(prevState => ({
						...prevState,
						isOnline: true
					}));
			} else {
				if (action == ChatProfile().action) {
					this.setState(prevState => ({
						...prevState,
						isOnline: true
					}));
				}

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

	fetchProfile = async () => {
		const selectedContact = this.state.contact;
		const profile = await preferences.peerProfile(selectedContact.address);
		if (profile) {
			selectedContact.avatar = profile.avatar;
		}
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
			messages,
			typing: false
		}));

		if (!incoming) preferences.saveChatMessages(this.state.contact.address, messages);
	};

	renderAvatar = () => {
		const selectedAddress = this.state.contact;
		if (selectedAddress.avatar)
			return (
				<Image
					source={{ uri: `data:image/jpeg;base64,${selectedAddress.avatar}` }}
					style={styles.proImg}
					resizeMode="contain"
					resizeMethod="scale"
				/>
			);

		return <Identicon address={selectedAddress.address} diameter={35} />;
	};

	onMoreButtonTap = () => {
		this.setState({ visibleMenu: true });
	};

	renderNavBar() {
		const { contact } = this.state;

		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack} style={styles.navButton}>
						<Icon name={'arrow-left'} size={16} style={styles.backIcon} />
					</TouchableOpacity>
					<View style={{ alignItems: 'center', flex: 10 }}>
						<View style={{ flexDirection: 'row' }}>
							<Text numberOfLines={1} ellipsizeMode="middle" style={styles.name}>
								{contact?.name}
							</Text>
							<View
								style={[styles.isOnline, !this.state.isOnline && { backgroundColor: colors.grey300 }]}
							/>
						</View>
						<Text numberOfLines={1} ellipsizeMode="middle" style={styles.address}>
							{contact?.address}
						</Text>
					</View>
					<View style={{ flex: 1 }} />
				</View>
			</SafeAreaView>
		);
	}

	sendPaymentRequest = request => {
		const { selectedAddress } = this.props;
		const message = {
			_id: uuid.v4(),
			createdAt: new Date(),
			text: '',
			payload: RequestPayment(request),
			user: { _id: selectedAddress }
		};
		this.addNewMessage([message]);
		this.messaging.send(message);
	};

	onSelectMenuItem = async item => {
		this.setState({ visibleMenu: false });
		switch (item.key) {
			case menuKeys.sendCoin:
				const { selectedAddress, setRecipient } = this.props;
				const selectedContact = this.state.contact;
				const { firstname, lastname } = (await preferences.onboardProfile) || {};

				const toEnsName = selectedContact.address;
				const toSelectedAddressName = selectedContact.name;
				const fromAccountName = `${firstname} ${lastname}`;

				setRecipient(
					selectedAddress,
					selectedContact.address,
					toEnsName,
					toSelectedAddressName,
					fromAccountName
				);

				this.props.navigation.navigate('Amount');
				break;
			case menuKeys.requestPayment:
				this.props.navigation.navigate('PaymentRequestView', {
					onRequest: this.sendPaymentRequest,
					receiveAsset: {
						isETH: true,
						name: routes.mainNetWork.coin,
						symbol: routes.mainNetWork.ticker
					}
				});
				break;
		}
	};

	renderMenu = () => {
		return (
			<ModalSelector
				visible={true}
				hideKey={true}
				options={menuOptions}
				onSelect={item => this.onSelectMenuItem(item)}
				onClose={() => this.setState({ visibleMenu: false })}
			/>
		);
	};

	renderTypingFooter = () => {
		const { typing, contact } = this.state;

		return (
			<Text style={styles.typing}>
				{!typing ? ' ' : strings('chat.user_is_typing', { name: contact.name || '' })}
			</Text>
		);
	};

	handlePayment = ({ link }) => {
		DeeplinkManager.parse(link, { origin: AppConstants.DEEPLINKS.ORIGIN_DEEPLINK });
	};

	renderPaymentRequest = message => {
		const { selectedAddress } = this.props;
		const { user, payload } = message;
		const { link, amount, symbol } = payload;

		const owner = user._id == selectedAddress;
		const textColor = owner ? colors.white : colors.black;

		return (
			<View style={{ flexDirection: 'row', padding: 10 }}>
				{owner ? <Icon name={'dollar'} size={24} style={{ color: colors.white }} /> : <QRCode value={link} />}
				<View style={{ maxWidth: 200, marginLeft: 10 }}>
					<Text style={{ color: textColor }}>Payment Request</Text>
					<Text style={{ color: textColor, fontWeight: '600' }}>
						Amount: {amount} {symbol}
					</Text>
					{!owner && (
						<TouchableOpacity activeOpacity={0.6} onPress={() => this.handlePayment(payload)}>
							<Text style={{ color: colors.blue, fontStyle: 'italic', marginVertical: 5 }}>{link}</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
		);
	};

	renderCustomView = message => {
		const { payload } = message;
		switch (payload.action) {
			case RequestPayment().action:
				return this.renderPaymentRequest(message);
			default:
				return null;
		}
	};

	renderMessage = messageProps => {
		const { currentMessage } = messageProps;
		const isCustom = currentMessage.payload;

		return (
			<Message
				{...messageProps}
				renderCustomView={isCustom ? () => this.renderCustomView(currentMessage) : null}
			/>
		);
	};

	render() {
		const { selectedAddress } = this.props;
		const { visibleMenu } = this.state;

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
						renderAvatar={this.renderAvatar}
						bottomOffset={Platform.OS === 'ios' && 35}
						onInputTextChanged={this.sendTyping}
						renderFooter={this.renderTypingFooter}
						renderMessage={this.renderMessage}
						renderActions={() => <Actions onPressActionButton={this.onMoreButtonTap} />}
					/>
					{visibleMenu && this.renderMenu()}
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
	},
	proImg: {
		width: 35,
		height: 35,
		borderRadius: 100
	},
	menuIcon: {
		width: 28,
		height: 28,
		marginRight: 8,
		color: colors.blue
	},
	isOnline: {
		width: 10,
		height: 10,
		borderRadius: 10,
		alignSelf: 'center',
		marginLeft: 10,
		backgroundColor: colors.green400
	}
});

const menuKeys = {
	sendCoin: 'sendCoin',
	requestPayment: 'requestPayment',
	sendFile: 'sendFile'
};

const menuOptions = [
	{
		key: menuKeys.sendCoin,
		value: strings('chat.send_transaction'),
		icon: <Icon name={'send'} size={24} style={styles.menuIcon} />
	},
	{
		key: menuKeys.requestPayment,
		value: strings('chat.request_payment'),
		icon: <Icon name={'dollar'} size={24} style={styles.menuIcon} />
	},
	{
		key: menuKeys.sendFile,
		value: strings('chat.send_file'),
		icon: <Icon name={'file'} size={24} style={styles.menuIcon} />
	}
];

const mapStateToProps = state => ({
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	identities: state.engine.backgroundState.PreferencesController.identities,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	addressBook: state.engine.backgroundState.AddressBookController.addressBook,
	network: state.engine.backgroundState.NetworkController.network
});

const mapDispatchToProps = dispatch => ({
	setRecipient: (from, to, ensRecipient, transactionToName, transactionFromName) =>
		dispatch(setRecipient(from, to, ensRecipient, transactionToName, transactionFromName))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Chat);
