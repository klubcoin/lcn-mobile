import React, { Component } from 'react';
import {
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Platform,
	Image,
	DeviceEventEmitter
} from 'react-native';
import { Actions, GiftedChat, Message } from 'react-native-gifted-chat';
import Identicon from '../../../UI/Identicon';
import preferences from '../../../../store/preferences';
import { makeObservable, observable } from 'mobx';
import { connect } from 'react-redux';
import * as RNFS from 'react-native-fs';
import * as FilesReader from '../../../../util/files-reader';
import { colors } from '../../../../styles/common';
import APIService from '../../../../services/APIService';
import Icon from 'react-native-vector-icons/FontAwesome';
import { refWebRTC } from '../../../../services/WebRTC';
import MessagingWebRTC from '../store/MessagingWebRTC';
import { strings } from '../../../../../locales/i18n';
import { ChatFile, ChatProfile, RequestPayment, TransactionSync, Typing } from '../../../../services/Messages';
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
import FileTransferWebRTC from '../../../../services/FileTransferWebRTC';
import { StoreFile } from '../../../../services/FileStore';
import { sha256 } from '../../../../core/CryptoSignature';
import AudioMessage from '../components/AudioMessage';
import FileMessage from '../components/FileMessage';
import ImageMessage from '../components/ImageMessage';

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
		preferences.setActiveChatPeerId(selectedContact.address.toLowerCase());
		this.bindContactForAddress();
		this.initConnection();
		this.fetchConversation();
		this.fetchProfile();

		this.transactionListener = DeviceEventEmitter.addListener(`SubmitTransaction`, this.sendTransactionSync);
		this.fileReceivedEvt = DeviceEventEmitter.addListener('FileTransReceived', this.onFileReceived);
	}

	bindContactForAddress() {
		const { addressBook, network } = this.props;
		const addresses = addressBook[network] || {};

		const selectedContact = this.state.contact;
		const user = addresses[selectedContact.address] || addresses[selectedContact.address.toLowerCase()];
		selectedContact.name = user?.name || selectedContact.name;
	}

	componentWillUnmount() {
		if (this.listener) this.listener.remove();
		if (this.fileReceivedEvt) this.fileReceivedEvt.remove();
		if (this.transactionListener) this.transactionListener.remove();
		this.messaging.removeListeners();
		preferences.setActiveChatPeerId(null);
	}

	initConnection = () => {
		const { selectedAddress } = this.props;
		const to = this.state.contact;
		this.messaging = new MessagingWebRTC(selectedAddress.toLowerCase(), to.address.toLowerCase(), refWebRTC());
		this.listener = this.messaging.addListener('message', (data, peerId) => {
			if (`${peerId}`.toLowerCase() != `${to.address}`.toLowerCase()) return;

			const { action } = data.message;

			if (action && action == Typing().action) {
				this.setTyping();

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
		this.messaging.setOnError(this.onSendError);
		this.messaging.send(ChatProfile());
		setTimeout(() => (this.initialized = true), 1000);
	};

	fetchConversation = async () => {
		Promise.all([this.fetchTransactionHistory(), this.fetchMessages()])
			.then(values => {
				const data = [...values[0], ...values[1]];
				data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

				this.setState(prevState => ({
					...prevState,
					messages: data
				}));
			})
			.catch(error => console.log(error));
	};

	fetchTransactionHistory = async () => {
		const { selectedAddress, transactions } = this.props;
		const selectedContact = this.state.contact;
		const address = selectedContact.address.toLowerCase();

		return new Promise(resolve =>
			APIService.getTransactionHistory(selectedAddress, (success, response) => {
				if (success && response) {
					const trans = response.result.map(
						e => transactions.find(t => t.transactionHash == e.hash) || map3rdPartyTransaction(e)
					);

					const filteredTransactions = trans.filter(e => {
						const { transaction } = e;
						return (
							parseInt(transaction.value, 16) > 0 &&
							(transaction.from == address || transaction.to == address)
						);
					});
					const data = filteredTransactions.map(e => ({
						_id: e.id,
						createdAt: new Date(e.time),
						text: '',
						payload: e,
						transaction: e.transaction,
						user: {
							_id: e.transaction.from
						}
					}));
					return resolve(data);
				} else {
					resolve([]);
				}
			})
		);
	};

	fetchMessages = async () => {
		const selectedContact = this.state.contact;
		const { selectedAddress } = this.props;
		const address = selectedAddress.toLowerCase();
		const peerAddr = selectedContact.address.toLowerCase();

		const data = await preferences.getChatMessages(peerAddr);
		if (!data) return Promise.resolve([]);
		const messages = data.messages.filter(e => {
			const senderAddr = e.user._id.toLowerCase();
			if (e.payload) {
				if (e.transaction || e.payload.action == TransactionSync().action) {
					return false;
				} else {
					const {
						payload: { from, to }
					} = e;
					return from == peerAddr || to == peerAddr || senderAddr == peerAddr;
				}
			} else {
				return senderAddr == address || senderAddr == peerAddr;
			}
		});
		return Promise.resolve(messages);
	};

	fetchProfile = async () => {
		const selectedContact = this.state.contact;
		const profile = await preferences.peerProfile(selectedContact.address.toLowerCase());
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
		preferences.setConversationIsRead(this.state.contact.address.toLowerCase(), true);
		this.messaging.send(message[0]);
	};

	addNewMessage = async (message, incoming) => {
		const { messages } = this.state;
		var newMessages = GiftedChat.append(messages, message);

		this.setState(prevState => ({
			...prevState,
			messages: newMessages,
			typing: false
		}));

		if (!incoming) await preferences.saveChatMessages(this.state.contact.address.toLowerCase(), { messages: newMessages });
		else {
			preferences.setConversationIsRead(this.state.contact.address.toLowerCase(), true);
		}
	};

	renderAvatar = () => {
		const selectedContact = this.state.contact;
		if (selectedContact.avatar)
			return (
				<Image
					source={{ uri: `data:image/jpeg;base64,${selectedContact.avatar}` }}
					style={styles.proImg}
					resizeMode="contain"
					resizeMethod="scale"
				/>
			);

		return <Identicon address={selectedContact.address} diameter={35} />;
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
					<View style={{ alignItems: 'center', flex: 10, flexDirection: 'row', justifyContent: 'center' }}>
						<View style={{ paddingHorizontal: 10 }}>{this.renderAvatar()}</View>
						<View style={{ flex: 1 }}>
							<View style={{ flexDirection: 'row' }}>
								<Text numberOfLines={1} ellipsizeMode="middle" style={styles.name}>
									{contact?.name}
								</Text>
								<View
									style={[
										styles.isOnline,
										!this.state.isOnline && { backgroundColor: colors.grey300 }
									]}
								/>
							</View>
							<Text numberOfLines={1} ellipsizeMode="middle" style={styles.address}>
								{contact?.address}
							</Text>
						</View>
					</View>
					<View style={{ flex: 1 }} />
				</View>
			</SafeAreaView>
		);
	}

	sendTransactionSync = transaction => {
		this.sendPayloadMessage(TransactionSync(transaction));
		// this.fetchConversation();
	};

	sendPaymentRequest = request => {
		const selectedContact = this.state.contact;
		this.sendPayloadMessage(RequestPayment(selectedContact.address.toLowerCase(), request));
	};

	onPickFile = async () => {
		const results = await FilesReader.pickSingle();
		if (results && results.length != 0) {
			this.sendFile(results[0]);
		}
	};

	sendFile = async (file, msg = null) => {
		const { uri, name } = file;
		const path = decodeURIComponent(uri);
		const data = await RNFS.readFile(path, 'base64');
		const message = msg ? this.sendMessage(msg) : await this.addFile(file);

		const webrtc = refWebRTC();
		const { selectedAddress } = this.props;
		const selectedContact = this.state.contact;
		const peerAddr = selectedContact.address.toLowerCase();

		const ft = FileTransferWebRTC.sendAsParts(data, name, selectedAddress.toLowerCase(), [peerAddr], webrtc, { direct: true });
		ft.setOnError(() => {
			alert(`Error: Failed to send to ${selectedContact.name}`);
			this.onSendError(message);
		});
	};

	sendMessage = (message) => {
		this.messaging.send(message);
		return message;
	}

	addFile = async file => {
		const selectedContact = this.state.contact;
		const peerAddr = selectedContact.address.toLowerCase();

		return await this.sendPayloadMessage(ChatFile(peerAddr, file));
	};

	onSendError = async (message) => {
		const selectedContact = this.state.contact;
		const peerId = selectedContact.address.toLowerCase();
		const conversation = await preferences.getChatMessages(peerId);
		const { messages } = conversation || { messages: [] };

		if (message.payload) {
			message.payload.failed = true;

			const m = messages.find(e => e._id == message._id);
			Object.assign(m, message);
			this.setState({ messages });

			preferences.saveChatMessages(peerId, { messages });
		}
	}

	onFileReceived = async ({ data, path }) => {
		const peerId = data.from;
		const conversation = await preferences.getChatMessages(peerId);
		const { messages } = conversation || { messages: [] };

		const message = messages.find(e => {
			const { payload } = e;
			if (payload && payload.action == ChatFile().action) {
				return payload.name == data.name;
			}
		});

		if (message) {
			message.payload.uri = `file://${path}`;
			message.payload.loading = false;
			this.setState({ messages });
		}
	}

	sendPayloadMessage = async (payload, append = true) => {
		const { selectedAddress } = this.props;
		const message = {
			_id: uuid.v4(),
			createdAt: new Date(),
			text: '',
			payload,
			user: { _id: selectedAddress.toLowerCase() }
		};
		if (append) this.addNewMessage([message]);
		this.messaging.send(message);

		return message;
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
			case menuKeys.sendFile:
				setTimeout(this.onPickFile, 500);
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

		const owner = user._id == selectedAddress.toLowerCase();
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

	renderTransaction = message => {
		const { selectedAddress, conversionRate, currentCurrency, primaryCurrency } = this.props;
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
			primaryCurrency
		};

		return <ChatTransaction data={data} incoming={!sender} />;
	};

	renderCustomView = message => {
		const { payload } = message;
		if (message.transaction || payload.action == TransactionSync().action) {
			return this.renderTransaction(message);
		}
		switch (payload.action) {
			case RequestPayment().action:
				return this.renderPaymentRequest(message);
			case TransactionSync().action:
				return this.renderTransaction(message);
			case ChatFile().action:
				return this.renderMedia(message);
			default:
				return null;
		}
	};

	renderMedia = (message) => {
		const { selectedAddress } = this.props;
		const { uri, name, type, loading } = message.payload;
		const path = decodeURIComponent(uri).replace('file://', '');

		const { user } = message;
		const incoming = user?._id.toLowerCase() != selectedAddress.toLowerCase();
		const isLoading = loading && incoming;

		delete message.image;

		if (type && type.indexOf('image') == 0) {
			message.image = `file://${path}`;
			return <ImageMessage key={sha256(path)}	{...message} loading={isLoading} />
		} else if (type && type.indexOf('audio') == 0) {
			return <AudioMessage key={sha256(path)}	{...message.payload} path={path} incoming={incoming} loading={isLoading} />
		}

		return <FileMessage key={sha256(path)} {...message.payload} incoming={incoming} loading={isLoading} />
	}

	renderMessage = messageProps => {
		const { currentMessage } = messageProps;
		const isCustom = currentMessage.payload;

		return (
			<Message
				{...messageProps}
				renderMessageImage={() => null}
				renderCustomView={isCustom ? () => this.renderBubble(currentMessage) : null}
			/>
		);
	};

	onRetry = async (message) => {
		const { messages } = this.state;
		message.payload.failed = false;

		this.setState({ messages });
		this.retrySending(message);
	}

	retrySending = async (message) => {
		const { payload } = message || {};
		switch (payload.action) {
			case RequestPayment().action:
			case TransactionSync().action:
				this.sendMessage(message);
				break;
			case ChatFile().action:
				this.sendFile(payload, message);
				break;
		}
	}

	renderBubble = (message) => {
		const failed = message.payload && message.payload.failed == true;
		return (
			<>
				{this.renderCustomView(message)}
				{failed && this.renderRetry(message)}
			</>
		)
	}

	renderRetry = (message) => {
		return (
			<View style={styles.failure}>
				<Text style={styles.failedText}>{strings('chat.failed_to_send')}.</Text>
				<TouchableOpacity activeOpacity={0.6} onPress={() => this.onRetry(message)}>
					<Text style={styles.retry}> {strings('chat.retry')}</Text>
				</TouchableOpacity>
			</View>
		)
	}

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
						bottomOffset={0}
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
	},
	failure: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginBottom: 5
	},
	failedText: {
		color: colors.red,
	},
	retry: {
		color: colors.red,
		fontStyle: 'italic',
		fontWeight: '600'
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
	primaryCurrency: state.settings.primaryCurrency
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
