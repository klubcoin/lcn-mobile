import React, { Component } from 'react';
import { SafeAreaView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { GiftedChat } from 'react-native-gifted-chat';
import Identicon from '../../../UI/Identicon';
import preferences from '../../../../store/preferences';
import { makeObservable, observable } from 'mobx';
import { connect } from 'react-redux';
import { colors } from '../../../../styles/common';
import Icon from 'react-native-vector-icons/Ionicons';

class Chat extends Component {
	static navigationOptions = () => ({ header: null });

	state = {
		to: this.props.navigation.getParam('to'),
		from: {},
		messages: [
			{
				_id: 1,
				text: 'Hello developer',
				createdAt: new Date(),
				user: {
					_id: this.props.navigation.getParam('to'),
					name: 'React Native',
					avatar: 'https://placeimg.com/140/140/any'
				}
			}
		]
	};

	componentDidMount() {
		console.log('account1', this.props.identities);
	}

	renderAvatar = address => {
		return <Identicon address={address} diameter={35} />;
	};

	onBack = () => {
		this.props.navigation.goBack();
	};

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.onBack} style={styles.navButton}>
						<Icon name={'arrow-back'} size={22} style={styles.backIcon} />
					</TouchableOpacity>
					<View style={{ alignItems: 'center', flex: 10 }}>
						<Text numberOfLines={1} ellipsizeMode="middle" style={styles.name}>
							User
						</Text>
						<Text numberOfLines={1} ellipsizeMode="middle" style={styles.address}>
							{this.state.to}
						</Text>
					</View>
					<View style={{ flex: 1 }} />
				</View>
			</SafeAreaView>
		);
	}

	render() {
		return (
			<>
				{this.renderNavBar()}
				<View style={{ flex: 1 }}>
					<GiftedChat
						messages={this.state.messages}
						onSend={messages => console.log(messages)}
						user={{
							_id: 1
						}}
						renderAvatar={() => this.renderAvatar(this.state.messages[0].user._id)}
					/>
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
	}
});

const mapStateToProps = state => ({
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	identities: state.engine.backgroundState.PreferencesController.identities,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress
});

export default connect(mapStateToProps)(Chat);
