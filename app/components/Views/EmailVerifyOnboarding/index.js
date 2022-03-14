import React, { useState, useEffect } from 'react';
import { ScrollView, TouchableOpacity, Text, View, SafeAreaView, StyleSheet, BackHandler } from 'react-native';
import PropTypes from 'prop-types';
import AsyncStorage from '@react-native-community/async-storage';
import StyledButton from '../../UI/StyledButton';
import OnboardingProgress from '../../UI/OnboardingProgress';
import { strings } from '../../../../locales/i18n';
import AndroidBackHandler from '../AndroidBackHandler';
import Device from '../../../util/Device';
import { getOnboardingNavbarOptions } from '../../UI/Navbar';
import Engine from '../../../core/Engine';
import { ONBOARDING_WIZARD, METRICS_OPT_IN } from '../../../constants/storage';
import { CHOOSE_PASSWORD_STEPS } from '../../../constants/onboarding';
import SkipVerifyEmailModal from '../../UI/SkipVerifyEmailModal';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';

const EmailVerifyOnboarding = props => {
	const [showRemindLaterModal, setRemindLaterModal] = useState(false);
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
		props.navigation.navigate('VerifyOTPOnboarding');
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
		hideRemindLaterModal();
		// Get onboarding wizard state\
		// props.navigation.navigate('HomeNav');
		// props.navigation.popToTop();
		// props.navigation.goBack(null);
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
	return (
		<OnboardingScreenWithBg screen="a">
			<SafeAreaView style={styles.mainWrapper}>
				<OnboardingProgress steps={CHOOSE_PASSWORD_STEPS} currentStep={4} />
				<ScrollView
					contentContainerStyle={styles.scrollviewWrapper}
					style={styles.mainWrapper}
					testID={'account-backup-step-1-screen'}
				>
					<View style={styles.wrapper} testID={'protect-your-account-screen'}>
						<View style={styles.content}>
							<Text style={styles.title}>{strings('email_verify_onboarding.title')}</Text>
							<View style={styles.text}>
								<Text style={styles.label}>
									{strings('email_verify_onboarding.info_text_1_1')}{' '}
									<Text style={styles.blue}>{strings('email_verify_onboarding.info_text_1_2')}</Text>{' '}
									{strings('email_verify_onboarding.info_text_1_3')}{' '}
									<Text style={styles.bold}>{strings('email_verify_onboarding.info_text_1_4')}</Text>
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
												{strings('email_verify_onboarding.remind_me_later')}
											</Text>
										</TouchableOpacity>
									</View>
									<Text style={styles.remindLaterSubText}>
										{strings('email_verify_onboarding.remind_me_later_subtext')}
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
									{strings('email_verify_onboarding.cta_text').toUpperCase()}
								</StyledButton>
								<Text style={styles.startSubText}>
									{strings('email_verify_onboarding.cta_subText')}
								</Text>
							</View>
						</View>
					</View>
				</ScrollView>
				{Device.isAndroid() && <AndroidBackHandler customBackPress={showRemindLater} />}
				<SkipVerifyEmailModal
					modalVisible={showRemindLaterModal}
					onCancel={secureNow}
					onConfirm={skip}
					skipCheckbox={skipCheckbox}
					onPress={hideRemindLaterModal}
					toggleSkipCheckbox={toggleSkipCheckbox}
				/>
			</SafeAreaView>
		</OnboardingScreenWithBg>
	);
};

EmailVerifyOnboarding.propTypes = {
	/**
	/* navigation object required to push and pop other views
	*/
	navigation: PropTypes.object
};

EmailVerifyOnboarding.navigationOptions = ({ navigation }) => ({
	...getOnboardingNavbarOptions(navigation, { headerLeft: <View /> }),
	gesturesEnabled: false
});

export default EmailVerifyOnboarding;