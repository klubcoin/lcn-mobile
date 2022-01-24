import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { InteractionManager, TouchableOpacity, SafeAreaView, Dimensions, StyleSheet, View, Alert } from 'react-native';
import Modal from 'react-native-modal';
import Share from 'react-native-share';
import QRCode from 'react-native-qrcode-svg';
import Clipboard from '@react-native-community/clipboard';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import { connect } from 'react-redux';

import Analytics from '../../../core/Analytics';
import Logger from '../../../util/Logger';
import Device from '../../../util/Device';
import { strings } from '../../../../locales/i18n';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import { generateUniversalLinkAddress } from '../../../util/payment-link-generator';
import { allowedToBuy } from '../FiatOrders';
import { showAlert } from '../../../actions/alert';
import { toggleReceiveModal } from '../../../actions/modals';
import { protectWalletModalVisible } from '../../../actions/user';

import { colors, fontStyles } from '../../../styles/common';
import Text from '../../Base/Text';
import ModalHandler from '../../Base/ModalHandler';
import ModalDragger from '../../Base/ModalDragger';
import AddressQRCode from '../../Views/AddressQRCode';
import EthereumAddress from '../EthereumAddress';
import GlobalAlert from '../GlobalAlert';
import StyledButton from '../StyledButton';
import styles from './styles/index';
import { displayName } from '../../../../app.json';

/**
 * PureComponent that renders receive options
 */
class ReceiveRequest extends PureComponent {
	static propTypes = {
		/**
		 * The navigator object
		 */
		navigation: PropTypes.object,
		/**
		 * Selected address as string
		 */
		selectedAddress: PropTypes.string,
		/**
		 * Asset to receive, could be not defined
		 */
		receiveAsset: PropTypes.object,
		/**
		 * Action that toggles the receive modal
		 */
		toggleReceiveModal: PropTypes.func,
		/**
		/* Triggers global alert
		*/
		showAlert: PropTypes.func,
		/**
		 * Network id
		 */
		network: PropTypes.string,
		/**
		 * Prompts protect wallet modal
		 */
		protectWalletModalVisible: PropTypes.func,
		/**
		 * Hides the modal that contains the component
		 */
		hideModal: PropTypes.func,
		/**
		 * redux flag that indicates if the user
		 * completed the seed phrase backup flow
		 */
		seedphraseBackedUp: PropTypes.bool
	};

	state = {
		qrModalVisible: false,
		buyModalVisible: false
	};

