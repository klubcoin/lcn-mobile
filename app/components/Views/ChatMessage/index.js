import React, { useEffect, useState, useRef } from 'react';
import {
	Image,
	View,
	StyleSheet,
	BackHandler,
	Modal,
	TouchableOpacity,
	Text,
	PermissionsAndroid,
	Platform,
	Dimensions
} from 'react-native';
import { colors } from '../../../styles/common';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import StyledButton from '../../UI/StyledButton';
import { geChatNavbarOptions } from '../../UI/Navbar';
import { connect } from 'react-redux';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import moment from 'moment';
import EntypoIcon from 'react-native-vector-icons/Entypo';
import Ionicons from 'react-native-vector-icons/Ionicons';
import ImagePicker from 'react-native-image-crop-picker';
import { check, PERMISSIONS, RESULTS } from 'react-native-permissions';
import ImageView from 'react-native-image-viewing';
import TrackingTextInput from '../../UI/TrackingTextInput';
import TrackingScrollView from '../../UI/TrackingScrollView';

const styles = StyleSheet.create({
	root: {
		paddingTop: 24,
		paddingHorizontal: 12,
		flex: 1
	},
	scrollViewContainer: {
		flexGrow: 1,
		flexDirection: 'column-reverse',
		paddingBottom: 24
	},
	container: {
		flex: 1
	},
	header: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16
	},
	line: {
		width: '100%',
		height: 2,
		backgroundColor: colors.blue
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
	headerRight: {
		flex: 1
	},
	name: {
		color: colors.white,
		fontSize: 28,
		fontWeight: '700'
	},
	address: {
		color: colors.blue,
		fontSize: 16,
		maxWidth: 160
	},
	meMessageWrapper: {
		backgroundColor: colors.lightPurple,
		marginTop: 16,
		borderRadius: 12,
		maxWidth: '70%',
		alignSelf: 'flex-end',
		padding: 12
	},
	youMessageWrapper: {
		backgroundColor: colors.lightPurple,
		marginTop: 16,
		borderRadius: 12,
		maxWidth: '70%',
		padding: 12
	},
	meTime: {
		color: colors.blue,
		fontSize: 12,
		fontWeight: '700',
		marginBottom: 6
	},
	youTime: {
		color: colors.pink,
		fontSize: 12,
		fontWeight: '700',
		marginBottom: 6
	},
	meMessage: {
		color: colors.white,
		marginBottom: 6
	},
	youMessage: {
		color: colors.white,
		marginBottom: 6
	},
	footer: {
		flexDirection: 'row',
		padding: 12
	},
	cameraButton: {
		padding: 8,
		borderRadius: 12,
		backgroundColor: colors.lightPurple
	},
	cameraIcon: {
		fontSize: 24,
		color: colors.white
	},
	chatWrapper: {
		flex: 1,
		marginLeft: 8,
		backgroundColor: colors.lightPurple,
		paddingHorizontal: 6,
		borderRadius: 12,
		flexDirection: 'row',
		alignItems: 'center'
	},
	chatInput: {
		flex: 1,
		color: colors.white,
		padding: 0
	},
	sendButton: {
		padding: 8
	},
	sendIcon: {
		fontSize: 24,
		color: colors.white
	},
	centerModal: {
		backgroundColor: colors.greytransparent100,
		justifyContent: 'center',
		width: '100%',
		height: '100%',
		alignItems: 'center'
	},
	contentModal: {
		backgroundColor: colors.purple500,
		width: '60%',
		alignItems: 'center',
		paddingVertical: 20,
		paddingHorizontal: 20,
		borderRadius: 12
	},
	buttonModal: {
		width: '100%',
		marginVertical: 12
	},
	notiCenterModal: {
		backgroundColor: colors.greytransparent100,
		justifyContent: 'center',
		width: '100%',
		height: '100%',
		alignItems: 'center'
	},
	notiContentText: {
		color: colors.red,
		fontSize: 20,
		fontWeight: 'bold',
		textAlign: 'center'
	},
	notiContentModal: {
		backgroundColor: colors.white,
		width: '80%',
		justifyContent: 'space-around',
		alignItems: 'center',
		paddingVertical: 20,
		paddingHorizontal: 20,
		borderRadius: 12,
		minHeight: 200
	},
	notiButtonModal: {
		width: '100%',
		marginVertical: 12
	},
	errorText: {
		marginTop: 6,
		color: colors.pdfColor
	},
	chatImage: {
		resizeMode: 'cover',
		borderRadius: 10,
		width: (width - 64) * 0.7,
		height: (width - 64) * 0.7
	}
});

