import React, { PureComponent } from 'react';
import { Dimensions, SafeAreaView, View, Text, InteractionManager, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { connect } from 'react-redux';
import { colors, fontStyles } from '../../../../styles/common';
import { getTipRequestOptionsTitle } from '../../../UI/Navbar';
import PropTypes from 'prop-types';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import StyledButton from '../../../UI/StyledButton';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import IonicIcon from 'react-native-vector-icons/Ionicons';
import { showAlert } from '../../../../actions/alert';
import Logger from '../../../../util/Logger';
import Share from 'react-native-share'; // eslint-disable-line  import/default
import Modal from 'react-native-modal';
import QRCode from 'react-native-qrcode-svg';
import { renderNumber } from '../../../../util/number';
import { strings } from '../../../../../locales/i18n';
import { protectWalletModalVisible } from '../../../../actions/user';
import styles from './styles/index';
import TrackingScrollView from '../../../UI/TrackingScrollView';
import { captureRef } from 'react-native-view-shot';

/**
 * View to interact with a previously generated payment request link
 */
class TipperDetails extends PureComponent {
	static navigationOptions = ({ navigation }) => getTipRequestOptionsTitle(navigation);

	static propTypes = {
		/**
		 * Object that represents the navigator
		 */
		navigation: PropTypes.object,
		/**
        /* Triggers global alert
        */
		showAlert: PropTypes.func,
		/**
        /* Prompts protect wallet modal
        */
		protectWalletModalVisible: PropTypes.func
	};

	state = {
		link: '',
		qrLink: '',
		amount: '',
		symbol: '',
		qrModalVisible: false
	};

	/**
	 * Sets payment request link, amount and symbol of the asset to state
	 */
	componentDidMount = () => {
		const { navigation } = this.props;
		const link = navigation && navigation.getParam('link', '');
		const qrLink = navigation && navigation.getParam('qrLink', '');
		const amount = navigation && navigation.getParam('amount', '');
		const symbol = navigation && navigation.getParam('symbol', '');
		this.setState({ link, qrLink, amount, symbol });
	};

	componentWillUnmount = () => {
		this.props.protectWalletModalVisible();
	};

	/**
	 * Copies payment request link to clipboard
	 */
	copyAccountToClipboard = async () => {
		const { link } = this.state;
		await Clipboard.setString(link);
		InteractionManager.runAfterInteractions(() => {
			this.props.showAlert({
				isVisible: true,
				autodismiss: 1500,
				content: 'clipboard-alert',
				data: { msg: strings('payment_request.link_copied') }
			});
		});
	};

	/**
	 * Shows share native UI
	 */
	onShare = () => {
		const { link } = this.state;
		Share.open({
			message: link
		}).catch(err => {
			Logger.log('Error while trying to share payment request', err);
		});
	};

	onShareQRCode = async () => {
		const path = await captureRef(this.QRCodeWrapperRef, {
			quality: 1,
			format: 'png'
		});
		Share.open({
			url: path
		}).catch(err => {
			Logger.log('Error while trying to share payment request', err);
		});
	};

	/**
	 * Toggles payment request QR code modal on top
	 */
	showQRModal = () => {
		this.setState({ qrModalVisible: true });
	};

	/**
	 * Closes payment request QR code modal
	 */
	closeQRModal = () => {
		this.setState({ qrModalVisible: false });
	};

	render() {
		const { link, amount, symbol, qrModalVisible } = this.state;
		const appLogo = require('../../../../images/logo.png');

		return (
			<SafeAreaView style={styles.wrapper} testID={'send-link-screen'}>
				<TrackingScrollView style={styles.contentWrapper} contentContainerStyle={styles.scrollViewContainer}>
					<View style={styles.iconWrapper}>
						<EvilIcons name="share-apple" size={54} style={styles.icon} />
					</View>
					<View style={styles.informationWrapper}>
						<Text style={styles.titleText}>{strings('payment_request.send_link')}</Text>
						<Text style={styles.descriptionText}>{strings('tipper.tip_link_desc1')}</Text>
						<Text style={styles.descriptionText}>
							{strings('tipper.tip_link_desc2') + ':'}
							<Text style={fontStyles.bold}>{' ' + renderNumber(amount) + ' ' + symbol}</Text>
						</Text>
					</View>
					<View style={styles.linkWrapper}>
						<Text style={styles.linkText} numberOfLines={5}>
							{link}
						</Text>
					</View>
					<View
						style={styles.qrCodeWrapper}
						ref={ref => {
							this.QRCodeWrapperRef = ref;
						}}
					>
						{!!this.state.qrLink && (
							<QRCode
								value={this.state.qrLink}
								size={Dimensions.get('window').width - 160}
								logo={appLogo}
								logoSize={50}
								getRef={ref => (this.qrCodeRef = ref)}
								style={{ alignSelf: 'center' }}
							/>
						)}
					</View>
					<View style={styles.buttonsWrapper}>
						<View style={styles.buttonsContainer}>
							<StyledButton
								type={'qr-code'}
								onPress={this.copyAccountToClipboard}
								containerStyle={styles.button}
							>
								<View style={styles.buttonContent}>
									<View style={styles.buttonIconWrapper}>
										<IonicIcon name={'ios-link'} size={18} color={colors.blue} />
									</View>
									<View style={styles.buttonTextWrapper}>
										<Text style={styles.buttonText}>
											{strings('payment_request.copy_to_clipboard')}
										</Text>
									</View>
								</View>
							</StyledButton>
							<StyledButton
								type={'qr-code'}
								onPress={this.onShareQRCode}
								containerStyle={styles.button}
								testID={'request-qrcode-button'}
							>
								<View style={styles.buttonContent}>
									<View style={styles.buttonIconWrapper}>
										<FontAwesome name={'qrcode'} size={18} color={colors.blue} />
									</View>
									<View style={styles.buttonTextWrapper}>
										<Text style={styles.buttonText}>{strings('tipper.send_qr_cdoe')}</Text>
									</View>
								</View>
							</StyledButton>
							<StyledButton type={'normal'} onPress={this.onShare} containerStyle={styles.button}>
								<View style={styles.buttonContent}>
									<View style={styles.buttonIconWrapper}>
										<EvilIcons name="share-apple" size={24} style={styles.blueIcon} />
									</View>
									<View style={styles.buttonTextWrapper}>
										<Text style={styles.blueButtonText}>
											{strings('payment_request.send_link')}
										</Text>
									</View>
								</View>
							</StyledButton>
						</View>
					</View>
				</TrackingScrollView>
				<Modal
					isVisible={qrModalVisible}
					onBackdropPress={this.closeQRModal}
					onBackButtonPress={this.closeQRModal}
					onSwipeComplete={this.closeQRModal}
					swipeDirection={'down'}
					propagateSwipe
				>
					<View style={styles.detailsWrapper}>
						<View style={styles.qrCode} testID={'payment-request-qrcode'}>
							<View style={styles.titleQr}>
								<Text style={styles.addressTitle}>{strings('tipper.tip_through_qr')}</Text>

								<TouchableOpacity
									style={styles.closeIcon}
									onPress={this.closeQRModal}
									testID={'payment-request-qrcode-close-button'}
								>
									<IonicIcon name={'ios-close'} size={28} color={colors.black} />
								</TouchableOpacity>
							</View>
							<View style={styles.qrCodeWrapper}>
								<QRCode
									value={this.state.qrLink}
									size={Dimensions.get('window').width - 160}
									logo={appLogo}
									logoSize={50}
								/>
							</View>
						</View>
					</View>
				</Modal>
			</SafeAreaView>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	showAlert: config => dispatch(showAlert(config)),
	protectWalletModalVisible: () => dispatch(protectWalletModalVisible())
});

export default connect(
	null,
	mapDispatchToProps
)(TipperDetails);
