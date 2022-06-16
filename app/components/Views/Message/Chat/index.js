import React, { Component, createRef } from 'react';
import {
	SafeAreaView,
	StyleSheet,
	Text,
	TouchableOpacity,
	View,
	Platform,
	Image,
	DeviceEventEmitter,
	ActivityIndicator,
	BackHandler,
	Modal,
	Keyboard,
	TextInput,
	ScrollView
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
import EntypoIcon from 'react-native-vector-icons/Entypo';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import Ionicons from 'react-native-vector-icons/Ionicons';
import { refWebRTC } from '../../../../services/WebRTC';
import MessagingWebRTC from '../store/MessagingWebRTC';
import { strings } from '../../../../../locales/i18n';
import {
	ChatFile,
	ChatProfile,
	DeleteMessage,
	EditMessage,
	JoinUpdate,
	RequestPayment,
	SeenMessage,
	TransactionSync,
	Typing
} from '../store/Messages';
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
import styles from './styles/index';
import { testID } from '../../../../util/Logger';
import RecordingBS from '../../../UI/RecordingBS';
import RemoteImage from '../../../Base/RemoteImage';
import EthereumAddress from '../../../UI/EthereumAddress';
import TrackingTextInput from '../../../UI/TrackingTextInput';
import { getChatNavigationOptionsTitle } from '../../../UI/Navbar';
import Clipboard from '@react-native-community/clipboard';
import { showAlert } from '../../../../actions/alert';
import ActionModal from '../../../UI/ActionModal';
import { AckWebRTC } from '../../../../services/Messages';

const LIMIT_MESSAGE_DISPLAY = 2048;
const LIMIT_MESSAGE_LENGTH = 65536;

class Chat extends Component {
	static navigationOptions = ({ navigation }) => getChatNavigationOptionsTitle('Chat', navigation);
	messaging;
	forwardMessaging = {};
	forwardListeners = {};
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
		message: '',
		composerHeight: 44,
		selectedMessage: null,
		showActionModal: false,
		editMessage: null,
		quoteMessage: null,
		deleteMessage: null,
		layoutMessages: [],
		unSeenMessages: [],
		savedOffset: 0,
		savedHeight: 0,
		showForwardModal: false,
		forwardMessage: null,
		forwardText: '',
		historyMessages: [],
		forwardSentList: [],
		forwardSearch: ''
	};

	myModalActions = [
		{
			title: strings('chat.edit'),
			action: message => this.onEdit(message)
		},
		{
			title: strings('chat.copy'),
			action: message => this.onCopy(message)
		},
		{
			title: strings('chat.forward'),
			action: message => this.onForward(message)
		},
		{
			title: strings('chat.reply'),
			action: message => this.onQuote(message)
		},
		{
			title: strings('chat.delete_for_everyone'),
			action: message => this.onDelete(message)
		},
		{
			title: strings('chat.delete_for_myself'),
			action: message => this.onDeleteMyself(message)
		}
	];

	youModalActions = [
		{
			title: strings('chat.copy'),
			action: message => this.onCopy(message)
		},
		{
			title: strings('chat.forward'),
			action: message => this.onForward(message)
		},
		{
			title: strings('chat.reply'),
			action: message => this.onQuote(message)
		},
		{
			title: strings('chat.delete_for_myself'),
			action: message => this.onDeleteMyself(message)
		}
	];
	constructor(props) {
		super(props);
		this.chatRef = createRef();
	}

	RBRef = React.createRef();

	one2oneGroup() {
		this.isOne2One = true;
		const { selectedAddress } = this.props;
		return [selectedAddress, this.recipient.address]
			.sort((a, b) => `${a}`.toLowerCase().localeCompare(`${b}`.toLowerCase()))
			.join('.')
			.toLowerCase();
	}

	getOne2oneGroup(address) {
		this.isOne2One = true;
		const { selectedAddress } = this.props;
		return [selectedAddress, address]
			.sort((a, b) => `${a}`.toLowerCase().localeCompare(`${b}`.toLowerCase()))
			.join('.')
			.toLowerCase();
	}

	groupInfo = () => {
		const { groupInfo } = this.state;
		return groupInfo || {};
	};

	componentDidMount() {
		BackHandler.addEventListener('hardwareBackPress', this.onBack);
		store.setActiveChatPeerId(this.state.group);
		this.bindContactForAddress();
		this.fetchConversation();
		this.fetchHistoryMessages();
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

	getWalletInfos = members => {
		const { selectedAddress } = this.props;
		[selectedAddress, ...members].forEach(e => this.getWalletInfo(e));
	};

	getWalletInfo = async address => {
		const peerProfile = preferences.peerProfile(address) || {};
		APIService.getWalletInfo(address, (success, json) => {
			if (success && json) {
				preferences.setPeerProfile(address.toLowerCase(), {
					...peerProfile,
					...JSON.parse(json.result.publicInfo)
				});
			}
		});
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

			groupInfo.peers
				.filter(e => !!e)
				.map(e => {
					const address = e;
					const user = addresses[address] || addresses[address?.toLowerCase()];

					this.contacts[address] = { name: user?.name || '' };
				});
		}
	}

	componentWillUnmount() {
		BackHandler.removeEventListener('hardwareBackPress', this.onBack);
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
	};

	getPeersGroup = (group, contact) => {
		const peerId = contact?.address;
		const info = store.conversationInfos[group] || {};

		const peers = info?.peers?.filter(e => e != group) || [];
		if (peers.indexOf(peerId) < 0) peers.push(peerId);
		return peers;
	};

	initConnection = () => {
		const { selectedAddress } = this.props;
		this.messaging = new MessagingWebRTC(selectedAddress, this.getPeers, refWebRTC());

		this.listener = this.messaging.addListener('message', (data, peerId) => {
			if (data.action) {
				const { action } = data;
				if (action === ChatProfile().action) {
					const peerProfile = preferences.peerProfile(peerId);
					if (peerProfile) {
						peerProfile.avatar = data.profile.avatar;
						preferences.setPeerProfile(peerId, peerProfile);
					}
					this.setState(prevState => ({
						...prevState,
						isOnline: true,
						update: new Date(),
						avatar: data.profile.avatar
					}));
				} else if (action === AckWebRTC().action) {
					const ackData = data.data;
					if (!!ackData._id & !ackData.action) {
						this.sentMessage(ackData._id);
					}
				}
			}

			const { action, name, group } = data.message || {};
			if (group && group != this.state.group) return;

			if (action === ChatProfile().action) {
				this.setState(prevState => ({
					...prevState,
					isOnline: true,
					update: new Date()
				}));
			} else if (action && action === Typing().action) {
				if (name) this.contacts[peerId] = { name };
				this.setTyping(peerId);

				if (!this.state.isOnline) {
					this.setState(prevState => ({
						...prevState,
						isOnline: true
					}));
				}
			} else if (action && action === JoinUpdate().action) {
				this.fetchGroupDetails(this.state.group);
			} else if (action && action === EditMessage().action) {
				if (!marketStore.storeVendors[peerId]) {
					this.getWalletInfo(peerId);
				}
				this.editMessage(data.message, true);
			} else if (action && action === DeleteMessage().action) {
				if (!marketStore.storeVendors[peerId]) {
					this.getWalletInfo(peerId);
				}
				this.removeMessage(data.message, true);
			} else if (action && action === SeenMessage().action) {
				if (!marketStore.storeVendors[peerId]) {
					this.getWalletInfo(peerId);
				}
				this.seenMessage(data.message);
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

	fetchHistoryMessages = async () => {
		const { selectedAddress, addressBook, network } = this.props;
		const addresses = addressBook[network] || {};
		const records = await store.getChatMessages();

		const historyMessages = Object.keys(records)
			.filter(uuid => {
				const address = uuid
					.toLowerCase()
					.replace('.', '')
					.replace(selectedAddress.toLowerCase(), '');
				return (
					Object.keys(addresses).find(a => a?.toLocaleLowerCase() == address?.toLowerCase()) ||
					preferences.peerProfile(address)
				);
			})
			.map(uuid => {
				const address = uuid
					.toLowerCase()
					.replace('.', '')
					.replace(selectedAddress.toLowerCase(), '');
				const conversation = { address, ...records[uuid] };

				delete conversation.messages;
				return Object.assign(conversation, preferences.peerProfile(address));
			});
		this.setState({ historyMessages });
	};

	onForward = message => {
		this.setState({
			showForwardModal: true,
			forwardMessage: message,
			selectedMessage: null,
			showActionModal: false
		});
	};

	onHideForwardModal = () => {
		this.setState({
			showForwardModal: false,
			forwardMessage: null,
			forwardSearch: '',
			forwardSentList: [],
			forwardText: ''
		});
	};

	callBackSeenMessage = async => {
		const { savedOffset, savedHeight } = this.state;
		setTimeout(async () => {
			this.onSeenMessages(savedOffset, savedHeight);
		}, 2000);
	};

	fetchConversation = async () => {
		const { selectedAddress } = this.props;
		Promise.all([this.fetchTransactionHistory(), this.fetchMessages()])
			.then(values => {
				const data = [...values[0], ...values[1]];
				data.sort((a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime());
				this.setState(prevState => ({
					...prevState,
					messages: data.map(e => ({
						...e,
						hided: e?.text?.length > LIMIT_MESSAGE_DISPLAY,
						quoteHided: e?.quote?.text > LIMIT_MESSAGE_DISPLAY
					})),
					unSeenMessages: data.filter(e => !e.isSeen && e.user._id !== selectedAddress).map(e => e._id),
					loading: false
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
						e => transactions.find(t => t.transactionHash === e.hash) || map3rdPartyTransaction(e)
					);

					const filteredTransactions = trans.filter(e => {
						const { transaction } = e;
						return (
							parseInt(transaction.value, 16) > 0 &&
							(transaction.from === address || transaction.to === address)
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

	sentMessage = async messageId => {
		const { messages } = this.state;
		const newMessages = messages.map(e => (e._id === messageId ? { ...e, isReceived: true } : e));
		this.setState({ messages: newMessages });
	};

	fetchMessages = async () => {
		const group = this.state.group;
		const selectedContact = this.state.contact;
		const { selectedAddress } = this.props;
		const address = selectedAddress;
		const peerAddr = selectedContact?.address;

		const data = await store.getChatMessages(group || peerAddr);
		if (!data) return Promise.resolve([]);
		const messages = data.messages.filter(e => {
			if (this.state.group) return true;
			const senderAddr = e.user._id;
			if (e.payload) {
				if (e.transaction || e.payload.action === TransactionSync().action) {
					return false;
				} else {
					const {
						payload: { from, to }
					} = e;
					return from === peerAddr || to === peerAddr || senderAddr === peerAddr;
				}
			} else {
				return senderAddr === address || senderAddr === peerAddr;
			}
		});
		messages.reverse().map(e => {
			const { _id, user } = e;
			this.messageIds.push(_id);
			this.contacts[(user?._id)] = { name: user?.name || '' };
		});
		return Promise.resolve(messages.reverse());
	};

	fetchProfile = async () => {
		const selectedContact = this.state.contact;
		if (selectedContact) {
			const profile = preferences.peerProfile(selectedContact?.address);
			if (profile) {
				this.state.contact = { ...selectedContact, ...profile };
			}
		}
		const { firstname, lastname } = preferences.onboardProfile || {};
		this.senderName = `${firstname} ${lastname}`;
	};

	onBack = () => {
		store.setActiveChatPeerId(null);
		this.props.navigation.goBack();
		BackHandler.removeEventListener('hardwareBackPress', this.onBack);
		return true;
	};

	setTyping = peerId => {
		this.setState({ typing: peerId });
		if (this.typingTimeout) clearTimeout(this.typingTimeout);

		this.typingTimeout = setTimeout(() => this.setState({ typing: false }), 3000);
	};

	sendTyping = text => {
		if (this.sentTyping || !this.initialized || text?.length === 0) return;
		this.sentTyping = true;

		if (this.messaging) this.messaging.send(Typing(this.senderName, this.state.group));

		setTimeout(() => (this.sentTyping = false), 2000);
	};

	onSend = async message => {
		const { group, contact, quoteMessage } = this.state;
		const peerId = contact?.address;
		message[0].group = group;
		if (quoteMessage && quoteMessage._id) {
			message[0].quote = {
				_id: quoteMessage._id,
				createdAt: quoteMessage.createdAt,
				group: quoteMessage.group,
				text: quoteMessage.text,
				user: quoteMessage.user
			};
		}

		this.addNewMessage(message[0]);
		store.setConversationIsRead(group || peerId, true);

		this.messaging.send(message[0]);
		this.setState({ message: '', quoteMessage: null });
	};

	onEditMessage = async message => {
		const { group, contact } = this.state;
		const peerId = contact?.address;
		message.group = group;

		this.editMessage(message);
		store.setConversationIsRead(group || peerId, true);

		this.messaging.send(EditMessage(message._id, message.group, message.text, message.user));
		this.setState({ message: '', editMessage: null });
	};

	editMessage = async (message, incoming) => {
		const { contact, messages } = this.state;
		const group = this.state.group;
		const id = addHexPrefix(message.user._id);
		message.hided = message.text.length > LIMIT_MESSAGE_DISPLAY;
		if (message.group && message.group != group) return;
		if (!message.user.name) {
			message.user.name = preferences.peerProfile(id).name;
		}
		const peers = this.getPeers();
		if (!peers.includes(id)) {
			peers.push(id);
			store.saveConversationPeers(group, peers);
		}
		const newMessages = messages.map(e => (e._id === message._id ? { ...e, ...message, edited: true } : e));
		this.setState({ messages: newMessages });
		const peerAddr = contact?.address;

		if (!incoming) await store.saveChatMessages(group || peerAddr, { messages: newMessages });
		else {
			store.setConversationIsRead(peerAddr, true);
		}
	};

	addNewMessage = async (message, incoming) => {
		if (this.messageIds.includes(message?._id)) {
			return;
		}
		this.messageIds.push(message?._id);
		const { contact, messages, unSeenMessages } = this.state;
		const group = this.state.group;
		const id = addHexPrefix(message.user._id);
		message.hided = message.text.length > LIMIT_MESSAGE_DISPLAY;
		if (message.quote) {
			message.quote.hided = message.quote?.text?.length > LIMIT_MESSAGE_DISPLAY;
		}
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
		newMessages.sort((a, b) => moment(b.createdAt).unix() - moment(a.createdAt).unix());

		this.setState(prevState => ({
			...prevState,
			messages: newMessages,
			unSeenMessages: [...unSeenMessages, message._id],
			typing: false
		}));
		const peerAddr = contact?.address;

		if (!incoming) await store.saveChatMessages(group || peerAddr, { messages: newMessages });
		else {
			store.setConversationIsRead(peerAddr, true);
		}
		this.callBackSeenMessage();
	};

	addNewMessageIntoGroup = async (message, group, peerId) => {
		const conversation = (await store.getChatMessages(group || peerId)) || { messages: [], isRead: false };

		const ids = conversation.messages.map(e => e?._id);
		if (!ids.includes(message?._id)) {
			conversation.messages.unshift(message);
			store.saveChatMessages(group || peerId, conversation);
		}
	};

	renderOwnAvatar = () => {
		const { selectedAddress } = this.props;
		const { avatar } = preferences.onboardProfile || {};

		return !!avatar ? (
			<RemoteImage source={{ uri: `file://${avatar}` }} style={styles.proImg} />
		) : (
			<Identicon diameter={35} address={selectedAddress} />
		);
	};

	renderAvatar = (userAddress, big) => {
		const { selectedAddress } = this.props;

		if (!userAddress || userAddress === selectedAddress) return this.renderOwnAvatar();

		const bigSize = big && styles.bigBubble;
		const contact = preferences.peerProfile(userAddress);

		if (contact?.avatar || contact?.publicInfo?.base64Avatar) {
			return (
				<View style={[styles.bubble, bigSize]}>
					<Image
						source={{
							uri: `data:image/jpeg;base64,${contact?.avatar || contact?.publicInfo?.base64Avatar}`
						}}
						style={[styles.proImg, bigSize]}
						resizeMode="contain"
						resizeMethod="scale"
					/>
				</View>
			);
		}
		return <Identicon address={userAddress} diameter={35} />;
	};

	onMoreButtonTap = () => {
		this.setState({ visibleMenu: true });
	};

	onScrollToMessage = messageId => {
		const { messages, layoutMessages } = this.state;
		const message = messages.find(e => e._id === messageId);
		if (!message) return;
		const layoutMessage = layoutMessages.find(e => e._id === messageId);
		const layoutMessageIndex = layoutMessages.findIndex(e => e._id === messageId);
		if (!layoutMessage) {
			this.chatRef?.current?._listRef?._scrollRef?.scrollToEnd();
			return;
		}
		const height = layoutMessages
			.slice(0, layoutMessageIndex)
			.map(e => e.height)
			.reduce((a, b) => a + b);
		this.chatRef?.current?._listRef?._scrollRef.scrollTo(height);
	};

	renderLoader = () => (
		<View style={styles.emptyContainer}>
			<ActivityIndicator style={styles.loader} size="small" color={colors.white} />
		</View>
	);

	renderNavBar() {
		const { contact, group, groupInfo } = this.state;

		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity {...testID('nav-back')} onPress={this.onBack} style={styles.navButton}>
						<Icon name={'arrow-left'} size={16} style={styles.backIcon} />
					</TouchableOpacity>
					<View style={styles.navBarContentWrapper}>
						<View style={{ flex: 1 }}>
							<Text numberOfLines={1} ellipsizeMode="middle" style={styles.headerText}>
								{strings('chat.chat')}
							</Text>
						</View>
					</View>
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
			if (!address || address.toLowerCase() === selectedAddress.toLowerCase()) return;
			const ft = FileTransferWebRTC.sendAsParts(data, name, selectedAddress, [address], webrtc, {
				direct: true,
				group: this.state.group
			});
			ft.setOnError(() => {
				alert(`Error: Failed to send to ${address}`);
				this.onSendError(message);
			});
		});
	};

	sendVoice = async voiceFilePath => {
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
	};

	sendMessage = message => {
		this.messaging.send(message);
		return message;
	};

	addFile = async file => {
		const { fileCopyUri, uri, name } = file;
		const decodedURL = decodeURIComponent((fileCopyUri || uri).replace('file://', ''));

		try {
			const folder = `${RNFS.DocumentDirectoryPath}/${this.state.group}`;
			if (!(await RNFS.exists(folder))) await RNFS.mkdir(folder);

			const fileName = `${name}`;
			const path = `${folder}/${fileName}`;
			if (await RNFS.exists(path)) {
				RNFS.unlink(path);
			}
			await RNFS.copyFile(decodedURL, path);
			file.uri = `file://${path}`;
		} catch (error) {}

		const selectedContact = this.state.contact;
		const peerAddr = selectedContact?.address;

		return await this.sendPayloadMessage(ChatFile(peerAddr, file));
	};

	onSendError = async message => {
		const conversation = await store.getChatMessages(message.group);
		const { messages } = conversation || { messages: [] };

		if (message.payload) {
			message.payload.failed = true;

			const m = messages.find(e => e._id === message._id);
			Object.assign(m, message);
			this.setState({ messages });

			store.saveChatMessages(message.group, { messages });
		}
	};

	onFileReceived = async ({ data, path }) => {
		const peerId = data.uuid || data.from;
		const conversation = await store.getChatMessages(peerId);
		const { messages } = conversation || { messages: [] };

		const message = messages.find(e => {
			const { payload } = e;
			if (payload && payload.action === ChatFile().action) {
				return payload.name === data.name;
			}
		});

		if (message) {
			message.payload.uri = `file://${path}`;
			message.payload.loading = false;
			this.setState({ messages });
		}
	};

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
		if (append) {
			this.addNewMessage(message);
		}
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
		const { typing, composerHeight } = this.state;
		if (!typing) return <View style={{ height: composerHeight - 40 }} />;

		const senderContact = this.contacts[typing];
		const contact =
			senderContact && senderContact.name.length > 0 ? senderContact : marketStore.storeVendors[typing];

		return (
			<Text style={[styles.typing, { marginBottom: composerHeight - 38 }]}>
				<Text style={styles.bold}>{contact?.name || ''}</Text>
				{strings('chat.user_is_typing')}
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

		const owner = user._id === selectedAddress;
		const textColor = colors.white;

		return (
			<View style={styles.paymentRequestWrapper}>
				{owner ? (
					<Icon name={'dollar'} size={24} style={{ color: colors.white }} />
				) : (
					<View style={styles.qrView}>
						<QRCode value={link} />
					</View>
				)}
				<View style={{ marginLeft: 10, flex: 1 }}>
					<Text style={{ color: textColor }}>{strings('chat.payment_request')}</Text>
					<Text style={{ color: textColor, fontWeight: '600' }}>
						{`${strings('chat.amount')}: ${amount} ${symbol}`}
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
		const sender = user._id === selectedAddress;
		const data = {
			tx: payload,
			selectedAddress,
			ticker,
			chainId,
			conversionRate,
			currentCurrency,
			primaryCurrency
		};

		return <ChatTransaction data={data} incoming={!sender && !groupChat} />;
	};

	renderCustomView = message => {
		const { payload } = message;
		if (message.transaction || payload.action === TransactionSync().action) {
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

	renderMedia = message => {
		const { selectedAddress } = this.props;
		const { fileCopyUri, uri, type, loading } = message.payload;
		const path = decodeURIComponent(uri || fileCopyUri).replace('file://', '');

		const { user } = message;
		const incoming = user?._id.toLowerCase() != selectedAddress.toLowerCase();
		const isLoading = loading && incoming;

		delete message.image;

		if (type && type?.indexOf('image') === 0) {
			message.image = `file://${path}`;
			return <ImageMessage key={sha256(path)} {...message} loading={isLoading} />;
		} else if (type && type?.indexOf('audio') === 0) {
			let filePath = `file://${path}`;
			return <AudioMessage key={sha256(path)} {...message.payload} path={filePath} loading={isLoading} />;
		}
		return <FileMessage key={sha256(path)} {...message.payload} incoming={incoming} loading={isLoading} />;
	};

	renderMessage = messageProps => {
		const { currentMessage } = messageProps;
		const isCustom = currentMessage.payload;
		const { layoutMessages } = this.state;
		return (
			<View
				onLayout={e => {
					if (!layoutMessages.find(e => e._id === currentMessage._id)) {
						this.setState({
							layoutMessages: [
								...layoutMessages,
								{
									_id: currentMessage._id,
									height: e.nativeEvent.layout.height,
									createdAt: new Date(currentMessage.createdAt).getTime()
								}
							].sort((a, b) => b.createdAt - a.createdAt)
						});
					}
				}}
			>
				<Message
					{...messageProps}
					renderMessageImage={() => null}
					renderBubble={e => this.renderBubble(currentMessage, e)}
					renderCustomView={isCustom ? () => this.renderBubble(currentMessage) : null}
				/>
			</View>
		);
	};

	onRetry = async message => {
		const { messages } = this.state;
		message.payload.failed = false;

		this.setState({ messages });
		this.retrySending(message);
	};

	retrySending = async message => {
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
	};

	onPressMessage = (message, hided) => {
		if (message?.text?.length <= LIMIT_MESSAGE_DISPLAY) {
			return;
		}
		const { messages } = this.state;
		this.setState({ messages: messages.map(e => ({ ...e, hided: e._id === message._id ? !hided : e.hided })) });
	};

	onPressQuoteMessage = (message, quoteMessage, quoteHided) => {
		if (quoteMessage?.text?.length <= LIMIT_MESSAGE_DISPLAY) {
			return;
		}
		const { messages } = this.state;
		this.setState({
			messages: messages.map(e => ({ ...e, quoteHided: e._id === message._id ? !quoteHided : e.quoteHided }))
		});
	};

	onSelectMessage = message => {
		if (message.payload) {
			return;
		}
		this.setState({ selectedMessage: message, showActionModal: true });
	};

	onHideModal = () => {
		this.setState({ selectedMessage: null, showActionModal: false });
	};

	onQuote = message => {
		const { message: textMessage, editMessage } = this.state;
		this.setState({
			selectedMessage: null,
			quoteMessage: message,
			showActionModal: false,
			editMessage: null,
			message: !editMessage ? textMessage : ''
		});
	};

	onCloseQuote = () => {
		this.setState({ quoteMessage: null });
	};

	onCopy = message => {
		Clipboard.setString(message.text);
		this.props.showAlert({
			isVisible: true,
			autodismiss: 1500,
			content: 'clipboard-alert',
			data: { msg: strings('chat.message_copied_to_clipboard') }
		});
		this.onHideModal();
	};

	onDelete = message => {
		const { quoteMessage, editMessage, message: textMessage } = this.state;
		this.setState({
			deleteMessage: message,
			quoteMessage: quoteMessage?._id === message._id ? null : quoteMessage,
			editMessage: editMessage?._id === message._id ? null : editMessage,
			selectedAddress: null,
			showActionModal: false,
			message: !editMessage || editMessage?._id === message._id ? textMessage : ''
		});
		this.onHideModal();
	};

	onDeleteMyself = async () => {
		const { contact, messages, selectedMessage } = this.state;
		if (!selectedMessage) {
			this.onHideModal();
			return;
		}
		const group = this.state.group;

		const peers = this.getPeers();
		const newMessages = messages.filter(e => e._id !== selectedMessage._id);
		this.setState({ messages: newMessages, selectedMessage: null, showActionModal: false });
		const peerAddr = contact?.address;

		await store.saveChatMessages(group || peerAddr, { messages: newMessages });
	};

	onCancelDelete = () => {
		this.setState({
			deleteMessage: null
		});
	};

	onConfirmDelete = () => {
		const { group, contact, deleteMessage } = this.state;
		if (!deleteMessage) {
			return;
		}
		const peerId = contact?.address;
		let message = DeleteMessage(
			deleteMessage._id,
			deleteMessage.group,
			deleteMessage.user,
			deleteMessage.createdAt
		);
		this.removeMessage(message);
		store.setConversationIsRead(group || peerId, true);
		this.messaging.send(message);

		this.setState({
			deleteMessage: null
		});
	};

	removeMessage = async (message, incoming) => {
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
		const newMessages = messages.map(e => (e._id === message._id ? message : e));
		this.setState({ messages: newMessages });
		const peerAddr = contact?.address;

		if (!incoming) await store.saveChatMessages(group || peerAddr, { messages: newMessages });
		else {
			store.setConversationIsRead(peerAddr, true);
		}
	};

	onCloseEdit = () => {
		this.setState({ message: '', editMessage: null });
	};

	onEdit = message => {
		this.setState({
			message: message.text,
			quoteMessage: null,
			editMessage: message,
			selectedMessage: null,
			showActionModal: false
		});
	};

	renderSendingIcon = () => <Ionicons name={'md-checkmark-sharp'} style={styles.sendingIcon} />;
	renderReceivedIcon = () => <Ionicons name={'md-checkmark-done-sharp'} style={styles.receivedIcon} />;
	renderSeenIcon = () => <Ionicons name={'md-checkmark-done-sharp'} style={styles.seenIcon} />;

	onSeenMessages = async (offset, height) => {
		const { layoutMessages, unSeenMessages, messages, contact, group } = this.state;
		if (unSeenMessages.length === 0) {
			return;
		}
		const seenMessageIds = unSeenMessages.filter(unSeenMessage => {
			const messageIndex = layoutMessages.findIndex(e => e._id === unSeenMessage);
			const message = layoutMessages.find(e => e._id === unSeenMessage);
			if (messageIndex >= 0) {
				const messageOffset =
					messageIndex === 0
						? 0
						: messageIndex === 1
						? message.height
						: layoutMessages
								.slice(0, messageIndex)
								.map(e => e.height)
								.reduce((a, b) => a + b);
				if (
					message.height + messageOffset - offset > 40 &&
					offset + height - message.height - messageOffset > 0
				) {
					return true;
				}
			}
		});
		const peerAddr = contact?.address;
		seenMessageIds.map(messageId => this.onSeenMessage(messages.find(e => e._id === messageId)));
		this.setState({
			savedOffset: offset,
			savedHeight: height,
			unSeenMessages: unSeenMessages.filter(e => !seenMessageIds.includes(e))
		});
		const newMessages = messages.map(e => (seenMessageIds.includes(e._id) ? { ...e, isSeen: true } : e));
		await store.saveChatMessages(group || peerAddr, { messages: newMessages });
	};

	onSeenMessage = seenMessage => {
		const { group, contact } = this.state;
		if (!seenMessage) {
			return;
		}
		const peerId = contact?.address;
		let message = SeenMessage(seenMessage._id, seenMessage.group, seenMessage.user);
		store.setConversationIsRead(group || peerId, true);
		this.messaging.send(message);
	};

	seenMessage = async message => {
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
		const newMessages = messages.map(e => (e._id === message._id ? { ...e, isSeen: true } : e));
		this.setState({ messages: newMessages });
	};

	renderBubble = message => {
		const { selectedAddress } = this.props;
		const { createdAt, text, user, payload, hided, quote, edited, isReceived, isSeen } = message;
		const { messages, layoutMessages } = this.state;
		const { members } = this.groupInfo();
		const failed = members?.length <= 2 && !this.state.group && payload?.failed === true;
		const chatTime = moment(createdAt);
		const incoming = user._id !== selectedAddress;
		const styleTime = {
			marginTop: 10,
			marginLeft: 10,
			marginRight: 10,
			color: incoming ? colors.pink : colors.blue
		};

		if (message.deleted) {
			return (
				<View style={styles.chatBubbleDelete}>
					<Text style={[styles.time, styleTime]}>{chatTime.format('dddd DD MMMM, HH:mm')}</Text>
					<View style={styles.textMessage}>
						<Text style={styles.removeMessage}>{strings('chat.remove_message')}</Text>
					</View>
				</View>
			);
		}

		return (
			<>
				{edited && !incoming && <MaterialCommunityIcons name="pencil-outline" style={styles.editedIcon} />}
				<TouchableOpacity
					style={[styles.chatBubble, !!quote && styles.quoteBubble]}
					activeOpacity={0.7}
					onLongPress={() => this.onSelectMessage(message)}
				>
					<View style={incoming ? styles.chatBubbleContentYou : styles.chatBubbleContentMe}>
						<View style={styles.messageBubble}>
							<Text style={[styles.time, styleTime]}>{chatTime.format('dddd DD MMMM, HH:mm')}</Text>
						</View>
						{!!payload ? (
							this.renderCustomView(message)
						) : (
							<View style={styles.textMessage}>
								{!!quote && this.renderBubbleQuote(quote, message)}
								{!!text && (
									<Text>
										<Text style={styles.text}>
											{hided ? `${text.slice(0, LIMIT_MESSAGE_DISPLAY)}` : text}
										</Text>
										{text?.length > LIMIT_MESSAGE_DISPLAY &&
											(hided ? (
												<Text
													style={styles.readMore}
													onPress={() => this.onPressMessage(message, hided)}
												>
													{`...${strings('chat.read_more')}`}
												</Text>
											) : (
												<Text
													style={styles.readMore}
													onPress={() => this.onPressMessage(message, hided)}
												>
													{`   ${strings('chat.hide')}`}
												</Text>
											))}
									</Text>
								)}
							</View>
						)}
					</View>
					{incoming
						? null
						: isSeen
						? this.renderSeenIcon()
						: isReceived
						? this.renderReceivedIcon()
						: this.renderSendingIcon()}
				</TouchableOpacity>
				{edited && incoming && <MaterialCommunityIcons name="pencil-outline" style={styles.editedIcon} />}
			</>
		);
	};

	renderRetry = message => {
		return (
			<View style={styles.failure}>
				<Text style={styles.failedText}>{strings('chat.failed_to_send')}.</Text>
				<TouchableOpacity activeOpacity={0.6} onPress={() => this.onRetry(message)}>
					<Text style={styles.retry}> {strings('chat.retry')}</Text>
				</TouchableOpacity>
			</View>
		);
	};

	renderProfile = () => {
		const address = this.state.contact.address;
		const profile = preferences.peerProfile(address);

		const avatarName = `${profile?.firstname?.length > 0 ? profile?.firstname[0] : ''} ${
			profile?.lastname?.length > 0 ? profile?.lastname[0] : ''
		}`;

		return (
			<TouchableOpacity
				style={styles.profile}
				onPress={() => {
					Keyboard.dismiss();
				}}
				activeOpacity={1}
			>
				{this.state.avatar || profile?.avatar ? (
					<Image
						style={styles.avatar}
						source={{ uri: `data:image/*;base64,${this.state.avatar || profile?.avatar}` }}
					/>
				) : (
					<View style={styles.noAvatarWrapper}>
						<Text style={styles.noAvatarName}>{avatarName}</Text>
					</View>
				)}
				<View style={{ flex: 1 }}>
					<Text style={styles.name} numberOfLines={2}>{`${profile?.firstname} ${profile?.lastname}`}</Text>
					<EthereumAddress address={address} style={styles.address} type={'short'} />
				</View>
			</TouchableOpacity>
		);
	};

	sendText = () => {
		const { selectedAddress } = this.props;
		const { editMessage, message } = this.state;
		if (editMessage) {
			this.onEditMessage({ ...editMessage, text: message });
			return;
		}
		this.onSend([
			{
				_id: uuid.v4(),
				createdAt: new Date(),
				text: message,
				user: {
					_id: selectedAddress,
					name: preferences.peerProfile(selectedAddress)?.name
				}
			}
		]);
	};

	renderBubbleQuote = (quoteMessage, message) => {
		if (!quoteMessage) return null;
		const { text } = quoteMessage;
		const { quoteHided } = message;
		if (!preferences.peerProfile(quoteMessage.user._id)) {
			this.getWalletInfo(quoteMessage.user._id);
		}
		return (
			<TouchableOpacity
				activeOpacity={0.7}
				style={styles.quoteBubbleWrapper}
				onPress={() => {
					this.onScrollToMessage(quoteMessage._id);
				}}
			>
				<View style={[styles.quoteBubbleContent, !!message.text && styles.quoteBorderBottom]}>
					<View style={styles.quoteIconWrapper}>
						<EntypoIcon style={styles.quoteIcon} name="quote" />
					</View>
					<View style={styles.quoteBubbleMessageWrapper}>
						<Text style={styles.quoteMessage}>
							<Text>
								{quoteHided ? quoteMessage?.text.slice(0, LIMIT_MESSAGE_DISPLAY) : quoteMessage?.text}
							</Text>
							{text?.length > LIMIT_MESSAGE_DISPLAY &&
								(quoteHided ? (
									<Text
										style={styles.readMore}
										onPress={() => this.onPressQuoteMessage(message, quoteMessage, quoteHided)}
									>
										{`...${strings('chat.read_more')}`}
									</Text>
								) : (
									<Text
										style={styles.readMore}
										onPress={() => this.onPressQuoteMessage(message, quoteMessage, quoteHided)}
									>
										{`   ${strings('chat.hide')}`}
									</Text>
								))}
						</Text>
						<Text style={styles.quoteSender}>{`${
							preferences.peerProfile(quoteMessage.user._id)?.firstname
						} ${preferences.peerProfile(quoteMessage.user._id)?.lastname}, ${moment(
							quoteMessage.createdAt
						).format('DD/MM/YYYY')}`}</Text>
					</View>
				</View>
			</TouchableOpacity>
		);
	};

	renderQuote = quoteMessage => {
		if (!quoteMessage) return null;
		if (!preferences.peerProfile(quoteMessage.user._id)) {
			this.getWalletInfo(quoteMessage.user._id);
		}
		return (
			<View style={styles.quoteWrapper}>
				<View style={styles.quoteContent}>
					<View style={styles.quoteIconWrapper}>
						<EntypoIcon style={styles.quoteIcon} name="quote" />
					</View>
					<View style={styles.quoteMessageWrapper}>
						<Text style={styles.quoteMessage} numberOfLines={1}>
							{quoteMessage?.text}
						</Text>
						<Text style={styles.quoteSender}>{`${
							preferences.peerProfile(quoteMessage.user._id)?.firstname
						} ${preferences.peerProfile(quoteMessage.user._id)?.lastname}, ${moment(
							quoteMessage.createdAt
						).format('DD/MM/YYYY')}`}</Text>
					</View>
				</View>
				<TouchableOpacity activeOpacity={0.7} onPress={this.onCloseQuote} style={styles.quoteCloseButton}>
					<EntypoIcon style={styles.quoteCloseIcon} name="cross" />
				</TouchableOpacity>
			</View>
		);
	};

	renderForward = forwardMessage => {
		if (!forwardMessage) return null;
		return (
			<View style={styles.forwardQuoteWrapper}>
				<View style={styles.forwardQuoteContent}>
					<View style={styles.forwardQuoteIconWrapper}>
						<EntypoIcon style={styles.forwardQuoteIcon} name="quote" />
					</View>
					<View style={styles.forwardQuoteMessageWrapper}>
						<Text style={styles.forwardQuoteMessage} numberOfLines={1}>
							{forwardMessage?.text}
						</Text>
						<Text style={styles.forwardQuoteSender}>{`${
							preferences.peerProfile(forwardMessage.user._id).firstname
						} ${preferences.peerProfile(forwardMessage.user._id).lastname}, ${moment(
							forwardMessage.createdAt
						).format('DD/MM/YYYY')}`}</Text>
					</View>
				</View>
			</View>
		);
	};

	renderComposer = () => {
		const { message, quoteMessage, editMessage } = this.state;
		const inputted = message.length !== 0 && (!editMessage || editMessage.text !== message);
		return (
			<View
				style={styles.chatWrapper}
				onLayout={e => {
					this.setState({ composerHeight: e?.nativeEvent?.layout?.height });
				}}
			>
				{this.renderActions()}
				<View style={styles.chatInputWrapper}>
					{this.renderQuote(quoteMessage)}
					<View style={styles.chatInputRow}>
						<TrackingTextInput
							// style={[styles.chatInput, { textAlign: inputted ? 'left' : 'right' }]}
							style={[styles.chatInput, { textAlign: 'left' }]}
							value={message}
							onChangeText={text => {
								this.sendTyping(text);
								this.setState({ message: text });
							}}
							placeholder={strings('chat.chat_text')}
							placeholderTextColor={colors.grey200}
							multiline
							textAlignVertical={'center'}
							maxLength={LIMIT_MESSAGE_LENGTH}
						/>
						{!!editMessage && (
							<MaterialCommunityIcons name={'pencil-off-outline'} style={styles.editPencilIcon} />
						)}
					</View>
				</View>
				{(inputted || quoteMessage) && (
					<TouchableOpacity onPress={this.sendText} activeOpacity={0.7} style={styles.sendButton}>
						<Ionicons name={'send'} style={styles.sendIcon} />
					</TouchableOpacity>
				)}
				{!inputted && !!editMessage && (
					<TouchableOpacity activeOpacity={0.7} style={styles.closeButton} onPress={this.onCloseEdit}>
						<Ionicons name={'close'} style={styles.sendIcon} />
					</TouchableOpacity>
				)}
			</View>
		);
	};

	renderActions = () => {
		return (
			<TouchableOpacity onPress={this.onMoreButtonTap} activeOpacity={0.7} style={styles.cameraButton}>
				<EntypoIcon name={'plus'} style={styles.cameraIcon} />
			</TouchableOpacity>
		);
	};

	renderForwardAvatar = (firstname, lastname, avatarURL) => {
		if (avatarURL) {
			return <Image source={{ uri: avatarURL }} style={styles.forwardItemAvatar} />;
		}
		const avatarName = `${firstname.length > 0 ? firstname[0] : ''} ${lastname.length > 0 ? lastname[0] : ''}`;
		return (
			<View style={styles.forwardItemNoAvatarWrapper}>
				<Text style={styles.forwardItemNoAvatarName}>{avatarName}</Text>
			</View>
		);
	};

	onSendForward = async address => {
		const { selectedAddress } = this.props;
		const { forwardMessage, forwardText, forwardSentList } = this.state;
		const group = this.getOne2oneGroup(address);
		const contact = { address };
		if (!this.forwardMessaging[address]) {
			this.forwardMessaging[address] = new MessagingWebRTC(
				selectedAddress,
				() => this.getPeersGroup(group, contact),
				refWebRTC()
			);
			this.forwardListeners[address] = this.messaging.addListener('message', (data, peerId) => {});
			this.forwardMessaging[address].setOnError(this.onSendError);
		}
		const peerId = address;
		let message = {
			_id: uuid.v4(),
			createdAt: new Date(),
			text: forwardText,
			group,
			user: {
				_id: selectedAddress,
				name: preferences.peerProfile(selectedAddress)?.name
			},
			quote: {
				_id: forwardMessage._id,
				createdAt: forwardMessage.createdAt,
				group: forwardMessage.group,
				text: forwardMessage.text,
				user: forwardMessage.user
			}
		};
		this.forwardMessaging[address].send(message);
		this.setState({
			forwardSentList: forwardSentList.includes(address) ? forwardSentList : [...forwardSentList, address]
		});
		this.addNewMessageIntoGroup(message, group, peerId);
	};

	renderForwardItem = item => {
		const { forwardSentList } = this.state;
		const { address, firstname, lastname, avatar } = item;
		const profile = preferences.peerProfile(address);
		return (
			<View style={styles.forwardItemWrapper}>
				{this.renderForwardAvatar(
					firstname,
					lastname,
					profile?.avatar ? `data:image/*;base64,${profile.avatar}` : avatar
				)}
				<View style={styles.forwardItemContent}>
					<View style={styles.forwardItemNameWrapper}>
						<Text style={styles.forwardItemName}>{`${firstname} ${lastname}`}</Text>
						<Text style={styles.forwardItemAddress} numberOfLines={2} lineBreakMode={'middle'}>
							{address}
						</Text>
					</View>
					{forwardSentList.includes(address) ? (
						<TouchableOpacity
							style={styles.sentForwardButton}
							activeOpacity={0.7}
							onPress={() => this.onSendForward(address.toLowerCase())}
						>
							<MaterialCommunityIcons name="check" style={styles.sentIcon} />
							<Text style={styles.sentText}>{strings('chat.sent')}</Text>
						</TouchableOpacity>
					) : (
						<TouchableOpacity
							style={styles.sendForwardButton}
							activeOpacity={0.7}
							onPress={() => this.onSendForward(address)}
						>
							<Text style={styles.sendText}>{strings('chat.send')}</Text>
						</TouchableOpacity>
					)}
				</View>
			</View>
		);
	};

	render() {
		const { selectedAddress } = this.props;
		const {
			visibleMenu,
			messages,
			selectedMessage,
			showActionModal,
			deleteMessage,
			showForwardModal,
			forwardMessage,
			forwardText,
			forwardSearch,
			historyMessages
		} = this.state;

		return (
			<>
				{/* {this.renderNavBar()} */}
				<View style={styles.body}>
					{this.renderProfile()}
					{this.state.loading ? (
						this.renderLoader()
					) : (
						<GiftedChat
							messages={messages}
							onSend={this.onSend}
							user={{ _id: selectedAddress, name: this.senderName }}
							renderUsernameOnMessage={false}
							renderAvatar={null}
							showUserAvatar
							bottomOffset={0}
							onInputTextChanged={this.sendTyping}
							renderFooter={this.renderTypingFooter}
							renderMessage={this.renderMessage}
							renderComposer={this.renderComposer}
							keyboardShouldPersistTaps={'never'}
							listViewProps={{
								onScroll: e => {
									this.onSeenMessages(
										e.nativeEvent.contentOffset.y,
										e.nativeEvent.layoutMeasurement.height
									);
								},
								onLayout: e => {
									this.onSeenMessages(0, e.nativeEvent.layout.height);
								},
								ref: this.chatRef
							}}
						/>
					)}
					<RecordingBS
						RBRef={this.RBRef}
						onHide={() => this.RBRef.current.close()}
						sendVoice={this.sendVoice}
					/>

					{visibleMenu && this.renderMenu()}
				</View>
				<ActionModal
					modalVisible={!!deleteMessage}
					confirmText={strings('chat.remove').toUpperCase()}
					cancelText={strings('chat.cancel').toUpperCase()}
					confirmTestId={'delete-chat-remove-action'}
					cancelTestId={'delete-chat-cancel-action'}
					onConfirmPress={this.onConfirmDelete}
					onCancelPress={this.onCancelDelete}
					onRequestClose={this.onCancelDelete}
					confirmButtonMode={'warning'}
					cancelButtonMode={'normal'}
				>
					<View style={styles.warningDeleteWrapper}>
						<Text style={styles.warningDeleteText}>{strings('chat.delete_message_warning')}</Text>
					</View>
				</ActionModal>
				<Modal visible={showActionModal} transparent animationType="slide" onRequestClose={this.onHideModal}>
					<TouchableOpacity style={styles.backdropModal} activeOpacity={1} onPress={this.onHideModal}>
						<View style={styles.modalContent}>
							{[
								...(selectedMessage?.user?._id === selectedAddress
									? this.myModalActions
									: this.youModalActions)
							].map((e, index) => (
								<TouchableOpacity
									activeOpacity={0.7}
									key={index}
									style={styles.modalActionItem}
									onPress={() => e.action(selectedMessage)}
								>
									<Text style={styles.modalActionItemTitle}>{e.title}</Text>
								</TouchableOpacity>
							))}
						</View>
					</TouchableOpacity>
				</Modal>
				<Modal
					visible={showForwardModal}
					// visible={true}
					transparent
					animationType="slide"
					onRequestClose={this.onHideForwardModal}
				>
					<TouchableOpacity activeOpacity={1} style={styles.backdropModal}>
						<View style={styles.forwardModalWrapper}>
							<View style={styles.forwardModalHeader}>
								<View style={styles.forwardModalHeaderTitleWrapper}>
									<Text style={styles.forwardModalHeaderTitle}>
										{strings('chat.forward_message')}
									</Text>
								</View>
								<TouchableOpacity
									activeOpacity={0.7}
									style={styles.forwardModalHeaderCloseButton}
									onPress={this.onHideForwardModal}
								>
									<MaterialCommunityIcons name="close" style={styles.forwardModalHeaderCloseIcon} />
								</TouchableOpacity>
							</View>
							<View style={styles.forwardModalQuoteField}>
								{this.renderForward(forwardMessage)}
								<TextInput
									style={styles.forwardMessage}
									value={forwardText}
									onChangeText={e => this.setState({ forwardText: e })}
									placeholder={strings('chat.typing_a_message_here')}
								/>
							</View>
							<TextInput
								style={styles.forwardSearch}
								value={forwardSearch}
								onChangeText={e => this.setState({ forwardSearch: e })}
								placeholder={strings('chat.search')}
								placeholderTextColor={colors.grey200}
							/>
							<ScrollView style={styles.forwardSuggestList}>
								<Text style={styles.forwardSuggestTitle}>{strings('chat.suggested')}</Text>
								{historyMessages
									.filter(
										e =>
											`${e?.firstname} ${e?.lastname}`.includes(forwardSearch) ||
											e?.address.includes(forwardSearch)
									)
									.map(e => this.renderForwardItem(e))}
							</ScrollView>
							<TouchableOpacity
								activeOpacity={0.7}
								style={styles.forwardDoneButton}
								onPress={this.onHideForwardModal}
							>
								<Text style={styles.forwardDoneText}>{strings('chat.done')}</Text>
							</TouchableOpacity>
						</View>
					</TouchableOpacity>
				</Modal>
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

const menuOptions = group => {
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
		}
		// {
		// 	key: menuKeys.sendFile,
		// 	value: strings('chat.send_file'),
		// 	icon: <Icon name={'file'} size={24} style={styles.menuIcon} />
		// },
		// {
		// 	key: menuKeys.sendVoice,
		// 	value: strings('chat.send_voice'),
		// 	icon: <Icon name={'microphone'} size={24} style={styles.menuIcon} />
		// }
	];

	if (group && group.indexOf('0x') < 0) options.shift();
	return options;
};

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
	showAlert: config => dispatch(showAlert(config)),
	setRecipient: (from, to, ensRecipient, transactionToName, transactionFromName) =>
		dispatch(setRecipient(from, to, ensRecipient, transactionToName, transactionFromName)),
	setSelectedAsset: selectedAsset => dispatch(setSelectedAsset(selectedAsset))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Chat);
