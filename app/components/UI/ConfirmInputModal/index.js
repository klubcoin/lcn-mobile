import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { StyleSheet } from 'react-native';
import Modal from 'react-native-modal';
import ConfirmInput from '../ConfirmInput';

const styles = StyleSheet.create({
	wrapper: {
		justifyContent: 'flex-end',
		margin: 0
	},
});

/**
 * PureComponent that renders input with confirm action in a modal
 */
export default class ConfirmInputModal extends PureComponent {
	static propTypes = {
		visible: PropTypes.bool,
		title: PropTypes.string,
		message: PropTypes.string,
		value: PropTypes.string,
		confirmLabel: PropTypes.string,
		cancelLabel: PropTypes.string,
		onConfirm: PropTypes.func,
		hideModal: PropTypes.func,
	};

	onConfirm(value) {
		const { onConfirm, hideModal } = this.props;
		hideModal && hideModal();
		onConfirm && onConfirm(value);
	}

	onCancel() {
		const { hideModal } = this.props;
		hideModal && hideModal();
	}

	render() {
		const { visible, title, message, value, confirmLabel, cancelLabel } = this.props;
		return (
			<Modal
				isVisible={visible}
				onBackdropPress={this.onCancel.bind(this)}
				onBackButtonPress={this.onCancel.bind(this)}
				onSwipeComplete={this.onCancel.bind(this)}
				swipeDirection={'down'}
				propagateSwipe
				style={styles.wrapper}
			>
				<ConfirmInput
					title={title}
					message={message}
					value={value || ''}
					confirmLabel={confirmLabel}
					cancelLabel={cancelLabel}
					onConfirm={this.onConfirm.bind(this)}
					hideModal={this.onCancel.bind(this)}
				/>
			</Modal>
		);
	}
}
