import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text, TouchableOpacity } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import Device from '../../../../../util/Device';
import Modal from 'react-native-modal';
import TransactionHeader from '../../../../UI/TransactionHeader';
import RemoteImage from '../../../../Base/RemoteImage';
import EthereumAddress from '../../../../UI/EthereumAddress';
import StyledButton from '../../../../UI/StyledButton';

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
		flex: 1,
		alignItems: 'center',
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
	buttons: {
		flexDirection: 'row',
		justifyContent: 'center',
		marginVertical: 20,
	},
	accept: {
		width: 160
	},
	reject: {
		marginLeft: 20,
		width: 160
	}
});

/**
 * Component that renders friend message overview
 */
export default class FriendMessageOverview extends PureComponent {
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
		 * Typed message to be displayed to the user
		 */
		data: PropTypes.object,
		/**
		 * Object containing current page title and url
		 */
		networkInfo: PropTypes.object
	};

	state = {
		toggleFullAddress: false,
	};

	onCancel = () => {
		this.props.hideModal();
	};

	onConfirm = () => {
		this.props.onConfirm();
		this.props.hideModal();
	};

	toggleAddress = () => {
		this.setState({ toggleFullAddress: !this.state.toggleFullAddress });
	}

	renderBody() {
		const { message, networkInfo } = this.props;

		return (
			<View style={styles.root}>
				<TransactionHeader currentPageInformation={networkInfo} />
				<View style={styles.heading}>
					<Text style={styles.message}>{message}</Text>
				</View>
				{this.renderProfile()}
				{this.renderActions()}
			</View >
		);
	}

	renderProfile() {
		const { data } = this.props;
		const { address, avatar, name, email } = data || {};

		const { toggleFullAddress } = this.state;
		const addressType = toggleFullAddress ? 'full' : 'short';

		return (
			<View style={styles.profile}>
				<View style={styles.avatarView}>
					<RemoteImage style={styles.avatar} source={{ uri: `data:image/png;base64,${avatar}` }} />
				</View>
				<Text style={styles.name}>{name}</Text>
				<TouchableOpacity activeOpacity={0.6} onPress={this.toggleAddress}>
					<EthereumAddress key={addressType} style={styles.address} address={address} type={addressType} />
				</TouchableOpacity>
				<Text style={styles.email}>{email}</Text>
			</View>
		)
	}

	renderActions() {
		const { confirmLabel, cancelLabel } = this.props;

		return (
			<View style={styles.buttons}>
				<StyledButton
					type={'confirm'}
					containerStyle={styles.accept}
					onPress={this.onConfirm.bind(this)}
				>
					{confirmLabel}
				</StyledButton>
				<StyledButton
					type={'normal'}
					containerStyle={styles.reject}
					onPress={this.onCancel.bind(this)}
				>
					{cancelLabel}
				</StyledButton>
			</View>
		)
	}

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
			</Modal>
		);
	}
}
