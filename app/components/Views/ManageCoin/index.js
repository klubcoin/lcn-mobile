import React, { PureComponent } from 'react';
import { Text, View, Image, Modal } from 'react-native';
import StyledButton from '../../UI/StyledButton';
import { baseStyles } from '../../../styles/common';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import { strings } from '../../../../locales/i18n';
import TermsAndConditions from '../TermsAndConditions';
import { getTransparentBackOnboardingNavbarOptions } from '../../UI/Navbar';
import styles from './styles';
import QRScanner from '../../UI/QRScanner';
import SharedDeeplinkManager from '../../../core/DeeplinkManager';
import AppConstants from '../../../core/AppConstants';
import { showError } from '../../../util/notify';
import TrackingScrollView from '../../UI/TrackingScrollView';
import { connect } from 'react-redux';
import { newAssetTransaction } from '../../../actions/transaction';
import { getEther } from '../../../util/transactions';

class ManageCoin extends PureComponent {
	state = {
		isScanQrPay: false,
		isScanQrTip: false
	};

	static navigationOptions = ({ navigation }) =>
		getTransparentBackOnboardingNavbarOptions(navigation, strings('drawer.manage_coins'));

	onScanQRToCollect = () => {
		this.props.navigation.navigate('ComingSoon');
	};

	onScanQRToPay = () => {
		this.setState({ isScanQrPay: true });
	};

	onScanQRToTip = () => {
		this.setState({ isScanQrTip: true });
	};

	onSendToFriend = () => {
		const { newAssetTransaction, navigation, ticker } = this.props;
		newAssetTransaction(getEther(ticker));
		navigation.navigate('SendFlowView');
	};

	onScanQRPayRead = response => {
		this.setState({ isScanQrPay: false });
		const paymentId = response.data.split('/')[response.data.split('/').length - 1];
		if (!response || !response.data || paymentId.slice(0, 4) !== 'ord_') {
			showError(strings('manage_coin.scan_qr_pay_error_title'));
			return;
		}
		this.props.navigation.navigate('PurchaseOrderDetails', { orderId: paymentId });
	};

	onScanQRTipRead = response => {
		this.setState({ isScanQrTip: false });
		const content = response.data;
		if (
			content &&
			content.split('//') &&
			content.split('//')[1] &&
			content.split('//')[1].split('/') &&
			content.split('//')[1].split('/')[1] === 'tip'
		) {
			const handledByDeeplink = SharedDeeplinkManager.parse(content, {
				origin: AppConstants.DEEPLINKS.ORIGIN_QR_CODE,
				onHandled: () => this.props.navigation.pop(2)
			});

			if (handledByDeeplink) {
				this.mounted = false;
				return;
			}
		}
		showError(strings('manage_coin.scan_qr_tip_error_title'));
	};

	renderContent() {
		return (
			<View style={styles.ctas}>
				<Image
					source={require('../../../images/klubcoin_text.png')}
					style={styles.image}
					resizeMode={'contain'}
				/>
				<Text style={styles.title} testID={'onboarding-screen-title'}>
					{strings('drawer.manage_coins')}
				</Text>
				<View style={styles.createWrapper}>
					<View style={styles.buttonWrapper}>
						<StyledButton
							testID={'manage-coin-scan-qr-to-collect'}
							containerStyle={styles.button}
							type={'pink-padding'}
							onPress={this.onScanQRToCollect}
						>
							{strings('manage_coin.scan_qr_to_collect').toUpperCase()}
						</StyledButton>
					</View>
					<View style={styles.buttonWrapper}>
						<StyledButton
							testID={'manage-coin-scan-qr-to-pay'}
							type={'normal-padding'}
							onPress={this.onScanQRToPay}
							containerStyle={styles.button}
						>
							{strings('manage_coin.scan_qr_to_pay').toUpperCase()}
						</StyledButton>
					</View>
					<View style={styles.buttonWrapper}>
						<StyledButton
							testID={'manage-coin-scan-qr-to-tip'}
							containerStyle={styles.button}
							type={'normal-padding'}
							onPress={this.onScanQRToTip}
						>
							{strings('manage_coin.scan_qr_to_tip').toUpperCase()}
						</StyledButton>
					</View>
					<View style={styles.buttonWrapper}>
						<StyledButton
							testID={'manage-coin-send-to-friend'}
							containerStyle={styles.button}
							type={'white-padding'}
							onPress={this.onSendToFriend}
						>
							{strings('manage_coin.send_to_friend').toUpperCase()}
						</StyledButton>
					</View>
				</View>
			</View>
		);
	}

	render() {
		const { isScanQrPay, isScanQrTip } = this.state;
		return (
			<View style={baseStyles.flexGrow} testID={'onboarding-screen'}>
				<OnboardingScreenWithBg screen={'c'}>
					<TrackingScrollView style={baseStyles.flexGrow} contentContainerStyle={styles.scroll}>
						<View style={styles.wrapper}>{this.renderContent()}</View>
					</TrackingScrollView>
					<View style={styles.termsAndConditions}>
						<TermsAndConditions navigation={this.props.navigation} />
					</View>
					<Modal visible={isScanQrPay}>
						<QRScanner
							onBarCodeRead={this.onScanQRPayRead}
							onClose={() => {
								this.setState({ isScanQrPay: false });
							}}
						/>
					</Modal>
					<Modal visible={isScanQrTip}>
						<QRScanner
							onBarCodeRead={this.onScanQRTipRead}
							onClose={() => {
								this.setState({ isScanQrTip: false });
							}}
						/>
					</Modal>
				</OnboardingScreenWithBg>
			</View>
		);
	}
}
const mapStateToProps = state => ({
	ticker: state.engine.backgroundState.NetworkController.provider.ticker
});

const mapDispatchToProps = dispatch => ({
	newAssetTransaction: selectedAsset => dispatch(newAssetTransaction(selectedAsset))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ManageCoin);