	/**
	 * Share current account public address
	 */
	onShare = () => {
		const { selectedAddress } = this.props;
		Share.open({
			message: generateUniversalLinkAddress(selectedAddress)
		})
			.then(() => {
				this.props.hideModal();
				setTimeout(() => this.props.protectWalletModalVisible(), 1000);
			})
			.catch(err => {
				Logger.log('Error while trying to share address', err);
			});
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEvent(ANALYTICS_EVENT_OPTS.RECEIVE_OPTIONS_SHARE_ADDRESS);
		});
	};

	/**
	 * Shows an alert message with a coming soon message
	 */
	onBuy = async () => {
		const { navigation, toggleReceiveModal, network } = this.props;
		if (!allowedToBuy(network)) {
			Alert.alert(strings('fiat_on_ramp.network_not_supported'), strings('fiat_on_ramp.switch_network'));
		} else {
			toggleReceiveModal();
			navigation.navigate('PurchaseMethods');
			InteractionManager.runAfterInteractions(() => {
				Analytics.trackEvent(ANALYTICS_EVENT_OPTS.WALLET_BUY_ETH);
			});
		}
	};

	copyAccountToClipboard = async () => {
		const { selectedAddress } = this.props;
		Clipboard.setString(selectedAddress);
		this.props.showAlert({
			isVisible: true,
			autodismiss: 1500,
			content: 'clipboard-alert',
			data: { msg: strings('account_details.account_copied_to_clipboard') }
		});
		if (!this.props.seedphraseBackedUp) {
			setTimeout(() => this.props.hideModal(), 1000);
			setTimeout(() => this.props.protectWalletModalVisible(), 1500);
		}
	};

	/**
	 * Closes QR code modal
	 */
	closeQrModal = toggleModal => {
		this.props.hideModal();
		toggleModal();
	};

	/**
	 * Opens QR code modal
	 */
	openQrModal = () => {
		this.setState({ qrModalVisible: true });
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEvent(ANALYTICS_EVENT_OPTS.RECEIVE_OPTIONS_QR_CODE);
		});
	};

	onReceive = () => {
		this.props.toggleReceiveModal();
		this.props.navigation.navigate('PaymentRequestView', { receiveAsset: this.props.receiveAsset });
		InteractionManager.runAfterInteractions(() => {
			Analytics.trackEvent(ANALYTICS_EVENT_OPTS.RECEIVE_OPTIONS_PAYMENT_REQUEST);
		});
	};

	render() {
		return (
			<SafeAreaView style={styles.wrapper}>
				<ModalDragger />
				<View style={styles.titleWrapper}>
					<Text style={styles.title} testID={'receive-request-screen'}>
						{strings('receive_request.title')}
					</Text>
				</View>
				<View style={styles.body}>
					<ModalHandler>
						{({ isVisible, toggleModal }) => (
							<>
								<TouchableOpacity
									style={styles.qrWrapper}
									// eslint-disable-next-line react/jsx-no-bind
									onPress={() => {
										toggleModal();
										InteractionManager.runAfterInteractions(() => {
											Analytics.trackEvent(ANALYTICS_EVENT_OPTS.RECEIVE_OPTIONS_QR_CODE);
										});
									}}
								>
									<QRCode
										value={`ethereum:${this.props.selectedAddress}`}
										size={Dimensions.get('window').width / 2}
									/>
								</TouchableOpacity>
								<Modal
									isVisible={isVisible}
									onBackdropPress={toggleModal}
									onBackButtonPress={toggleModal}
									onSwipeComplete={toggleModal}
									swipeDirection={'down'}
									propagateSwipe
									testID={'qr-modal'}
								>
									<AddressQRCode closeQrModal={() => this.closeQrModal(toggleModal)} />
								</Modal>
							</>
						)}
					</ModalHandler>

					<Text style={{ color: colors.white }}>{strings('receive_request.scan_address')}</Text>

					<TouchableOpacity
						style={styles.addressWrapper}
						onPress={this.copyAccountToClipboard}
						testID={'account-address'}
					>
						<Text>
							<EthereumAddress address={this.props.selectedAddress} type={'short'} />
						</Text>
						<Text style={styles.copyButton} small>
							{strings('receive_request.copy')}
						</Text>
						<TouchableOpacity onPress={this.onShare}>
							<EvilIcons
								name={Device.isIos() ? 'share-apple' : 'share-google'}
								size={25}
								color={colors.grey600}
							/>
						</TouchableOpacity>
					</TouchableOpacity>
					<View style={styles.actionRow}>
						{allowedToBuy(this.props.network) && (
							<StyledButton type={'normal'} containerStyle={styles.actionButton} onPress={this.onBuy}>
								{strings('fiat_on_ramp.buy_eth', { appName: displayName })}
							</StyledButton>
						)}
						<StyledButton
							type={'white'}
							onPress={this.onReceive}
							containerStyle={styles.actionButton}
							testID={'request-payment-button'}
						>
							{strings('receive_request.request_payment')}
						</StyledButton>
					</View>
				</View>

				<GlobalAlert />
			</SafeAreaView>
		);
	}
}

const mapStateToProps = state => ({
	network: state.engine.backgroundState.NetworkController.network,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	receiveAsset: state.modals.receiveAsset,
	seedphraseBackedUp: state.user.seedphraseBackedUp
});

const mapDispatchToProps = dispatch => ({
	toggleReceiveModal: () => dispatch(toggleReceiveModal()),
	showAlert: config => dispatch(showAlert(config)),
	protectWalletModalVisible: () => dispatch(protectWalletModalVisible())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ReceiveRequest);
