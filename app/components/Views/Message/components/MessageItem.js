import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image } from 'react-native';
import { colors } from '../../../../styles/common';
import Identicon from '../../../UI/Identicon';
import { connect } from 'react-redux';
import { format } from 'date-fns';
import { makeObservable, observable } from 'mobx';
import preferences from '../../../../store/preferences';

class MessageItem extends Component {
	user = {};
	lastMessage = {};
	formattedDate = '';

	constructor(props) {
		super(props);
		makeObservable(this, {
			user: observable,
			lastMessage: observable,
			formattedDate: observable
		});
	}

	componentDidMount() {
		this.initData();
	}

	componentDidUpdate() {
		this.initData();
	}

	initData = async () => {
		const { recipientAddr, message, onItemPress, addressBook, network } = this.props;
		message?.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt));
		const addresses = addressBook[network] || {};

		this.user = addresses[recipientAddr];
		this.lastMessage = message[0];
		this.formattedDate = format(new Date(this.lastMessage.createdAt), 'H:mma');

		const profile = await preferences.peerProfile(recipientAddr);
		if (profile) {
			this.user.avatar = profile.avatar;
		}
	};

	renderAvatar = () => {
		if (this.user.avatar)
			return (
				<Image
					source={{ uri: `data:image/jpeg;base64,${this.user.avatar}` }}
					style={styles.proImg}
					resizeMode="contain"
					resizeMethod="scale"
				/>
			);

		return <Identicon address={this.user.address} diameter={35} />;
	};

	render() {
		const { onItemPress } = this.props;

		return (
			<TouchableOpacity style={styles.container} onPress={() => onItemPress(this.user)}>
				<View style={[styles.hasMessage, { backgroundColor: 'dodgerblue' }]} />
				{this.renderAvatar()}
				<View style={{ flex: 3, marginHorizontal: 8 }}>
					<Text style={[styles.address, styles.unreadStyle]} numberOfLines={1} ellipsizeMode="middle">
						{this.user?.name}
					</Text>
					<View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
						<Text style={[styles.message, styles.unreadStyle]} numberOfLines={2}>
							{this.lastMessage.text}
						</Text>
					</View>
				</View>
				<View style={{ flex: 2, marginHorizontal: 8, alignItems: 'flex-end' }}>
					<Text style={styles.time}>{this.formattedDate}</Text>
				</View>
			</TouchableOpacity>
		);
	}
}

const mapStateToProps = state => ({
	addressBook: state.engine.backgroundState.AddressBookController.addressBook,
	network: state.engine.backgroundState.NetworkController.network
});

export default connect(mapStateToProps)(MessageItem);

const styles = StyleSheet.create({
	container: {
		paddingVertical: 16,
		flexDirection: 'row',
		alignItems: 'center'
	},
	address: {
		fontSize: 16,
		fontWeight: '400',
		maxWidth: 200
	},
	message: {
		textAlign: 'justify',
		color: colors.grey400,
		fontWeight: '300',
		fontSize: 14
	},
	time: {
		flex: 1,
		marginLeft: 10,
		color: colors.grey400,
		fontWeight: '300',
		fontSize: 14
	},
	hasMessage: {
		width: 10,
		height: 10,
		borderRadius: 10,
		alignSelf: 'center',
		marginRight: 10
	},
	unreadStyle: {
		fontWeight: '600',
		color: colors.black
	},
	proImg: {
		width: 35,
		height: 35,
		borderRadius: 100
	}
});
