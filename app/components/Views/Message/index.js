import React, { Component } from 'react';
import { ScrollView, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import Icon from 'react-native-vector-icons/FontAwesome';
import { strings } from '../../../../locales/i18n';
import { colors } from '../../../styles/common';
import Identicon from '../../UI/Identicon';
import MessageItem from './components/MessageItem';

export default class Message extends Component {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle('Messages', navigation);

	handleSearch = value => {
		console.log(value);
	};

	render() {
		return (
			<View style={styles.container}>
				<View style={styles.searchSection}>
					<Icon name="search" size={22} style={styles.icon} />
					<TextInput
						style={styles.textInput}
						value={''}
						placeholder={`${strings('file.search_files')}...`}
						placeholderTextColor={colors.grey100}
						onChangeText={this.handleSearch}
					/>
				</View>
				<ScrollView>
					<MessageItem />
					<MessageItem />
					<MessageItem />
					<MessageItem />
					<MessageItem />
				</ScrollView>
				<TouchableOpacity style={styles.floatingButton}>
					<Icon name="plus" style={{ color: colors.white }} size={20} />
				</TouchableOpacity>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	container: {
		flex: 1
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
