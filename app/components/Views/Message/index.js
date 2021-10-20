import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { strings } from '../../../../locales/i18n';
import { colors } from '../../../styles/common';
import Identicon from '../../UI/Identicon';
import MessageItem from './components/MessageItem';
import SearchBar from '../../Base/SearchBar';

const messages = [
	{
		to: '0xFFasbcasdasd123131231231900aaa',
		lastMessage:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
		time: '9:15am'
	},
	{
		to: '0xFFasbcasdasd123131231231900aaa1',
		lastMessage:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
		time: '11:00am'
	},
	{
		to: '0xFFasbcasdasd123131231231900aaa2',
		lastMessage:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
		time: '1:23pm'
	},
	{
		to: '0xFFasbcasdasd123131231231900aaa3',
		lastMessage:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
		time: '2:11pm'
	},
	{
		to: '0xFFasbcasdasd123131231231900aaa4',
		lastMessage:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
		time: '3:00pm'
	},
	{
		to: '0xFFasbcasdasd123131231231900aaa5',
		lastMessage:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
		time: '6:32pm'
	},
	{
		to: '0xFFasbcasdasd123131231231900aaa6',
		lastMessage:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
		time: '7:22pm'
	},
	{
		to: '0xFFasbcasdasd123131231231900aaa7',
		lastMessage:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
		time: '8:00pm'
	},
	{
		to: '0xFFasbcasdasd123131231231900aaa8',
		lastMessage:
			"Lorem Ipsum is simply dummy text of the printing and typesetting industry. Lorem Ipsum has been the industry's standard dummy text ever since the 1500s, when an unknown printer took a galley of type and scrambled it to make a type specimen book.",
		time: '11:59pm'
	}
];

export default class Message extends Component {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle('Messages', navigation);

	handleSearch = value => {
		console.log(value);
	};

	gotoChatRoom = recipient => {
		this.props.navigation.navigate('Chat', { to: recipient });
	};

	sendPrivateKeyBackup = async contact => {
		this.props.navigation.navigate('Chat', {
			selectedContact: contact
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
				<SearchBar placeholder={`${strings('file.search_files')}...`} value={''} onChange={this.handleSearch} />

				<ScrollView>
					{messages.map(e => (
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
