import React from 'react';
import { colors, fontStyles } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import { StyleSheet, View, SafeAreaView, TouchableOpacity } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ModalDragger from '../../Base/ModalDragger';
import Text from '../../Base/Text';
import StyledButton from '../../UI/StyledButton';
import Modal from 'react-native-modal';
import PropTypes from 'prop-types';
import Icon from 'react-native-vector-icons/FontAwesome';
import EvilIcons from 'react-native-vector-icons/EvilIcons';
import styles from './styles/index';
import TrackingTextInput from '../TrackingTextInput';

const CustomModalNonce = ({ proposedNonce, nonceValue, close, save }) => {
	const [nonce, onChangeText] = React.useState(nonceValue);

	const incrementDecrementNonce = decrement => {
		let newValue = nonce;
		newValue = decrement ? --newValue : ++newValue;
		onChangeText(newValue > 1 ? newValue : 1);
	};

	const saveAndClose = () => {
		save(nonce);
		close();
	};

	const displayWarning = String(proposedNonce) !== String(nonce);

	return (
		<Modal
			isVisible
			animationIn="slideInUp"
			animationOut="slideOutDown"
			style={styles.bottomModal}
			backdropOpacity={0.7}
			animationInTiming={600}
			animationOutTiming={600}
			onBackdropPress={close}
			onBackButtonPress={close}
			onSwipeComplete={close}
			swipeDirection={'down'}
			propagateSwipe
		>
			<KeyboardAwareScrollView contentContainerStyle={styles.keyboardAwareWrapper}>
				<SafeAreaView style={styles.modal}>
					<ModalDragger />
					<View style={styles.modalContainer}>
						<Text bold centered style={styles.title}>
							{strings('transaction.edit_transaction_nonce')}
						</Text>
						<View style={styles.nonceInputContainer}>
							<TrackingTextInput
								// disable keyboard for now
								showSoftInputOnFocus={false}
								keyboardType="numeric"
								// autoFocus
								autoCapitalize="none"
								autoCorrect={false}
								onChangeText={onChangeText}
								placeholder={String(proposedNonce)}
								placeholderTextColor={colors.grey100}
								spellCheck={false}
								editable
								style={styles.nonceInput}
								value={String(nonce)}
								numberOfLines={1}
								onSubmitEditing={saveAndClose}
							/>
						</View>
						<Text centered style={styles.currentSuggested}>
							{strings('transaction.current_suggested_nonce')}{' '}
							<Text bold style={{ color: colors.grey300 }}>
								{proposedNonce}
							</Text>
						</Text>
						<View style={styles.incrementDecrementNonceContainer}>
							<TouchableOpacity style={styles.incrementHit} onPress={() => incrementDecrementNonce(true)}>
								<EvilIcons name="minus" size={64} style={styles.incrementDecrementIcon} />
							</TouchableOpacity>
							<TouchableOpacity
								style={styles.incrementHit}
								onPress={() => incrementDecrementNonce(false)}
							>
								<EvilIcons name="plus" size={64} style={styles.incrementDecrementIcon} />
							</TouchableOpacity>
						</View>
						<View style={styles.descWarningContainer}>
							{displayWarning ? (
								<View style={styles.nonceWarning}>
									<Icon
										name="exclamation-circle"
										color={colors.yellow}
										size={16}
										style={styles.icon}
									/>
									<Text style={styles.nonceWarningText}>{strings('transaction.nonce_warning')}</Text>
								</View>
							) : null}
							<Text bold style={styles.desc}>
								{strings('transaction.this_is_an_advanced')}
							</Text>
							<Text style={styles.desc}>{strings('transaction.think_of_the_nonce')}</Text>
						</View>
					</View>
					<View style={styles.actionRow}>
						<StyledButton type={'normal'} containerStyle={styles.actionButton} onPress={close}>
							{strings('transaction.cancel')}
						</StyledButton>
						<StyledButton
							type={'blue'}
							onPress={() => saveAndClose(nonce)}
							containerStyle={styles.actionButton}
						>
							{strings('transaction.save')}
						</StyledButton>
					</View>
				</SafeAreaView>
			</KeyboardAwareScrollView>
		</Modal>
	);
};

CustomModalNonce.propTypes = {
	proposedNonce: PropTypes.number.isRequired,
	nonceValue: PropTypes.number.isRequired,
	save: PropTypes.func.isRequired,
	close: PropTypes.func.isRequired
};

export default CustomModalNonce;
