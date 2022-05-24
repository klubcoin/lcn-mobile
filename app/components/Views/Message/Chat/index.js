import React, { Component } from 'react';
import {
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Platform,
	Image,
	DeviceEventEmitter,
	ActivityIndicator
} from 'react-native';
import { Actions, GiftedChat, Message } from 'react-native-gifted-chat';
import Identicon from '../../../UI/Identicon';
import preferences from '../../../../store/preferences';
import moment from 'moment';
import { connect } from 'react-redux';
import * as RNFS from 'react-native-fs';
import { addHexPrefix } from 'ethereumjs-util';
import * as FilesReader from '../../../../util/files-reader';
import { colors } from '../../../../styles/common';
import APIService from '../../../../services/APIService';
import Icon from 'react-native-vector-icons/FontAwesome';
import { refWebRTC } from '../../../../services/WebRTC';
import MessagingWebRTC from '../store/MessagingWebRTC';
import { strings } from '../../../../../locales/i18n';
import { ChatFile, ChatProfile, JoinUpdate, RequestPayment, TransactionSync, Typing } from '../store/Messages';
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
import FileTransferWebRTC from '../../FilesManager/store/FileTransferWebRTC';
import { sha256 } from '../../../../core/CryptoSignature';
import AudioMessage from '../components/AudioMessage';
import FileMessage from '../components/FileMessage';
import ImageMessage from '../components/ImageMessage';
import store from '../store';
import marketStore from '../../MarketPlace/store';
import styles from './styles/index'
import { testID } from '../../../../util/Logger';
import RecordingBS from '../../../UI/RecordingBS';
import RemoteImage from '../../../Base/RemoteImage';

class Chat extends Component {
	static navigationOptions = () => ({ header: null });
	messaging;
	contacts = {};
	senderName = '';
	messageIds = [];
	recipient = this.props.navigation.getParam('selectedContact');
	state = {
		contact: this.recipient,
		group: this.props.navigation.getParam('group') || this.one2oneGroup(),
		groupInfo: { name: this.props.navigation.getParam('name') },
		messages: [],
		isOnline: false,
		loading: true,
	};

	RBRef = React.createRef();

	one2oneGroup() {
		const { selectedAddress } = this.props;
		return [selectedAddress, this.recipient.address]
			.sort((a, b) => `${a}`.localeCompare(`${b}`))
			.join('.').toLowerCase();
	}

	groupInfo = () => {
		const { groupInfo } = this.state;
		return groupInfo || {};
	}

	componentDidMount() {
		store.setActiveChatPeerId(this.state.group);
		this.bindContactForAddress();
		this.fetchConversation();
		this.fetchProfile();
		this.initConnection();

		this.fetchGroupDetails(this.state.group);
		this.transactionListener = DeviceEventEmitter.addListener(`SubmitTransaction`, this.sendTransactionSync);
		this.fileReceivedEvt = DeviceEventEmitter.addListener('FileTransReceived', this.onFileReceived);
	}

	fetchGroupDetails(groupId) {
		const members = [];
		const peers = this.getPeers();
		members.map(e => !peers.includes(e) && peers.push(e));
		this.getWalletInfos(peers);
		store.saveConversationPeers(groupId, peers);
		this.messaging.send(ChatProfile());
	}

	getWalletInfos = (members) => {
		members.forEach(e => this.getWalletInfo(e))
	}

	getWalletInfo = async (address) => {
		APIService.getWalletInfo(address, (success, json) => {
			if (success && json) {
				preferences.setPeerProfile(address, json.result);
			}
		})
	};

	bindContactForAddress() {
		const { group, contact } = this.state;
		const { addressBook, network } = this.props;
		const addresses = addressBook[network] || {};

		if (contact) {
			const user = addresses[contact.address] || addresses[contact.address?.toLowerCase()];
			contact.name = user?.name || contact.name;
		}

		if (group) {
			const groupInfo = store.conversationInfos[group] || { peers: [] };

			groupInfo.peers.filter(e => !!e).map(e => {
				const address = e;
				const user = addresses[address] || addresses[address?.toLowerCase()];

				this.contacts[address] = { name: user?.name || '' };
			})
		}
	}

	componentWillUnmount() {
		if (this.listener) this.listener.remove();
		if (this.fileReceivedEvt) this.fileReceivedEvt.remove();
		if (this.transactionListener) this.transactionListener.remove();
		this.messaging.removeListeners();
		store.setActiveChatPeerId(null);
	}

	getPeers = () => {
		const { group, contact } = this.state;
		const peerId = contact?.address;
		const info = store.conversationInfos[group] || {};

		const peers = info?.peers?.filter(e => e != group) || [];
		if (peers.indexOf(peerId) < 0) peers.push(peerId);
		return peers;
	}

