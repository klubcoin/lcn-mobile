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

export default class Message extends Component {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle('Messages', navigation);

	state = {
		messages: []
	};

	componentDidMount() {
		this.fetchHistoryMessages();
	}

	// componentDidUpdate() {
	// 	this.fetchHistoryMessages();
	// }

	fetchHistoryMessages = async () => {
		await preferences.deleteChatMessage();
		const records = await preferences.getChatMessages();
		this.setState(prevState => ({
			...prevState,
			messages: records
		}));
	};

	handleSearch = value => {
		console.log(value);
	};

	gotoChatRoom = recipient => {
		this.props.navigation.navigate('Chat', { selectedContact: recipient });
	};

	sendPrivateKeyBackup = async contact => {
		this.props.navigation.navigate('Chat', {
			selectedContact: contact[0]
		});
	};

	selectContact = () => {
		this.props.navigation.navigate('Contacts', {
			contactSelection: true,
			onConfirm: this.sendPrivateKeyBackup
		});
	};

	render() {
		return (
			<View style={styles.container}>
				<SearchBar placeholder={'Search messages...'} value={''} onChange={this.handleSearch} />

				<ScrollView>
					{this.state.messages.map(e => (
						<MessageItem message={e} onItemPress={this.gotoChatRoom} />
					))}
				</ScrollView>
				<TouchableOpacity style={styles.floatingButton} onPress={this.selectContact}>
					<Icon name="plus" style={{ color: colors.white }} size={20} />
				</TouchableOpacity>
			</View>
		);
	}
}

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
