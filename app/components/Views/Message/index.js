import React, { Component } from 'react';
import { Text, View } from 'react-native';
import { getNavigationOptionsTitle } from '../../UI/Navbar';

export default class Message extends Component {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle('Messages', navigation);

	render() {
		return (
			<View>
				<Text> textInComponent </Text>
			</View>
		);
	}
}
