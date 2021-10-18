import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, Alert } from 'react-native';
import { makeObservable, observable } from 'mobx';
import { inject, observer } from 'mobx-react';
import { colors, fontStyles } from '../../../styles/common';
import routes from '../../../common/routes';
import Device from '../../../util/Device';
import Modal from 'react-native-modal';
import TransactionHeader from '../../UI/TransactionHeader';
import StyledButton from '../../UI/StyledButton';
import { strings } from '../../../../locales/i18n';
import { FlatList } from 'react-native-gesture-handler';
import RemoteImage from '../../Base/RemoteImage';
import ConfirmInputModal from '../../UI/ConfirmInputModal';
import ConfirmModal from '../../UI/ConfirmModal';
import { refWebRTC } from '../../../services/WebRTC';
import Engine from '../../../core/Engine';
import FileTransferWebRTC from '../../../services/FileTransferWebRTC';
import { ConfirmProfileBlock, ConfirmProfileRejected } from '../../../services/Messages';
import CryptoSignature from '../../../core/CryptoSignature';
import API from '../../../services/api';
import preferences from '../../../store/preferences';
import Toast from 'react-native-toast-message';
import * as sha3JS from 'js-sha3';
import TransactionTypes from '../../../core/TransactionTypes';
import { WalletDevice } from '@metamask/controllers';
import { BNToHex } from '@metamask/controllers/dist/util';

const styles = StyleSheet.create({
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0
	},
	root: {
		backgroundColor: colors.white,
		paddingTop: 24,
		minHeight: '90%',
		borderTopLeftRadius: 20,
		borderTopRightRadius: 20,
		paddingBottom: Device.isIphoneX() ? 20 : 0
	},
	heading: {
		alignItems: 'center',
		marginVertical: 24
	},
	message: {
		...fontStyles.bold,
		fontSize: 20,
		textAlign: 'center'
	},
	profile: {
		alignItems: 'center'
	},
	avatarView: {
		borderRadius: 60,
		borderWidth: 2,
		padding: 2,
		borderColor: colors.blue
	},
	avatar: {
		width: 60,
		height: 60,
		borderRadius: 30,
		overflow: 'hidden',
		alignSelf: 'center'
	},
	name: {
		marginTop: 10,
		fontSize: 20,
		fontWeight: '600',
		color: colors.black,
		textAlign: 'center'
	},
	email: {
		fontSize: 16,
		fontWeight: '600',
		textAlign: 'center'
	},
	optionList: {
		marginTop: 30
	},
	option: {
		marginBottom: 20,
		paddingHorizontal: 30
	},
	desc: {
		...fontStyles.normal,
		textAlign: 'center'
	}
});

const networkInfo = {
	url: routes.mainNetWork.accountUrl,
	icon: 'logo.png'
};

const options = () => [
	strings('confirm_profile.confirm_desc'),
	strings('confirm_profile.refuse_try_again'),
	strings('confirm_profile.refuse_not_willing'),
	strings('confirm_profile.report_invalid_profile')
];

/**
 * Component that renders friend message overview
 */
export class ConfirmIdentity extends PureComponent {
	static propTypes = {
		/**
		 * flag to toggle modal's visibility
		 */
		visible: PropTypes.bool,
		/**
		 * message to show
		 */
		message: PropTypes.string,
		/**
		 * react-navigation object used for switching between screens
		 */
		navigation: PropTypes.object,
		/**
		 * Callback triggered when this message signature is rejected
		 */
		hideModal: PropTypes.func,
		/**
		 * Callback triggered when this message signature is approved
		 */
		onConfirm: PropTypes.func,
		/**
		 * User profile data
		 */
		data: PropTypes.object
	};

	selectedIndex = -1;
	showConfirmNotWilling = false;
	showReportForm = false;
	reportReason = '';

	constructor(props) {
		super(props);
		makeObservable(this, {
			selectedIndex: observable,
			showConfirmNotWilling: observable,
			showReportForm: observable,
			reportReason: observable
		});
		this.prefs = props.store;
	}

	showNotice(message, type) {
		Toast.show({
			type: type || 'info',
			text1: message,
			text2: strings('profile.notice'),
			visibilityTime: 1000
		});
	}

	onCancel = () => {
		this.props.hideModal();
	};

	prepareTransactionToSend = () => {
		const { selectedAddress } = Engine.state.PreferencesController;
		const { data } = this.props;
		const { from, firstname, lastname, avatar } = data;
		const hash = sha3JS.keccak_256(firstname + lastname + from + avatar);

		return {
			data: hash,
			from: selectedAddress,
			gas: BNToHex(0),
			gasPrice: BNToHex(0),
			to: data.from,
			value: BNToHex(0)
		};
	};

