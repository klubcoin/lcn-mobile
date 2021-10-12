import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet, View, Text } from 'react-native';
import { colors, fontStyles } from '../../../../../styles/common';
import Device from '../../../../../util/Device';
import Modal from 'react-native-modal';
import SignatureRequest from '../../../../UI/SignatureRequest';
import ExpandedMessage from '../../../../UI/SignatureRequest/ExpandedMessage';

const styles = StyleSheet.create({
	bottomModal: {
		justifyContent: 'flex-end',
		margin: 0
	},
	messageText: {
		color: colors.black,
		...fontStyles.normal,
		fontFamily: Device.isIos() ? 'Courier' : 'Roboto'
	},
	message: {
		marginLeft: 10
	},
	truncatedMessageWrapper: {
		marginBottom: 4,
		overflow: 'hidden'
	},
	iosHeight: {
		height: 70
	},
	androidHeight: {
		height: 97
	},
	msgKey: {
		fontWeight: 'bold'
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
		truncateMessage: false,
		showExpandedMessage: false
	};

	onCancel = () => {
		this.props.hideModal();
	};

	onConfirm = () => {
		this.props.onConfirm();
		this.props.hideModal();
	};

	shouldTruncateMessage = e => {
		if (
			(Device.isIos() && e.nativeEvent.layout.height > 70) ||
			(Device.isAndroid() && e.nativeEvent.layout.height > 100)
		) {
			this.setState({ truncateMessage: true });
			return;
		}
		this.setState({ truncateMessage: false });
	};

	renderTypedMessageV3 = obj =>
		Object.keys(obj).map(key => (
			<View style={styles.message} key={key}>
				{obj[key] && typeof obj[key] === 'object' ? (
					<View>
						<Text style={[styles.messageText, styles.msgKey]}>{key}:</Text>
						<View>{this.renderTypedMessageV3(obj[key])}</View>
					</View>
				) : (
					<Text style={styles.messageText}>
						<Text style={styles.msgKey}>{key}:</Text> {`${obj[key]}`}
					</Text>
				)}
			</View>
		));

	renderTypedMessage = () => {
		const { data } = this.props;
		if (!data) return;
		return this.renderTypedMessageV3(JSON.parse(data.data));
	};

	toggleExpandedMessage = () => {
		this.setState({ showExpandedMessage: !this.state.showExpandedMessage });
	};

	render() {
		const { visible, networkInfo, message, hideModal, confirmLabel, cancelLabel } = this.props;
		const { truncateMessage, showExpandedMessage } = this.state;
		const messageWrapperStyles = [];

		if (truncateMessage) {
			messageWrapperStyles.push(styles.truncatedMessageWrapper);
			if (Device.isIos()) {
				messageWrapperStyles.push(styles.iosHeight);
			} else {
				messageWrapperStyles.push(styles.androidHeight);
			}
		}

		const rootView = showExpandedMessage ? (
			<ExpandedMessage
				currentPageInformation={networkInfo}
				renderMessage={this.renderTypedMessage}
				toggleExpandedMessage={this.toggleExpandedMessage}
			/>
		) : (
			<SignatureRequest
				navigation={this.props.navigation}
				message={message}
				confirmLabel={confirmLabel}
				cancelLabel={cancelLabel}
				onCancel={this.onCancel}
				onConfirm={this.onConfirm}
				toggleExpandedMessage={this.toggleExpandedMessage}
				currentPageInformation={networkInfo}
				truncateMessage={truncateMessage}
				type="typedSign"
			>
				<View style={messageWrapperStyles} onLayout={truncateMessage ? null : this.shouldTruncateMessage}>
					{this.renderTypedMessage()}
				</View>
			</SignatureRequest>
		);

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
				onBackButtonPress={showExpandedMessage ? this.toggleExpandedMessage : hideModal}
				onSwipeComplete={hideModal}
				swipeDirection={'down'}
				propagateSwipe
			>
				{rootView}
			</Modal>
		);
	}
}
