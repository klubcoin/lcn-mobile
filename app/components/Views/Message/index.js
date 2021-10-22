import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
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

class Message extends Component {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle('Messages', navigation);

	state = {
		searchQuery: '',
		users: []
	};

	componentDidMount() {
		this.fetchHistoryMessages();
		preferences.setActiveChatPeerId(null);
	}

	fetchHistoryMessages = async () => {
		const records = await preferences.getChatMessages();
		const { addressBook, network } = this.props;
		const addresses = addressBook[network] || {};
		const users = Object.keys(records).map(e => addresses[e]);

		users.forEach(e => (e.lastMessage = records[e.address][0]));
		this.setState(prevState => ({
			...prevState,
			users: users
		}));
	};

	handleSearch = value => {
		this.setState({ searchQuery: value });
	};

	filterContacts = contacts =>
		contacts.filter(e => {
			const { searchQuery } = this.state;
			const query = searchQuery.toLocaleLowerCase();
			return e.name.toLocaleLowerCase().includes(query) || e.address.toLocaleLowerCase().includes(query);
		});

	gotoChatRoom = recipient => {
		this.props.navigation.navigate('Chat', { selectedContact: recipient });
	};

	selectContact = () => {
		this.props.navigation.navigate('Contacts', {
			contactSelection: 1,
			onConfirm: contacts => this.gotoChatRoom(contacts[0])
		});
	};

	render() {
		return (
			<View style={styles.container}>
				<NavigationEvents onWillFocus={this.fetchHistoryMessages} />
				<SearchBar placeholder={'Search messages...'} value={''} onChange={this.handleSearch} />

				<ScrollView>
					{this.state.users?.map(e => (
						<MessageItem
							key={e.address}
							recipient={e}
							onItemPress={() => this.gotoChatRoom({ address: e.address })}
						/>
					))}
				</ScrollView>
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
	}
});
