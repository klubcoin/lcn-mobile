import React, { PureComponent } from 'react';
import { Dimensions, SafeAreaView, View, Text, StyleSheet, InteractionManager, TouchableOpacity } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import { connect } from 'react-redux';
import { colors, fontStyles } from '../../../styles/common';
import { getPaymentRequestSuccessOptionsTitle } from '../../UI/Navbar';
import PropTypes from 'prop-types';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import StyledButton from '../StyledButton';
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import IonicIcon from 'react-native-vector-icons/Ionicons';
import { showAlert } from '../../../actions/alert';
import Logger from '../../../util/Logger';
import Share from 'react-native-share';
import Modal from 'react-native-modal';
import QRCode from 'react-native-qrcode-svg';
import { renderNumber } from '../../../util/number';
import Device from '../../../util/Device';
import { strings } from '../../../../locales/i18n';
import { protectWalletModalVisible } from '../../../actions/user';
import styles from './styles/index';
import OnboardingScreenWithBg from '../OnboardingScreenWithBg';
import drawables from '../../../common/drawables';
import TrackingScrollView from '../TrackingScrollView';

/**
 * View to interact with a previously generated payment request link
 */
class PaymentRequestSuccess extends PureComponent {
	static navigationOptions = ({ navigation }) =>
		getPaymentRequestSuccessOptionsTitle(navigation, strings('onboarding.success'));

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
		logo: '',
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
		return (
			<OnboardingScreenWithBg screen="a">
				<SafeAreaView style={styles.wrapper} testID={'send-link-screen'}>
					<TrackingScrollView
						style={styles.contentWrapper}
						contentContainerStyle={styles.scrollViewContainer}
					>
						<View style={styles.iconWrapper}>
							<EvilIcons name="share-apple" size={54} style={styles.icon} />
						</View>
						<View style={styles.informationWrapper}>
							<Text style={styles.titleText}>{strings('payment_request.send_link')}</Text>
							<Text style={styles.descriptionText}>{strings('payment_request.description_1')}</Text>
							<Text style={styles.descriptionText}>
								{strings('payment_request.description_2')}
								<Text style={fontStyles.bold}>{' ' + amount + ' ' + symbol}</Text>
							</Text>
						</View>
						<View style={styles.linkWrapper}>
							<Text style={styles.linkText}>{link}</Text>
						</View>

						<View style={styles.buttonsWrapper}>
							<View style={styles.buttonsContainer}>
								<StyledButton
									type={'normal'}
									onPress={this.copyAccountToClipboard}
									containerStyle={styles.button}
								>
									<View style={styles.buttonContent}>
										<View style={styles.buttonIconWrapper}>
											<IonicIcon name={'ios-link'} size={18} color={colors.black} />
										</View>
										<View style={styles.buttonTextWrapper}>
											<Text style={styles.buttonText}>
												{strings('payment_request.copy_to_clipboard')}
											</Text>
										</View>
									</View>
								</StyledButton>
								<StyledButton
									type={'normal'}
									onPress={this.showQRModal}
									containerStyle={styles.button}
									testID={'request-qrcode-button'}
								>
									<View style={styles.buttonContent}>
										<View style={styles.buttonIconWrapper}>
											<FontAwesome name={'qrcode'} size={18} color={colors.black} />
										</View>
										<View style={styles.buttonTextWrapper}>
											<Text style={styles.buttonText}>{strings('payment_request.qr_code')}</Text>
										</View>
									</View>
								</StyledButton>
								<StyledButton type={'white'} onPress={this.onShare} containerStyle={styles.button}>
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
									<Text style={styles.addressTitle}>
										{strings('payment_request.request_qr_code')}
									</Text>

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
										logo={drawables.logo}
										logoSize={50}
										logoBackgroundColor="black"
										logoBorderRadius={100}
										logoMargin={5}
									/>
								</View>
							</View>
						</View>
					</Modal>
				</SafeAreaView>
			</OnboardingScreenWithBg>
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
)(PaymentRequestSuccess);
