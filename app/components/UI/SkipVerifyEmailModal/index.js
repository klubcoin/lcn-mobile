import React from 'react';
import ActionModal from '../../UI/ActionModal';
import Icon from 'react-native-vector-icons/FontAwesome';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import { strings } from '../../../../locales/i18n';
import PropTypes from 'prop-types';
import styles from './styles/index';

const warning_skip_backup = require('../../../images/warning.png'); // eslint-disable-line

const SkipVerifyEmailModal = ({ modalVisible, onConfirm, onCancel, onPress, toggleSkipCheckbox }) => (
	<ActionModal
		confirmText={strings('email_verify_onboarding.skip_button_confirm').toUpperCase()}
		cancelText={strings('email_verify_onboarding.skip_button_cancel').toUpperCase()}
		confirmButtonMode={'warning'}
		cancelButtonMode={'normal'}
		displayCancelButton
		modalVisible={modalVisible}
		actionContainerStyle={styles.modalNoBorder}
		onCancelPress={onCancel}
		onConfirmPress={onConfirm}
		verticalButtons
	>
		<View style={styles.skipModalContainer}>
			<TouchableOpacity
				onPress={onPress}
				style={styles.skipModalXButton}
				hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
			>
				<Icon name="times" style={styles.skipModalXIcon} />
			</TouchableOpacity>
			<Image
				source={warning_skip_backup}
				style={styles.imageWarning}
				resizeMethod={'auto'}
				testID={'skip_backup_warning'}
			/>
			<Text style={styles.skipTitle}>{strings('email_verify_onboarding.skip_title')}</Text>
			<View style={styles.skipModalActionButtons}>
				<Text onPress={toggleSkipCheckbox} style={styles.skipModalText} testID={'skip-backup-text'}>
					{strings('email_verify_onboarding.skip_check')}
				</Text>
			</View>
		</View>
	</ActionModal>
);

const propTypes = {
	modalVisible: PropTypes.bool.isRequired,
	onConfirm: PropTypes.func.isRequired,
	onCancel: PropTypes.func.isRequired,
	onPress: PropTypes.func.isRequired,
	toggleSkipCheckbox: PropTypes.func.isRequired,
	skipCheckbox: PropTypes.bool.isRequired
};

const defaultProps = {
	modalVisible: false,
	skipCheckbox: false
};

SkipVerifyEmailModal.propTypes = propTypes;
SkipVerifyEmailModal.defaultProps = defaultProps;

export default SkipVerifyEmailModal;
