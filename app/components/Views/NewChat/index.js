import React, { useEffect, useState } from 'react';
import { View, StyleSheet, Modal, TouchableOpacity, Text } from 'react-native';
import { colors } from '../../../styles/common';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import StyledButton from '../../UI/StyledButton';
import { geChatNavbarOptions } from '../../UI/Navbar';
import { connect } from 'react-redux';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import AntDesignIcon from 'react-native-vector-icons/AntDesign';
import QRScanner from '../../UI/QRScanner';
import { showError } from '../../../util/notify';
import { parse } from 'eth-url-parser';
import { isValidAddress } from 'ethereumjs-util';
import TrackingTextInput from '../../UI/TrackingTextInput';
import TrackingScrollView from '../../UI/TrackingScrollView';
import { testID } from '../../../util/Logger';
import store from '../Message/store';
import API from 'services/api';
import Routes from 'common/routes';
import preferences from '../../../store/preferences';

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
	line: {
		width: '100%',
		height: 2,
		backgroundColor: colors.blue
	},
	to: {
		color: colors.white,
		fontWeight: '700',
		marginTop: 24,
		fontSize: 20
	},
	inputWrapper: {
		flexDirection: 'row',
		borderRadius: 6,
		marginTop: 8,
		paddingLeft: 12,
		paddingRight: 6,
		backgroundColor: colors.lightPurple
	},
	input: {
		flex: 1,
		color: colors.white,
		fontSize: 14
	},
	scanButton: {
		padding: 12
	},
	scanIcon: {
		fontSize: 24,
		color: colors.blue
	},
	sendButton: {
		alignItems: 'center',
		marginBottom: 24,
		marginHorizontal: 24
	},
	sendText: {
		fontWeight: '700',
		fontSize: 16,
		color: colors.black
	},
	qrModal: {
		height: '120%'
	}
});

const NewChat = ({ navigation }) => {
	const [isScanQR, setIsScanQR] = useState(false);
	const [address, setAddress] = useState('');
	const [isValidEnterAddress, setIsValidEnterAddress] = useState(false);

	const onScanQR = () => {
		setIsScanQR(true);
	};

	const renderLine = () => {
		return <View style={styles.line} />;
	};

	const onQRScan = res => {
		setIsScanQR(false);
		const content = res.data;
		if (!content) {
			showError(strings('address_book.unrecognized_qr_code'));
			return;
		}
		if (content.split('ethereum:').length > 1 && !parse(content).function_name) {
			const data = parse(content);
			if (data.target_address) {
				setAddress(data.target_address);
			}
			return;
		}
		showError(strings('address_book.unrecognized_qr_code'));
	};

	useEffect(() => {
		if (isValidAddress(address)) {
			setIsValidEnterAddress(true);
		}
	}, [address]);

	const onChat = () => {
		API.postRequest(Routes.walletInfo, [address.toLowerCase()], response => {
			if (response.result) {
				const peerProfile = preferences.peerProfile(address) || {};
				preferences.setPeerProfile(address, { ...peerProfile, ...JSON.parse(response.result.publicInfo) });
				store.setConversationIsRead(address, true);
				navigation.replace('Chat', { selectedContact: { address } });
			} else {
				showError(strings('chat.new_chat_error'));
			}
		});
		return;
	};

	return (
		<OnboardingScreenWithBg screen="a">
			<TrackingScrollView style={styles.container} contentContainerStyle={styles.scrollViewContainer}>
				<View style={styles.header}>
					<Text style={styles.chat}>{strings('chat.new_chat')}</Text>
				</View>
				{renderLine()}
				<Text style={styles.to}>{strings('chat.to')}</Text>
				<View style={styles.inputWrapper}>
					<TrackingTextInput
						{...testID('new-chat-address-field')}
						value={address}
						onChangeText={setAddress}
						style={styles.input}
						placeholder={strings('chat.search_desc')}
						placeholderTextColor={colors.grey100}
						maxLength={256}
					/>
					<TouchableOpacity style={styles.scanButton} activeOpacity={0.7} onPress={onScanQR}>
						<AntDesignIcon name={'scan1'} style={styles.scanIcon} />
					</TouchableOpacity>
				</View>
			</TrackingScrollView>
			<StyledButton
				testID={'new-chat-senbd-meessage-button'}
				type="normal"
				containerStyle={styles.sendButton}
				onPress={onChat}
				disabled={!isValidEnterAddress}
			>
				<Text style={styles.sendText}>{strings('chat.send_message')}</Text>
			</StyledButton>
			<Modal visible={isScanQR} style={styles.qrModal}>
				<QRScanner
					onBarCodeRead={e => onQRScan(e)}
					onClose={() => {
						setIsScanQR(false);
					}}
				/>
			</Modal>
		</OnboardingScreenWithBg>
	);
};

NewChat.navigationOptions = ({ navigation }) => geChatNavbarOptions(navigation);

NewChat.propTypes = {
	navigation: PropTypes.object
};

const mapStateToProps = state => ({});

export default connect(mapStateToProps)(NewChat);