	onConfirm = async () => {
		const { TransactionController } = Engine.context;

		try {
			const transaction = this.prepareTransactionToSend();

			const { result, transactionMeta } = await TransactionController.addTransaction(
				transaction,
				TransactionTypes.MMM,
				WalletDevice.MM_MOBILE
			);
			await TransactionController.approveTransaction(transactionMeta.id);
			await new Promise(resolve => resolve(result));

			if (transactionMeta.error) {
				throw transactionMeta.error;
			}

			//TODO: resetTransaction();
			this.props.hideModal();
		} catch (error) {
			Alert.alert(strings('transactions.transaction_error'), error && error.message, [
				{ text: strings('navigation.ok') }
			]);
		}
	};

	refuseTryAgain = async () => {
		const webrtc = refWebRTC();
		const { data } = this.props;
		const { onboardProfile } = this.prefs;
		const { firstname, lastname } = onboardProfile;
		const { selectedAddress } = Engine.state.PreferencesController;

		const message = ConfirmProfileRejected(selectedAddress, firstname, lastname);
		FileTransferWebRTC.sendAsOne(message, selectedAddress, [data.from], webrtc);
	};

	handleOption = index => {
		switch (index) {
			case 0:
				this.onConfirm();
				break;
			case 1:
				this.refuseTryAgain();
				this.props.hideModal();
				break;
			case 2:
				this.showConfirmNotWilling = true;
				break;
			case 3:
				this.showReportForm = true;
				break;
		}
	};

	renderItem = ({ item, index }) => {
		return (
			<View style={styles.option}>
				<StyledButton onPress={() => this.handleOption(index)} type={'normal'}>
					<Text style={styles.desc}>{item}</Text>
				</StyledButton>
			</View>
		);
	};

	renderBody() {
		const { message, data } = this.props;
		const { avatar, firstname, lastname, email } = data || {};
		const name = `${firstname} ${lastname}`;

		return (
			<View style={styles.root}>
				<TransactionHeader currentPageInformation={networkInfo} />
				<View style={styles.heading}>
					<Text style={styles.message}>{message}</Text>
				</View>
				<View style={styles.profile}>
					<View style={styles.avatarView}>
						<RemoteImage style={styles.avatar} source={{ uri: `data:image/png;base64,${avatar}` }} />
					</View>
					<Text style={styles.name}>{name}</Text>
					<Text style={styles.email}>{email}</Text>
				</View>
				<FlatList
					data={options()}
					keyExtractor={item => `${item}`}
					renderItem={data => this.renderItem(data)}
					style={styles.optionList}
				/>
			</View>
		);
	}

	sendBlockMessage = () => {
		const webrtc = refWebRTC();
		const { data } = this.props;
		const { selectedAddress } = Engine.state.PreferencesController;

		preferences.blockIdentityReqPeer(data.from);
		const message = ConfirmProfileBlock(selectedAddress);
		FileTransferWebRTC.sendAsOne(message, selectedAddress, [data.from], webrtc);
	};

	sendReport = async reason => {
		this.sendBlockMessage();

		const { data } = this.props;
		const { selectedAddress } = Engine.state.PreferencesController;

		const params = [data.from, reason];
		const signature = await CryptoSignature.signMessage(selectedAddress, JSON.stringify(params));
		params.push(signature);

		API.postRequest(
			routes.walletReport,
			params,
			response => {
				if (response.error) {
					alert(`${response.error.message}`);
				} else {
					this.showNotice(strings('confirm_profile.sent_report'));
					this.props.hideModal();
				}
			},
			error => {
				alert(`${error.toString()}`);
			}
		);
	};

	renderReportForm() {
		return (
			<ConfirmInputModal
				visible={this.showReportForm}
				title={strings('confirm_profile.input_reason')}
				value={this.reportReason}
				multiline={true}
				confirmLabel={strings('confirm_profile.submit')}
				cancelLabel={strings('confirm_profile.cancel')}
				onConfirm={text => this.sendReport(text)}
				hideModal={() => (this.showReportForm = false)}
			/>
		);
	}

	confirmNotWilling = () => {
		this.props.hideModal();
		this.sendBlockMessage();
	};

	renderConfirmNotWilling = () => {
		return (
			<ConfirmModal
				visible={this.showConfirmNotWilling}
				title={strings('confirm_profile.notice')}
				message={strings('confirm_profile.refuse_no_more_prompt')}
				confirmLabel={strings('confirm_profile.confirm')}
				cancelLabel={strings('confirm_profile.cancel')}
				onConfirm={() => this.confirmNotWilling()}
				hideModal={() => (this.showConfirmNotWilling = false)}
			/>
		);
	};

	render() {
		const { visible, hideModal } = this.props;

		return (
			<Modal
				isVisible={!!visible}
				animationIn="slideInUp"
				animationOut="slideOutDown"
				style={styles.bottomModal}
				backdropOpacity={0.7}
				animationInTiming={600}
				animationOutTiming={600}
				onBackdropPress={hideModal}
				onBackButtonPress={hideModal}
				onSwipeComplete={hideModal}
				swipeDirection={'down'}
				propagateSwipe
			>
				{this.renderBody()}
				{this.renderConfirmNotWilling()}
				{this.renderReportForm()}
			</Modal>
		);
	}
}

export default inject('store')(observer(ConfirmIdentity));
