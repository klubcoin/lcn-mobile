import React, { Component } from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../../styles/common';
import Identicon from '../../../UI/Identicon';
import { connect } from 'react-redux';
import { format } from 'date-fns';

class MessageItem extends Component {
	render() {
		const { recipientAddr, message, onItemPress, addressBook, network } = this.props;

		const addresses = addressBook[network] || {};
		const user = addresses[recipientAddr];
		const lastMessage = message[message.length - 1];
		const formattedDate = format(new Date(lastMessage.createdAt), 'H:mma');

		return (
			<TouchableOpacity style={styles.container} onPress={() => onItemPress(user)}>
				<View style={[styles.hasMessage, { backgroundColor: !message.isRead && 'dodgerblue' }]} />
				<Identicon address={recipientAddr} diameter={40} />
				<View style={{ flex: 3, marginHorizontal: 8 }}>
					<Text
						style={[styles.address, !message.isRead && styles.unreadStyle]}
						numberOfLines={1}
						ellipsizeMode="middle"
					>
						{user?.name}
					</Text>
					<View style={{ flexDirection: 'row', alignItems: 'flex-end' }}>
						<Text style={[styles.message, !message.isRead && styles.unreadStyle]} numberOfLines={2}>
							{lastMessage.text}
						</Text>
					</View>
				</View>
				<View style={{ flex: 2, marginHorizontal: 8, alignItems: 'flex-end' }}>
					<Text style={styles.time}>{formattedDate}</Text>
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
	}
});