	initConnection = () => {
		const { selectedAddress } = this.props;
		this.messaging = new MessagingWebRTC(selectedAddress, this.getPeers, refWebRTC());

		this.listener = this.messaging.addListener('message', (data, peerId) => {

			if (data.action) {
				const { action } = data;
				if (action == ChatProfile().action) {
					this.setState(prevState => ({
						...prevState,
						isOnline: true,
						update: new Date()
					}));
				}
			}

			const { action, name, group } = data.message || {};
			if (group && group != this.state.group) return;

			if (action == ChatProfile().action) {
				this.setState(prevState => ({
					...prevState,
					isOnline: true,
					update: new Date()
				}));
			} else if (action && action == Typing().action) {
				if (name) this.contacts[peerId] = { name };
				this.setTyping(peerId);

				if (!this.state.isOnline)
					this.setState(prevState => ({
						...prevState,
						isOnline: true
					}));
			} else if (action && action == JoinUpdate().action) {
				this.fetchGroupDetails(this.state.group);
			} else if (data.message?.user) {
				data.message.user['_id'] = peerId;
				if (!marketStore.storeVendors[peerId]) {
					this.getWalletInfo(peerId);
				}
				this.addNewMessage(data.message, true);
			}
		});
		this.messaging.setOnError(this.onSendError);
		setTimeout(() => (this.initialized = true), 1000);
	};

