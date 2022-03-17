import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, View, SafeAreaView, StyleSheet, BackHandler } from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-community/async-storage';
import StyledButton from '../../UI/StyledButton';
import OnboardingProgress from '../../UI/OnboardingProgress';
import { strings } from '../../../../locales/i18n';
import AndroidBackHandler from '../AndroidBackHandler';
import Device from '../../../util/Device';
import SeedphraseModal from '../../UI/SeedphraseModal';
import { getOnboardingWithoutBackNavbarOptions } from '../../UI/Navbar';
import Engine from '../../../core/Engine';
import { ONBOARDING_WIZARD, METRICS_OPT_IN, BACKUP, BACKUP_TYPE } from '../../../constants/storage';
import { CHOOSE_PASSWORD_STEPS } from '../../../constants/onboarding';
import SkipAccountSecurityModal from '../../UI/SkipAccountSecurityModal';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';

/**
 * View that's shown during the first step of
 * the backup seed phrase flow
 */
const AccountBackupStep1 = props => {
	const [showRemindLaterModal, setRemindLaterModal] = useState(false);
	const [showWhatIsSeedphraseModal, setWhatIsSeedphraseModal] = useState(false);
	const [skipCheckbox, setToggleSkipCheckbox] = useState(false);
	const [hasFunds, setHasFunds] = useState(false);

	useEffect(
		() => {
			// Check if user has funds
			if (Engine.hasFunds()) setHasFunds(true);

			// Disable back press
			const hardwareBackPress = () => true;

			// Add event listener
			BackHandler.addEventListener('hardwareBackPress', hardwareBackPress);

			// Remove event listener on cleanup
			return () => {
				BackHandler.removeEventListener('hardwareBackPress', hardwareBackPress);
			};
		},
		[] // Run only when component mounts
	);

	const goNext = () => {
		props.navigation.navigate('AccountBackupStep1B', { ...props.navigation.state.params });
	};

	const showRemindLater = () => {
		if (hasFunds) return;

		setRemindLaterModal(true);
	};

	const toggleSkipCheckbox = () => (skipCheckbox ? setToggleSkipCheckbox(false) : setToggleSkipCheckbox(true));

	const hideRemindLaterModal = () => {
		setToggleSkipCheckbox(false);
		setRemindLaterModal(false);
	};

	const secureNow = () => {
		hideRemindLaterModal();
		goNext();
	};

	const skip = async () => {
		const backupType = await AsyncStorage.getItem(BACKUP);
		if (backupType === BACKUP_TYPE.ALERT) {
			props.navigation.navigate('HomeNav');
			props.navigation.popToTop();
			props.navigation.goBack(null);
			return;
		}
		hideRemindLaterModal();
		// Get onboarding wizard state
		props.navigation.navigate('EmailVerifyOnboarding');
		return;
		const onboardingWizard = await AsyncStorage.getItem(ONBOARDING_WIZARD);
		// Check if user passed through metrics opt-in screen
		const metricsOptIn = await AsyncStorage.getItem(METRICS_OPT_IN);
		if (!metricsOptIn) {
			props.navigation.navigate('OptinMetrics');
		} else if (onboardingWizard) {
			props.navigation.navigate('HomeNav');
			props.navigation.popToTop();
			props.navigation.goBack(null);
		} else {
			props.navigation.navigate('HomeNav');
		}
	};

	const showWhatIsSeedphrase = () => setWhatIsSeedphraseModal(true);

	const hideWhatIsSeedphrase = () => setWhatIsSeedphraseModal(false);

	return (
		<OnboardingScreenWithBg screen="a">
			<SafeAreaView style={styles.mainWrapper}>
				<ScrollView
					contentContainerStyle={styles.scrollviewWrapper}
					style={styles.mainWrapper}
					testID={'account-backup-step-1-screen'}
				>
					<View style={styles.wrapper} testID={'protect-your-account-screen'}>
						<OnboardingProgress steps={CHOOSE_PASSWORD_STEPS} currentStep={2} />
						<View style={styles.content}>
							<Text style={styles.title}>{strings('account_backup_step_1.title')}</Text>
							{/* <SeedPhraseVideo /> */}
							<View style={styles.text}>
								<Text style={styles.label}>
									{strings('account_backup_step_1.info_text_1_1')}{' '}
									<Text style={styles.blue} onPress={showWhatIsSeedphrase}>
										{strings('account_backup_step_1.info_text_1_2')}
									</Text>{' '}
									{strings('account_backup_step_1.info_text_1_3')}{' '}
									<Text style={styles.bold}>{strings('account_backup_step_1.info_text_1_4')}</Text>
								</Text>
							</View>
						</View>
						<View style={styles.buttonWrapper}>
							{!hasFunds && (
								<View style={styles.ctaContainer}>
									<View style={styles.remindLaterContainer}>
										<TouchableOpacity
											style={styles.remindLaterButton}
											onPress={showRemindLater}
											hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
											testID={'remind-me-later-button'}
										>
											<Text style={styles.remindLaterText}>
												{strings('account_backup_step_1.remind_me_later')}
											</Text>
										</TouchableOpacity>
									</View>
									<Text style={styles.remindLaterSubText}>
										{strings('account_backup_step_1.remind_me_later_subtext')}
									</Text>
								</View>
							)}
							<View style={styles.ctaContainer}>
								<StyledButton
									containerStyle={styles.button}
									type={'normal-padding'}
									onPress={goNext}
									testID={'submit-button'}
								>
									{strings('account_backup_step_1.cta_text').toUpperCase()}
								</StyledButton>
								<Text style={styles.startSubText}>{strings('account_backup_step_1.cta_subText')}</Text>
							</View>
						</View>
					</View>
				</ScrollView>
				{Device.isAndroid() && <AndroidBackHandler customBackPress={showRemindLater} />}
				<SkipAccountSecurityModal
					modalVisible={showRemindLaterModal}
					onCancel={secureNow}
					onConfirm={skip}
					skipCheckbox={skipCheckbox}
					onPress={hideRemindLaterModal}
					toggleSkipCheckbox={toggleSkipCheckbox}
				/>
				<SeedphraseModal
					showWhatIsSeedphraseModal={showWhatIsSeedphraseModal}
					hideWhatIsSeedphrase={hideWhatIsSeedphrase}
				/>
			</SafeAreaView>
		</OnboardingScreenWithBg>
	);
};

AccountBackupStep1.propTypes = {
	/**
	/* navigation object required to push and pop other views
	*/
	navigation: PropTypes.object
};

AccountBackupStep1.navigationOptions = ({ navigation }) => ({
	...getOnboardingWithoutBackNavbarOptions(navigation),
	gesturesEnabled: false
});

export default AccountBackupStep1;
