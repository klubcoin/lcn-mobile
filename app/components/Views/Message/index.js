import React, { Component } from 'react';
import {
	ScrollView,
	StyleSheet,
	Text,
	TextInput,
	TouchableOpacity,
	View,
	FlatList,
	TouchableWithoutFeedback,
	Alert
} from 'react-native';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { strings } from '../../../../locales/i18n';
import { colors } from '../../../styles/common';
import Identicon from '../../UI/Identicon';
import MessageItem from './components/MessageItem';
import SearchBar from '../../Base/SearchBar';
import preferences from '../../../store/preferences';
import { connect } from 'react-redux';
import { NavigationEvents } from 'react-navigation';
import { SwipeRow } from 'react-native-swipe-list-view';
import Device from '../../../util/Device';
import MessagingWebRTC from '../../../services/MessagingWebRTC';
import { refWebRTC } from '../../../services/WebRTC';
import { Chat } from '../../../services/Messages';

const swipeOffset = Device.getDeviceWidth() / 4;

class Message extends Component {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle('Messages', navigation);

	state = {
		searchQuery: '',
		conversations: []
	};

	componentDidMount() {
		this.initConnection();
		preferences.setActiveChatPeerId(null);
		this.filterConversations();
	}

	componentWillUnmount() {
		if (this.listener) this.listener.remove();
	}

	initConnection = () => {
		this.messaging = new MessagingWebRTC(null, null, refWebRTC());
		this.listener = this.messaging.addListener('message', (data, peerId) => {
			const { _id } = data.message;

			if (_id) {
				preferences.setConversationIsRead(data.from, false);
				this.fetchHistoryMessages();
			}
		});
	};

	fetchHistoryMessages = async () => {
		// await preferences.deleteChatMessages();
		const records = await preferences.getChatMessages();
		const { addressBook, network } = this.props;
		const addresses = addressBook[network] || {};
		const users = Object.keys(records).map(e => addresses[e]);

		users.forEach(e => {
			e.lastMessage = records[e.address].messages[0];
			e.isRead = records[e.address].isRead;
		});

		this.setState(prevState => ({
			...prevState,
			conversations: users
		}));
	};

	handleSearch = value => {
		this.setState({ searchQuery: value });
	};

	filterConversations = () =>
		this.state.conversations.filter(e => {
			const { searchQuery } = this.state;
			const query = searchQuery.toLocaleLowerCase();
			return e.name.toLocaleLowerCase().includes(query) || e.address.toLocaleLowerCase().includes(query);
		});

	gotoChatRoom = recipient => {
		preferences.setConversationIsRead(recipient.address, true);
		this.props.navigation.navigate('Chat', { selectedContact: recipient });
	};

	selectContact = () => {
		this.props.navigation.navigate('Contacts', {
			contactSelection: 1,
			onConfirm: contacts => this.gotoChatRoom(contacts[0])
		});
	};

	onDelete = async user => {
		Alert.alert('Delete message', `Are you sure to delete messages with ${user.name} ?`, [
			{
				text: 'Yes',
				onPress: async () => {
					await preferences.deleteChatMessage(user.address);
					await this.fetchHistoryMessages();
				}
			},
			{
				text: 'No',
				onPress: () => console.log('No Pressed'),
				style: 'cancel'
			}
		]);
	};

	renderMessage = ({ item }) => {
		return (
			<SwipeRow key={item.address} stopRightSwipe={0} rightOpenValue={-swipeOffset} disableRightSwipe>
				<View style={styles.standaloneRowBack}>
					<TouchableWithoutFeedback onPress={value => this.onDelete(item)}>
						<View style={styles.swipeableOption}>
							<Text style={{ color: colors.white, fontWeight: '700' }}>Delete</Text>
						</View>
					</TouchableWithoutFeedback>
				</View>
				<View style={styles.standaloneRowFront}>
					<MessageItem
						recipient={item}
						onItemPress={() => this.gotoChatRoom({ address: item.address })}
						isRead={item.isRead}
					/>
				</View>
			</SwipeRow>
		);
	};

	render() {
		return (
			<View style={styles.container}>
				<NavigationEvents onWillFocus={this.fetchHistoryMessages} />
				<SearchBar
					placeholder={'Search messages...'}
					value={this.state.searchQuery}
					onChange={this.handleSearch}
				/>
				<FlatList
					data={this.filterConversations()}
					keyExtractor={item => `${item.name}${item.address}`}
					renderItem={data => this.renderMessage(data)}
				/>
				<TouchableOpacity style={styles.floatingButton} onPress={this.selectContact}>
					<Icon name="plus" style={{ color: colors.white }} size={20} />
				</TouchableOpacity>
			</View>
		);
	}
}

const mapStateToProps = state => ({
	addressBook: state.engine.backgroundState.AddressBookController.addressBook,
	network: state.engine.backgroundState.NetworkController.network
});

export default connect(mapStateToProps)(Message);

const styles = StyleSheet.create({
	container: {
		flex: 1,
		paddingHorizontal: 16
	},
	searchSection: {
		marginHorizontal: 20,
		marginVertical: 10,
		padding: 10,
		flexDirection: 'row',
		alignItems: 'center',
		borderWidth: 1,
		borderRadius: 8,
		borderColor: colors.grey100
	},
	textInput: {
		flex: 1,
		height: 30,
		marginLeft: 5,
		paddingVertical: 0
	},
	floatingButton: {
		borderRadius: 30,
		backgroundColor: colors.primaryFox,
		width: 50,
		height: 50,
		alignItems: 'center',
		justifyContent: 'center',
		position: 'absolute',
		bottom: 30,
		right: 30
	},
	standaloneRowBack: {
		alignItems: 'center',
		backgroundColor: colors.red,
		flex: 1,
		flexDirection: 'row',
		justifyContent: 'flex-end'
	},
	standaloneRowFront: {
		backgroundColor: colors.white,
		justifyContent: 'center'
	},
	swipeableOption: {
		width: swipeOffset,
		alignItems: 'center',
		backgroundColor: colors.red,
		height: '100%',
		justifyContent: 'center'
	}
});
