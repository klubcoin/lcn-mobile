import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View, Platform, Image, DeviceEventEmitter } from 'react-native';
import { Actions, GiftedChat, Message } from 'react-native-gifted-chat';
import Identicon from '../../../UI/Identicon';
import preferences from '../../../../store/preferences';
import { makeObservable, observable } from 'mobx';
import { connect } from 'react-redux';
import { colors } from '../../../../styles/common';
import APIService from '../../../../services/APIService';
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
import { setRecipient, setSelectedAsset } from '../../../../actions/transaction';
import { getEther } from '../../../../util/transactions';
import { map3rdPartyTransaction } from '../../../UI/Transactions';
import ChatTransaction from '../components/ChatTransaction';

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
		this.fetchConversation();
		this.fetchProfile();

		this.transactionListener = DeviceEventEmitter.addListener(`SubmitTransaction`, this.fetchConversation);
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
		if (this.transactionListener) this.transactionListener.remove();
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

	fetchConversation = async () => {
		Promise.all([
			this.fetchTransactionHistory(),
			this.fetchMessages(),
		])
			.then(values => {
				const data = [...values[0], ...values[1]];

				data.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
				this.setState(prevState => ({
					...prevState,
					messages: data
				}));
			})
			.catch(error => console.log(error));
	}

	fetchTransactionHistory = async () => {
		const { selectedAddress, transactions } = this.props;
		const selectedContact = this.state.contact;
		const address = selectedContact.address.toLowerCase();

		return new Promise((resolve) =>
			APIService.getTransactionHistory(selectedAddress, (success, response) => {
				if (success && response) {
					const trans = response.result.map(e =>
						transactions.find(t => t.transactionHash == e.hash) || map3rdPartyTransaction(e)
					);

					const filteredTransactions = trans.filter(e => {
						const { transaction } = e;
						return parseInt(transaction.value, 16) > 0 && (transaction.from == address || transaction.to == address);
					})
					const data = filteredTransactions.map(e => ({
						_id: e.id,
						createdAt: new Date(e.time),
						text: '',
						payload: e,
						transaction: e.transaction,
						user: {
							_id: e.transaction.from,
						}
					}));
					return resolve(data);
				} else {
					resolve([]);
				}
			}))
	}

	fetchMessages = async () => {
		const selectedContact = this.state.contact;

		const data = await preferences.getChatMessages(selectedContact.address);
		if (!data) return Promise.resolve([]);

		data.messages?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));

		return Promise.resolve(data.messages);
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

		if (!incoming) await preferences.saveChatMessages(this.state.contact.address, { messages });
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
				const { selectedAddress, setRecipient, setSelectedAsset, navigation } = this.props;
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
				setSelectedAsset(getEther(routes.mainNetWork.ticker));

				navigation.navigate('Amount');
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


	renderTransaction = (message) => {
		const {
			selectedAddress,
			conversionRate,
			currentCurrency,
			primaryCurrency
		} = this.props;
		const { ticker, chainId } = routes.mainNetWork;
		const { user, payload } = message;

		const sender = user._id == selectedAddress.toLowerCase();
		const data = {
			tx: payload,
			selectedAddress,
			ticker,
			chainId,
			conversionRate,
			currentCurrency,
			primaryCurrency,
		};

		return (
			<ChatTransaction data={data} incoming={!sender} />
		)
	}

	renderCustomView = message => {
		const { payload } = message;
		if (message.transaction) {
			return this.renderTransaction(message);
		}
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
		const { visibleMenu, messages } = this.state;

		return (
			<>
				{this.renderNavBar()}
				<View style={{ flex: 1 }}>
					<GiftedChat
						messages={messages}
						onSend={this.onSend}
						user={{ _id: selectedAddress.toLowerCase() }}
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
	network: state.engine.backgroundState.NetworkController.network,
	transactions: state.engine.backgroundState.TransactionController.transactions,
	conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate,
	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
	primaryCurrency: state.settings.primaryCurrency,
});

const mapDispatchToProps = dispatch => ({
	setRecipient: (from, to, ensRecipient, transactionToName, transactionFromName) =>
		dispatch(setRecipient(from, to, ensRecipient, transactionToName, transactionFromName)),
	setSelectedAsset: selectedAsset => dispatch(setSelectedAsset(selectedAsset))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Chat);