const { width } = Dimensions.get('screen');

const ChatMessage = ({ navigation, selectedAddress }) => {
	const DUMMY_DATA = {
		name: 'Remi Doe',
		avatar:
			'https://cdn.xsd.cz/resize/3509b1bc606b3a1eb3b4c61e386968a8_resize=1306,1960_.jpg?hash=85a6382b4591f36e9abf639e53cdd20e',
		address: '0x8b03ac5948e261518bc29c7cca38407cdd2f50f0',
		messages: [
			{
				from: selectedAddress,
				time: 1648041775938,
				message: 'Cras justo odio, dapibus ac facilisis in, egestas eget quam.Last'
			},
			{
				from: selectedAddress,
				time: 1648041745938,
				message: 'Cras justo odio, dapibus ac facilisis in, egestas eget quam.'
			},
			{
				from: '0x8b03ac5948e261518bc29c7cca38407cdd2f50f0',
				time: 1648041695938,
				message: 'Cras justo odio, dapibus ac facilisis in, egestas eget quam.'
			},
			{
				from: '0x8b03ac5948e261518bc29c7cca38407cdd2f50f0',
				time: 1648041655938,
				message: 'Cras justo odio, dapibus ac facilisis in, egestas eget quam.'
			},
			{
				from: selectedAddress,
				time: 1648041645938,
				message: 'Cras justo odio, dapibus ac facilisis in, egestas eget quam.'
			},
			{
				from: '0x8b03ac5948e261518bc29c7cca38407cdd2f50f0',
				time: 1648041595938,
				message: 'Cras justo odio, dapibus ac facilisis in, egestas eget quam.'
			},
			{
				from: selectedAddress,
				time: 1648041495938,
				message: 'Cras justo odio, dapibus ac facilisis in, egestas eget quam.'
			},
			{
				from: '0x8b03ac5948e261518bc29c7cca38407cdd2f50f0',
				time: 1648041485938,
				message: 'Cras justo odio, dapibus ac facilisis in, egestas eget quam.'
			}
		]
	};

	const [message, setMessage] = useState('');
	const [messages, setMessages] = useState(DUMMY_DATA.messages);
	const [isViewModal, setIsViewModal] = useState(false);
	const [notiPermissionCamera, setNotiPermissionCamera] = useState(false);
	const [notiMessage, setNotiMessage] = useState(false);
	const [isViewImage, setIsViewImage] = useState(false);
	const [images, setImages] = useState([]);
	const [image, setImage] = useState('');

	let scrollViewRef = useRef();

	useEffect(() => {
		BackHandler.addEventListener('hardwareBackPress', onBack);
		return () => {
			BackHandler.removeEventListener('hardwareBackPress', onBack);
		};
	}, []);

	useEffect(() => {
		scrollViewRef.current.scrollToEnd();
	}, []);

	useEffect(() => {
		setImages(messages.filter(e => !!e.image).map(e => ({ uri: e.image })));
	}, [messages]);

	const onBack = () => {
		return navigation.navigate('ChatList');
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

	const scrollToEnd = () => {
		scrollViewRef?.current?.scrollToEnd({ animated: true });
	};

	const onViewImage = img => {
		setImage(img);
		setIsViewImage(true);
	};

	const renderMe = data => {
		const { time, message: itemMessage, image: itemImage } = data;
		const chatTime = moment(time);
		return (
			<View style={styles.meMessageWrapper}>
				<Text style={styles.meTime}>{chatTime.format('dddd DD MMMM, HH:mm')}</Text>
				{!!itemMessage && <Text style={styles.meMessage}>{itemMessage}</Text>}
				{!!itemImage && (
					<TouchableOpacity activeOpacity={0.7} onPress={() => onViewImage(itemImage)}>
						<Image
							source={{ uri: itemImage }}
							width={(width - 64) * 0.7}
							style={[
								styles.chatImage,
								{
									width: (width - 64) * 0.7,
									height: (width - 64) * 0.7
								}
							]}
						/>
					</TouchableOpacity>
				)}
			</View>
		);
	};

	const renderYou = data => {
		const { time, message: itemMessage, image: itemImage } = data;
		const chatTime = moment(time);
		return (
			<View style={styles.youMessageWrapper}>
				<Text style={styles.youTime}>{chatTime.format('dddd DD MMMM, HH:mm')}</Text>
				{!!itemMessage && <Text style={styles.youMessage}>{itemMessage}</Text>}
				{!!itemImage && (
					<TouchableOpacity activeOpacity={0.7} onPress={() => onViewImage(itemImage)}>
						{' '}
						<Image
							source={{ uri: itemImage }}
							width={(width - 64) * 0.7}
							style={[
								styles.chatImage,
								{
									width: (width - 64) * 0.7,
									height: (width - 64) * 0.7
								}
							]}
						/>
					</TouchableOpacity>
				)}
			</View>
		);
	};

	const onSend = () => {
		setMessages(pre => [
			{
				from: selectedAddress,
				time: new Date().getTime(),
				message
			},
			...pre
		]);
		scrollViewRef.current.scrollToEnd();
		setMessage('');
	};

	const onSendImage = path => {
		setMessages(pre => [
			{
				from: selectedAddress,
				time: new Date().getTime(),
				image: path
			},
			...pre
		]);
		setTimeout(() => {
			scrollViewRef.current.scrollToEnd();
		}, 500);
	};

	const onPickImage = () => {
		if (Platform.OS === 'android') {
			PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(res => {
				if (!res) {
					PermissionsAndroid.request(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(granted => {
						if (granted === PermissionsAndroid.RESULTS.GRANTED) {
							ImagePicker.openPicker({})
								.then(image => {
									setIsViewModal(false);
									onSendImage(image.path);
									// this.avatar = image.path;
									// this.isChangedAvatar = true;
								})
								.catch(err => {
									console.warn(err);
									setNotiMessage(strings('profile.grant_permission_gallery_notification'));
									PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(
										ress => {
											setIsViewModal(false);
											setNotiPermissionCamera(!ress);
										}
									);
								});
						} else {
							setNotiMessage(strings('profile.grant_permission_gallery_notification'));
							setIsViewModal(false);
							setNotiPermissionCamera(!res);
						}
					});
				} else {
					ImagePicker.openPicker({})
						.then(image => {
							setIsViewModal(false);
							onSendImage(image.path);
							// this.avatar = image.path;
							// this.isChangedAvatar = true;
						})
						.catch(err => {
							console.warn(err);
							setNotiMessage(strings('profile.grant_permission_gallery_notification'));
							PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.READ_EXTERNAL_STORAGE).then(
								ress => {
									setIsViewModal(false);
									setNotiPermissionCamera(!ress);
								}
							);
						});
				}
			});
		}
		if (Platform.OS === 'ios') {
			ImagePicker.openPicker({})
				.then(image => {
					setIsViewModal(false);
					onSendImage(image.path);
					// this.avatar = image.path;
					// this.isChangedAvatar = true;
				})
				.catch(err => {
					console.warn(err);
					setNotiMessage(strings('profile.grant_permission_gallery_notification'));
					check(PERMISSIONS.IOS.PHOTO_LIBRARY)
						.then(result => {
							switch (result) {
								case RESULTS.UNAVAILABLE:
									break;
								case RESULTS.DENIED:
									setIsViewModal(false);
									setNotiPermissionCamera(true);
									break;
								case RESULTS.LIMITED:
									break;
								case RESULTS.GRANTED:
									break;
								case RESULTS.BLOCKED:
									setIsViewModal(false);
									setNotiPermissionCamera(true);
									break;
							}
						})
						.catch(error => {
							// …
						});
				});
		}
	};

	const onTakePicture = () => {
		ImagePicker.openCamera({})
			.then(image => {
				setIsViewModal(false);
				onSendImage(image.path);
				// this.avatar = image.path;
				// this.isChangedAvatar = true;
			})
			.catch(err => {
				console.warn(err);
				setNotiMessage(strings('profile.grant_permission_camera_notification'));
				if (Platform.OS === 'android') {
					PermissionsAndroid.check(PermissionsAndroid.PERMISSIONS.CAMERA).then(res => {
						setIsViewModal(false);
						setNotiPermissionCamera(!res);
					});
				}
				if (Platform.OS === 'ios') {
					check(PERMISSIONS.IOS.CAMERA)
						.then(result => {
							switch (result) {
								case RESULTS.UNAVAILABLE:
									break;
								case RESULTS.DENIED:
									setIsViewModal(false);
									setNotiPermissionCamera(true);
									break;
								case RESULTS.LIMITED:
									break;
								case RESULTS.GRANTED:
									break;
								case RESULTS.BLOCKED:
									setIsViewModal(false);
									setNotiPermissionCamera(true);
									break;
							}
						})
						.catch(error => {
							// …
						});
				}
			});
	};

	return (
		<OnboardingScreenWithBg screen="a">
			<View style={styles.root}>
				<View style={styles.header}>
					{renderAvatar(DUMMY_DATA.name, DUMMY_DATA.avatar)}
					<View style={styles.headerRight}>
						<Text style={styles.name}>{DUMMY_DATA.name}</Text>
						<Text style={styles.address} numberOfLines={1} lineBreakMode={'middle'}>
							{`${DUMMY_DATA.address
								.split('')
								.slice(0, 6)
								.join('')}...${DUMMY_DATA.address
								.split('')
								.slice(DUMMY_DATA.address.length - 4, DUMMY_DATA.address.length)
								.join('')}`}
						</Text>
					</View>
				</View>
				{renderLine()}
				<TrackingScrollView
					style={styles.container}
					ref={scrollViewRef}
					contentContainerStyle={styles.scrollViewContainer}
					onLayout={scrollToEnd}
				>
					{messages.map(mess => (mess.from === selectedAddress ? renderMe(mess) : renderYou(mess)))}
				</TrackingScrollView>
			</View>
			<View style={styles.footer}>
				<TouchableOpacity onPress={() => setIsViewModal(true)} activeOpacity={0.7} style={styles.cameraButton}>
					<EntypoIcon name={'camera'} style={styles.cameraIcon} />
				</TouchableOpacity>
				<View style={styles.chatWrapper}>
					<TrackingTextInput
						style={styles.chatInput}
						value={message}
						onChangeText={setMessage}
						placeholder={strings('chat.chat_text')}
						placeholderTextColor={colors.grey200}
					/>
					{!!message && (
						<TouchableOpacity onPress={onSend} activeOpacity={0.7} style={styles.sendButton}>
							<Ionicons name={'send'} style={styles.sendIcon} />
						</TouchableOpacity>
					)}
				</View>
			</View>
			<Modal visible={isViewModal} animationType="fade" transparent style={styles.modal}>
				<TouchableOpacity
					style={styles.centerModal}
					onPress={() => {
						setIsViewModal(false);
					}}
					activeOpacity={1}
				>
					<View style={styles.contentModal}>
						<StyledButton type={'normal'} onPress={onPickImage} containerStyle={styles.buttonModal}>
							{strings('profile.select_image')}
						</StyledButton>
						<StyledButton type={'normal'} onPress={onTakePicture} containerStyle={styles.buttonModal}>
							{strings('profile.take_a_picture')}
						</StyledButton>
					</View>
				</TouchableOpacity>
			</Modal>
			<Modal visible={notiPermissionCamera} animationType="fade" transparent>
				<View style={styles.notiCenterModal}>
					<View style={styles.notiContentModal}>
						<Text style={styles.notiContentText}>{notiMessage}</Text>
						<StyledButton
							type={'normal'}
							onPress={() => {
								setNotiPermissionCamera(false);
							}}
							containerStyle={styles.notiButtonModal}
						>
							{strings('navigation.close')}
						</StyledButton>
					</View>
				</View>
			</Modal>
			<ImageView
				images={images}
				imageIndex={images.findIndex(e => e.uri === image)}
				visible={isViewImage}
				onRequestClose={() => setIsViewImage(false)}
			/>
		</OnboardingScreenWithBg>
	);
};

ChatMessage.navigationOptions = ({ navigation }) => geChatNavbarOptions(navigation);

ChatMessage.propTypes = {
	navigation: PropTypes.object,
	selectedAddress: PropTypes.string
};

const mapStateToProps = state => ({
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress
});

export default connect(mapStateToProps)(ChatMessage);