	fetchConversation = async () => {
		Promise.all([this.fetchTransactionHistory(), this.fetchMessages()])
			.then(values => {
				const data = [...values[0], ...values[1]];
				data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime())

				this.setState(prevState => ({
					...prevState,
					messages: data,
					loading: false,
				}));
			})
			.catch(error => console.log(error));
	};

	fetchTransactionHistory = async () => {
		const { selectedAddress, transactions } = this.props;
		const selectedContact = this.state.contact;
		const address = selectedContact?.address;

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
		const group = this.state.group;
		const selectedContact = this.state.contact;
		const { selectedAddress } = this.props;
		const address = selectedAddress;
		const peerAddr = selectedContact?.address;

		const data = await store.getChatMessages(group || peerAddr);
		if (!data) return Promise.resolve([]);
		const messages = data.messages
			.filter(e => {
				if (this.state.group) return true;
				const senderAddr = e.user._id;
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
		messages.reverse().map(e => {
			const { _id, user } = e;
			this.messageIds.push(_id);
			this.contacts[user?._id] = { name: user?.name || '' };
		})
		return Promise.resolve(messages.reverse());
	};

	fetchProfile = async () => {
		const selectedContact = this.state.contact;
		if (selectedContact) {
			const profile = preferences.peerProfile(selectedContact?.address);
			if (profile) {
				this.state.contact = { ...selectedContact, ...profile }
			}
		}
		const { firstname, lastname } = preferences.onboardProfile || {};
		this.senderName = `${firstname} ${lastname}`;
	};

	onBack = () => {
		store.setActiveChatPeerId(null);
		this.props.navigation.goBack();
	};

	setTyping = (peerId) => {
		this.setState({ typing: peerId });
		if (this.typingTimeout) clearTimeout(this.typingTimeout);

		this.typingTimeout = setTimeout(() => this.setState({ typing: false }), 3000);
	};

	sendTyping = (text) => {
		if (this.sentTyping || !this.initialized || text?.length == 0) return;
		this.sentTyping = true;

		if (this.messaging) this.messaging.send(Typing(this.senderName, this.state.group));

		setTimeout(() => (this.sentTyping = false), 2000);
	};

	onSend = async (message) => {
		const { group, contact } = this.state;
		const peerId = contact?.address;
		message[0].group = group;

		this.addNewMessage(message[0]);
		store.setConversationIsRead(group || peerId, true);

		this.messaging.send(message[0]);
	};

	addNewMessage = async (message, incoming) => {
		if (this.messageIds.includes(message?._id)) {
			return;
		}
		this.messageIds.push(message?._id);
		const { contact, messages } = this.state;
		const group = this.state.group;
		const id = addHexPrefix(message.user._id);

		if (message.group && message.group != group) return;
		if (!message.user.name) {
			message.user.name = preferences.peerProfile(id).name;
		}

		const peers = this.getPeers();
		if (!peers.includes(id)) {
			peers.push(id);
			store.saveConversationPeers(group, peers);
		}

		var newMessages = GiftedChat.append(messages, message);
		newMessages.sort((a, b) => moment(b.createdAt).unix() - moment(a.createdAt).unix())

		this.setState(prevState => ({
			...prevState,
			messages: newMessages,
			typing: false
		}));
		const peerAddr = contact?.address;

		if (!incoming) await store.saveChatMessages(group || peerAddr, { messages: newMessages });
		else {
			store.setConversationIsRead(peerAddr, true);
		}
	};

	renderOwnAvatar = () => {
		const { selectedAddress } = this.props;
		const { avatar } = preferences.onboardProfile || {};

		return !!avatar
			? <RemoteImage source={{ uri: `file://${avatar}` }} style={styles.proImg} />
			: <Identicon diameter={35} address={selectedAddress} />
	}

	renderAvatar = (userAddress, big) => {
		const { selectedAddress } = this.props;

		if (!userAddress || userAddress == selectedAddress) return this.renderOwnAvatar();

		const bigSize = big && styles.bigBubble;
		const contact = preferences.peerProfile(userAddress);

		if (contact?.avatar || contact?.publicInfo?.base64Avatar)
			return (
				<View style={[styles.bubble, bigSize]}>
					<Image
						source={{ uri: `data:image/jpeg;base64,${contact?.avatar || contact?.publicInfo?.base64Avatar}` }}
						style={[styles.proImg, bigSize]}
						resizeMode="contain"
						resizeMethod="scale"
					/>
				</View>
			);

		return <Identicon address={userAddress} diameter={35} />;
	};

	onMoreButtonTap = () => {
		this.setState({ visibleMenu: true });
	};

	renderLoader = () => (
		<View style={styles.emptyContainer}>
			<ActivityIndicator style={styles.loader} size="small" />
		</View>
	);

	renderNavBar() {
		const { contact, group, groupInfo } = this.state;

		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity	{...testID('nav-back')} onPress={this.onBack} style={styles.navButton}>
						<Icon name={'arrow-left'} size={16} style={styles.backIcon} />
					</TouchableOpacity>
					<View style={styles.navBarContentWrapper}>
						<View style={{ flex: 1 }}>
							<View style={{ flexDirection: 'row' }}>
								<Text numberOfLines={1} ellipsizeMode="middle" style={styles.name}>
									{groupInfo?.name || preferences.peerProfile(group)?.name || group}
								</Text>
								<View
									style={[
										styles.isOnline,
										(!this.state.isOnline) && { backgroundColor: colors.grey300 }
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
		this.sendPayloadMessage(RequestPayment(selectedContact?.address, request));
	};

	onPickFile = async () => {
		const results = await FilesReader.pickSingle();
		if (results && results.length != 0) {
			this.sendFile(results[0]);
		}
	};

	sendFile = async (file, msg = null) => {
		const { fileCopyUri, uri, name } = file;
		const path = decodeURIComponent(fileCopyUri || uri);
		const data = await RNFS.readFile(path.replace('file://', ''), 'base64');
		const message = msg ? this.sendMessage(msg) : await this.addFile(file);

		const webrtc = refWebRTC();
		const { selectedAddress } = this.props;
		const peerAddrs = this.getPeers().filter(e => e !== selectedAddress.toLocaleLowerCase());

		peerAddrs.forEach(address => {
			if (!address || address.toLowerCase() == selectedAddress.toLowerCase()) return;
			const ft = FileTransferWebRTC.sendAsParts(data, name, selectedAddress, [address], webrtc, { direct: true, group: this.state.group });
			ft.setOnError(() => {
				alert(`Error: Failed to send to ${address}`);
				this.onSendError(message);
			});
		})
	};

	sendVoice = async (voiceFilePath) => {
		if (!voiceFilePath) return;
		const uri = `file://${voiceFilePath}`;
		const { size } = await RNFS.stat(uri);
		const name = voiceFilePath.replace(/^.*[\\\/]/, '');

		const voiceObj = {
			uri,
			size,
			name,
			type: 'audio'
		};

		this.sendFile(voiceObj);
		this.RBRef.current.close();
	}

	sendMessage = (message) => {
		this.messaging.send(message);
		return message;
	}

	addFile = async file => {
		const { fileCopyUri, uri, name } = file;
		const decodedURL = decodeURIComponent((fileCopyUri || uri).replace("file://", ''));

		try {
			const folder = `${RNFS.DocumentDirectoryPath}/${this.state.group}`;
			if (!(await RNFS.exists(folder))) await RNFS.mkdir(folder);

			const fileName = `${name}`;
			const path = `${folder}/${fileName}`;
			if (await RNFS.exists(path)) {
				RNFS.unlink(path)
			}
			await RNFS.copyFile(decodedURL, path);
			file.uri = `file://${path}`;
		} catch (error) {
			console.log("🚀 ~ file: index.js ~ line 586 ~ Chat ~ error", error)
		}

		const selectedContact = this.state.contact;
		const peerAddr = selectedContact?.address;

		return await this.sendPayloadMessage(ChatFile(peerAddr, file));
	};

	onSendError = async (message) => {
		const conversation = await store.getChatMessages(message.group);
		const { messages } = conversation || { messages: [] };

		if (message.payload) {
			message.payload.failed = true;

			const m = messages.find(e => e._id == message._id);
			Object.assign(m, message);
			this.setState({ messages });

			store.saveChatMessages(message.group, { messages });
		}
	}

	onFileReceived = async ({ data, path }) => {
		const peerId = data.uuid || data.from;
		const conversation = await store.getChatMessages(peerId);
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
			group: this.state.group,
			user: { _id: selectedAddress }
		};
		if (append) this.addNewMessage(message);
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

				const toEnsName = selectedContact?.address;
				const toSelectedAddressName = selectedContact?.name;
				const fromAccountName = `${firstname} ${lastname}`;

				setRecipient(
					selectedAddress,
					selectedContact?.address,
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
					receiveAsset: getEther()
				});
				break;
			case menuKeys.sendFile:
				setTimeout(this.onPickFile, 500);
				break;
			case menuKeys.sendVoice:
				this.RBRef.current.open();
				break;
		}
	};

	renderMenu = () => {
		return (
			<ModalSelector
				visible={true}
				hideKey={true}
				options={menuOptions(this.state.group)}
				onSelect={item => this.onSelectMenuItem(item)}
				onClose={() => this.setState({ visibleMenu: false })}
			/>
		);
	};

	renderTypingFooter = () => {
		const { typing } = this.state;
		if (!typing) return null;

		const senderContact = this.contacts[typing];
		const contact = senderContact && senderContact.name.length > 0 ? senderContact : marketStore.storeVendors[typing];

		return (
			<Text style={styles.typing}>
				{!typing ? ' ' : <><Text style={styles.bold}>{contact?.name || ''}</Text>{strings('chat.user_is_typing')}</>}
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
				{owner ? <Icon name={'dollar'} size={24} style={{ color: colors.white }} /> : <View style={styles.qrView}><QRCode value={link} /></View>}
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

		const groupChat = !!this.state.group;
		const sender = user._id == selectedAddress;
		const data = {
			tx: payload,
			selectedAddress,
			ticker,
			chainId,
			conversionRate,
			currentCurrency,
			primaryCurrency
		};

		return <ChatTransaction data={data} incoming={!sender && !groupChat} dark={!sender && groupChat} />;
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
		const { fileCopyUri, uri, type, loading } = message.payload;
		const path = decodeURIComponent(uri || fileCopyUri).replace('file://', '');

		const { user } = message;
		const incoming = user?._id.toLowerCase() != selectedAddress.toLowerCase();
		const isLoading = loading && incoming;

		delete message.image;

		if (type && type?.indexOf('image') == 0) {
			message.image = `file://${path}`;
			return <ImageMessage key={sha256(path)}	{...message} loading={isLoading} />
		} else if (type && type?.indexOf('audio') == 0) {
			let filePath = `file://${path}`;
			return <AudioMessage key={sha256(path)}	{...message.payload} path={filePath} incoming={incoming} loading={isLoading} />
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
		const { members } = this.groupInfo();
		const failed = members?.length <= 2 && !this.state.group && message.payload && message.payload.failed == true;
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
					{
						this.state.loading ? this.renderLoader() :
							<GiftedChat
								messages={messages}
								onSend={this.onSend}
								user={{ _id: selectedAddress, name: this.senderName }}
								renderUsernameOnMessage
								renderAvatar={props => this.renderAvatar(props?.currentMessage?.user?._id)}
								showUserAvatar
								bottomOffset={0}
								onInputTextChanged={this.sendTyping}
								renderFooter={this.renderTypingFooter}
								renderMessage={this.renderMessage}
								renderActions={() => <Actions onPressActionButton={this.onMoreButtonTap} />}
							/>
					}
					<RecordingBS
						RBRef={this.RBRef}
						onHide={() => this.RBRef.current.close()}
						sendVoice={this.sendVoice}
					/>

					{visibleMenu && this.renderMenu()}
				</View>
			</>
		);
	}
}


const menuKeys = {
	sendCoin: 'sendCoin',
	requestPayment: 'requestPayment',
	sendFile: 'sendFile',
	sendVoice: 'sendVoice'
};

const menuOptions = (group) => {
	const options = [
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
		},
		{
			key: menuKeys.sendVoice,
			value: strings('chat.send_voice'),
			icon: <Icon name={'microphone'} size={24} style={styles.menuIcon} />
		}
	];

	if (group) options.shift();
	return options;
}

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
