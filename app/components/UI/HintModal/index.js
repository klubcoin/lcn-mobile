import PropTypes from 'prop-types';
import { Text, View, StyleSheet, TouchableOpacity, TouchableWithoutFeedback } from 'react-native';
import React from 'react';
import ActionModal from '../../UI/ActionModal';
import Icon from 'react-native-vector-icons/Octicons';
import { strings } from '../../../../locales/i18n';
import { colors, fontStyles } from '../../../styles/common';
import TrackingTextInput from '../TrackingTextInput';

const styles = StyleSheet.create({
	hintWrapper: {
		alignSelf: 'center',
		borderRadius: 16,
		padding: 24
	},
	hintHeader: {
		flexDirection: 'row',
		justifyContent: 'space-between',
		alignItems: 'center',
		marginBottom: 16
	},
	recovery: {
		fontSize: 18,
		...fontStyles.bold,
		color: colors.white
	},
	leaveHint: {
		fontSize: 14,
		...fontStyles.regular,
		color: colors.white,
		marginBottom: 16
	},
	noSeedphrase: {
		fontSize: 14,
		...fontStyles.regular,
		color: colors.red,
		marginBottom: 16
	},
	hintInput: {
		borderRadius: 6,
		padding: 16,
		minHeight: 76,
		paddingTop: 16,
		color: colors.white,
		backgroundColor: colors.purple
	},
	viewContainerStyle: {
		backgroundColor: colors.primaryFox
	}
});

const HintModal = ({ onCancel, onConfirm, modalVisible, onRequestClose, value, onChangeText }) => (
	<ActionModal
		confirmText={strings('manual_backup_step_3.save')}
		confirmButtonMode={'normal'}
		cancelButtonMode={'warning'}
		onCancelPress={onCancel}
		onConfirmPress={onConfirm}
		modalVisible={modalVisible}
		onRequestClose={onRequestClose}
		viewContainerStyle={styles.viewContainerStyle}
	>
		<TouchableWithoutFeedback onPress={onRequestClose} accessible={false}>
			<View style={styles.hintWrapper}>
				<View style={styles.hintHeader}>
					<Text style={styles.recovery}>{strings('manual_backup_step_3.recovery_hint')}</Text>
					<TouchableOpacity onPress={onCancel}>
						<Icon name="x" size={16} color={colors.white} />
					</TouchableOpacity>
				</View>
				<Text style={styles.leaveHint}>{strings('manual_backup_step_3.leave_hint')}</Text>
				<Text style={styles.noSeedphrase}>{strings('manual_backup_step_3.no_seedphrase')}</Text>
				<TrackingTextInput
					style={styles.hintInput}
					value={value}
					placeholder={strings('manual_backup_step_3.example')}
					onChangeText={onChangeText}
					placeholderTextColor={colors.grey200}
					multiline
					textAlignVertical={'top'}
					maxLength={256}
				/>
			</View>
		</TouchableWithoutFeedback>
	</ActionModal>
);

const propTypes = {
	onCancel: PropTypes.func.isRequired,
	onConfirm: PropTypes.func.isRequired,
	modalVisible: PropTypes.bool.isRequired,
	onRequestClose: PropTypes.func.isRequired,
	value: PropTypes.string,
	onChangeText: PropTypes.func.isRequired
};
const defaultProps = {
	modalVisible: false
};

HintModal.propTypes = propTypes;
HintModal.defaultProps = defaultProps;

export default HintModal;
