import React from 'react';
import ActionModal from '../../UI/ActionModal';
import Icon from 'react-native-vector-icons/FontAwesome';
import { View, Image, TouchableOpacity, Text, StyleSheet } from 'react-native';
import { strings } from '../../../../locales/i18n';
import CheckBox from '@react-native-community/checkbox';
import PropTypes from 'prop-types';
import { colors, fontStyles } from '../../../styles/common';
import styles from './styles/index';

const warning_skip_backup = require('../../../images/warning.png'); // eslint-disable-line

const SkipAccountSecurityModal = ({ modalVisible, onConfirm, onCancel, onPress, toggleSkipCheckbox, skipCheckbox }) => (
	<ActionModal
		confirmText={strings('account_backup_step_1.skip_button_confirm')}
		cancelText={strings('account_backup_step_1.skip_button_cancel')}
		confirmButtonMode={'warning'}
		cancelButtonMode={'neutral'}
		displayCancelButton
		modalVisible={modalVisible}
		actionContainerStyle={styles.modalNoBorder}
		onCancelPress={onCancel}
		confirmDisabled={!skipCheckbox}
		onConfirmPress={onConfirm}
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
			<Text style={styles.skipTitle}>{strings('account_backup_step_1.skip_title')}</Text>
			<View style={styles.skipModalActionButtons}>
				<CheckBox
					style={styles.skipModalCheckbox}
					value={skipCheckbox}
					onValueChange={toggleSkipCheckbox}
					boxType={'square'}
					tintColors={{ true: colors.blue }}
					testID={'skip-backup-check'}
				/>
				<Text onPress={toggleSkipCheckbox} style={styles.skipModalText} testID={'skip-backup-text'}>
					{strings('account_backup_step_1.skip_check')}
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

SkipAccountSecurityModal.propTypes = propTypes;
SkipAccountSecurityModal.defaultProps = defaultProps;

export default SkipAccountSecurityModal;
