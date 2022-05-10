import React from 'react';
import { Image, View, StyleSheet, TouchableOpacity, Text } from 'react-native';
import { colors } from '../../../styles/common';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import { geChatListNavbarOptions } from '../../UI/Navbar';
import { connect } from 'react-redux';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import moment from 'moment';
import MaterialCommunityIcons from 'react-native-vector-icons/MaterialCommunityIcons';
import TrackingScrollView from '../../UI/TrackingScrollView';

const styles = StyleSheet.create({
	scrollViewContainer: {
		flexGrow: 1,
		paddingVertical: 24
	},
	container: {
		flex: 1,
		paddingHorizontal: 12
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16
	},
	chat: {
		color: colors.white,
		fontSize: 28,
		fontWeight: '700'
	},
	addChatButton: {
		padding: 12
	},
	addChatIcon: {
		fontSize: 30,
		color: colors.white
	},
	line: {
		width: '100%',
		height: 2,
		backgroundColor: colors.blue
	},
	chatWrapper: {
		flexDirection: 'row',
		marginVertical: 12
	},
	avatar: {
		width: 60,
		height: 60,
		borderRadius: 100,
		marginRight: 12
	},
	noAvatarWrapper: {
		width: 60,
		height: 60,
		borderRadius: 100,
		backgroundColor: colors.white,
		marginRight: 12,
		alignItems: 'center',
		justifyContent: 'center'
	},
	noAvatarName: {
		fontWeight: '600',
		fontSize: 24,
		color: colors.black
	},
	chatContent: {
		flex: 1
	},
	chatContentHeader: {
		flexDirection: 'row',
		marginBottom: 6,
		justifyContent: 'space-between',
		alignItems: 'center'
	},
	chatName: {
		fontSize: 18,
		fontWeight: '600',
		color: colors.white
	},
	chatTime: {
		color: colors.white
	},
	chatMessage: {
		color: colors.grey200,
		marginRight: 24
	}
});

const DUMMY_CHAT_DATA = [
	{
		uuid: '0x8b03ac5948e261518bc29c7cca38407cdd2f50f0',
		name: 'Remi Doe',
		avatar:
			'https://cdn.xsd.cz/resize/3509b1bc606b3a1eb3b4c61e386968a8_resize=1306,1960_.jpg?hash=85a6382b4591f36e9abf639e53cdd20e',
		lastMessageTime: 1652153685938,
		lastMessage:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod as Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod as'
	},
	{
		uuid: '0x8b03ac5948e261518bc29c7cca38407cdd2f50f1',
		name: 'Monique Doe',
		avatar:
			'https://upload.wikimedia.org/wikipedia/commons/thumb/2/25/Monique_Alfradique_-_cropped.jpg/800px-Monique_Alfradique_-_cropped.jpg',
		lastMessageTime: 1652141485938,
		lastMessage:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod as Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod as'
	},
	{
		uuid: '0x8b03ac5948e261518bc29c7cca38407cdd2f50f2',
		name: 'Renaud Doe',
		avatar: '',
		lastMessageTime: 1652041485938,
		lastMessage:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod as Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod as'
	},
	{
		uuid: '0x8b03ac5948e261518bc29c7cca38407cdd2f50f3',
		name: 'Paul Doe',
		avatar:
			'https://www.lstmed.ac.uk/sites/default/files/styles/mc-580-16x9-node/public/content/pages/images/Paul.png?itok=A9dkiQNs',
		lastMessageTime: 1651041485938,
		lastMessage:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod as Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod as'
	},
	{
		uuid: '0x8b03ac5948e261518bc29c7cca38407cdd2f50f4',
		name: 'Pierre Doe',
		avatar: '',
		lastMessageTime: 1648041485938,
		lastMessage:
			'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod as Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod as'
	}
];

const ChatList = ({ navigation }) => {
	const onAddChat = () => {
		navigation.navigate('NewChat');
	};

	const onViewChat = () => {
		navigation.navigate('ChatMessage');
	};

	const renderLine = () => {
		return <View style={styles.line} />;
	};

	const renderAvatar = (name, avatarURL) => {
		if (avatarURL) {
			return <Image source={{ uri: avatarURL }} style={styles.avatar} />;
		}
		const avatarName = name.split(' ').reduce((pre, cur, curIndex) => {
			return curIndex > 2 ? pre : curIndex === 1 ? pre[0] + cur[0] : pre + cur[0];
		});
		return (
			<View style={styles.noAvatarWrapper}>
				<Text style={styles.noAvatarName}>{avatarName}</Text>
			</View>
		);
	};

	const renderChatItem = chat => {
		const { uuid, name, avatar, lastMessage, lastMessageTime } = chat;
		let displayTime = '';
		const lastTime = moment(lastMessageTime);
		const currentTime = moment();
		if (lastTime.format('YYYY MM DD') === currentTime.format('YYYY MM DD')) {
			displayTime = lastTime.format('HH:mm');
		} else {
			displayTime = lastTime.fromNow();
		}
		return (
			<>
				<TouchableOpacity key={uuid} style={styles.chatWrapper} activeOpacity={0.7} onPress={onViewChat}>
					{renderAvatar(name, avatar)}
					<View style={styles.chatContent}>
						<View style={styles.chatContentHeader}>
							<Text style={styles.chatName}>{name}</Text>
							<Text style={styles.chatTime}>{displayTime}</Text>
						</View>
						<Text style={styles.chatMessage} numberOfLines={2}>
							{lastMessage}
						</Text>
					</View>
				</TouchableOpacity>
				{renderLine()}
			</>
		);
	};

	return (
		<OnboardingScreenWithBg screen="a">
			<TrackingScrollView style={styles.container} contentContainerStyle={styles.scrollViewContainer}>
				<View style={styles.header}>
					<Text style={styles.chat}>{strings('chat.chat')}</Text>
					<TouchableOpacity style={styles.addChatButton} activeOpacity={0.7} onPress={onAddChat}>
						<MaterialCommunityIcons name={'comment-plus'} style={styles.addChatIcon} />
					</TouchableOpacity>
				</View>
				{renderLine()}
				{DUMMY_CHAT_DATA.map(chat => renderChatItem(chat))}
			</TrackingScrollView>
		</OnboardingScreenWithBg>
	);
};

ChatList.navigationOptions = ({ navigation }) => geChatListNavbarOptions(navigation);

ChatList.propTypes = {
	navigation: PropTypes.object
};

const mapStateToProps = state => ({});

export default connect(mapStateToProps)(ChatList);
