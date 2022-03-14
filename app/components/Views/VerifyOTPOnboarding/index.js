import React, { PureComponent } from 'react';
import { ScrollView, Text, View, SafeAreaView } from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import { getOnboardingNavbarOptions } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import styles from './styles/index';
import OTPInput from './components/OTPInput';
import StyledButton from '../../UI/StyledButton';
import APIService from '../../../services/APIService';
import OnboardingProgress from '../../UI/OnboardingProgress';
import { CHOOSE_PASSWORD_STEPS } from '../../../constants/onboarding';
import Emoji from 'react-native-emoji';
import Confetti from '../../UI/Confetti';
import AsyncStorage from '@react-native-community/async-storage';
import { ONBOARDING_WIZARD, METRICS_OPT_IN, SEED_PHRASE_HINTS } from '../../../constants/storage';
import preferences from '../../../../app/store/preferences';
import AppConstants from '../../../core/AppConstants';
import { displayName } from '../../../../app.json';

class VerifyOTPOnboarding extends PureComponent {
	static navigationOptions = ({ navigation }) => {
		return getOnboardingNavbarOptions(navigation);
	};
	partnerList = [];
	otpEmail = '';
	email = '';
	timingResend = 0;
	interval = null;
	resendAble = true;
	incorrentOTP = false;
	tooManyVerifyAttempts = false;
	tooManySendOtp = false;
	verifySuccess = false;

	constructor(props) {
		super(props);
		makeObservable(this, {
			partnerList: observable,
			otpEmail: observable,
			email: observable,
			timingResend: observable,
			interval: observable,
			resendAble: observable,
			incorrentOTP: observable,
			tooManyVerifyAttempts: observable,
			tooManySendOtp: observable,
			verifySuccess: observable
		});
		this.email = preferences?.onboardProfile.email;
	}

	componentDidMount() {
		this.timingResend = 60;
		this.timing();
	}

	sendOTPEmail() {
		APIService.sendEmailOTP(this.email, (success, response) => {
			switch (response) {
				case 'success':
					this.timingResend = 60;
					this.timing();
					break;
				case 'retry_later':
					this.timingResend = 60;
					this.timing();
					break;
				case 'too_many_requests':
					this.tooManySendOtp = true;
					break;
				default:
					this.timingResend = 60;
					this.timing();
			}
		});
	}

	verifyOTPEmail() {
		APIService.verifyEmailOTP(this.email, this.otpEmail, (success, response) => {
			this.otpEmail = '';
			switch (response) {
				case 'success':
					// showSuccess(strings('verify_otp.verify_success'));
					// preferences
					// 	.getOnboardProfile()
					// 	.then(value =>
					// 		preferences.setOnboardProfile(
					// 			Object.assign(value, {
					// 				emailVerified: true
					// 			})
					// 		)
					// 	)
					// 	.catch(e => console.log('profile onboarding error', e));
					// this.props.navigation.goBack();
					this.verifySuccess = true;
					break;
				case 'invalid_code':
					this.incorrentOTP = true;
					break;
				case 'too_many_attempts':
					this.tooManyVerifyAttempts = true;
					break;
				case 'invalid_request':
					this.incorrentOTP = true;
					break;
				default:
			}
		});
	}

	timing() {
		this.interval = setInterval(() => {
			this.timingResend = this.timingResend - 1;
			if (this.timingResend <= 0) {
				clearInterval(this.interval);
			}
		}, 1000);
	}

	setOtpEmail(text) {
		this.otpEmail = text.replace(/\D/g, '');
	}

	onLearnMore() {
		this.props.navigation.push('Webview', {
			url: AppConstants.URLS.LEARN_MORE,
			title: strings('drawer.metamask_support', { appName: displayName })
		});
	}

	renderEmailOtp() {
		return (
			<>
				<View style={styles.emailWrapper}>
					<Text style={styles.title}>{`${strings('verify_otp.verify_otp')} ${[
						this.email
							.split('@')[0]
							.split('')
							.fill('*', 2)
							.join('')
					]}@${this.email
						.split('@')[1]
						.split('')
						.fill('*', 1)
						.join('')}`}</Text>
					<OTPInput
						value={this.otpEmail}
						disable={this.tooManySendOtp || this.tooManyVerifyAttempts}
						onChange={text => this.setOtpEmail(text)}
					/>
					{!this.tooManySendOtp ? (
						<Text style={styles.textWrapper}>
							<Text>{strings('verify_otp.not_receive_code')}</Text>
							{this.timingResend > 0 ? (
								<Text>{strings('verify_otp.resend_in', { second: this.timingResend })}</Text>
							) : (
								<Text style={styles.resendText} onPress={() => this.sendOTPEmail()}>
									{strings('verify_otp.resend_now')}
								</Text>
							)}
						</Text>
					) : (
						<Text style={styles.errorText}>{strings('verify_otp.exceeded_send_otp')}</Text>
					)}
					{this.incorrentOTP && <Text style={styles.errorText}>{strings('verify_otp.incorrect_otp')}</Text>}
					{this.tooManyVerifyAttempts && (
						<Text style={styles.errorText}>{strings('verify_otp.exceeded_attempts')}</Text>
					)}
				</View>
				<View style={{ flex: 1, width: '100%', justifyContent: 'flex-end', padding: 12 }}>
					<StyledButton
						type={'normal'}
						disabled={
							(this.email && this.email !== '' && this.otpEmail.length < 6) ||
							this.tooManySendOtp ||
							this.tooManyVerifyAttempts
						}
						onPress={() => this.verifyOTPEmail()}
					>
						{strings('verify_otp.verify')}
					</StyledButton>
				</View>
			</>
		);
	}

	async onDone() {
		// this.props.navigation.navigate('HomeNav');
		// this.props.navigation.popToTop();
		// this.props.navigation.goBack(null);
		const onboardingWizard = await AsyncStorage.getItem(ONBOARDING_WIZARD);
		// Check if user passed through metrics opt-in screen
		const metricsOptIn = await AsyncStorage.getItem(METRICS_OPT_IN);
		if (!metricsOptIn) {
			this.props.navigation.navigate('OptinMetrics');
		} else if (onboardingWizard) {
			this.props.navigation.navigate('HomeNav');
			this.props.navigation.popToTop();
			this.props.navigation.goBack(null);
		} else {
			this.props.navigation.navigate('HomeNav');
			this.props.navigation.popToTop();
			this.props.navigation.goBack(null);
		}
	}

	renderCongratulations() {
		return (
			<>
				<Confetti />
				<Emoji name="tada" style={styles.emoji} />
				<Text style={styles.congratulations}>{strings('verify_otp.congratulations')}</Text>
				<Text style={styles.congratulationsText}>{strings('verify_otp.text1')}</Text>
				<Text style={styles.congratulationsText}>{strings('verify_otp.text2')}</Text>
				<Text style={styles.learnMore} onPress={() => this.onLearnMore()}>
					{strings('verify_otp.learn_more')}
				</Text>
				<View style={styles.footer}>
					<StyledButton type={'normal'} onPress={() => this.onDone()}>
						{strings('verify_otp.done')}
					</StyledButton>
				</View>
			</>
		);
	}
	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<SafeAreaView style={styles.mainWrapper}>
					<View style={styles.wrapper}>
						<OnboardingProgress steps={CHOOSE_PASSWORD_STEPS} currentStep={5} />
						<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
							{!this.verifySuccess && this.renderEmailOtp()}
							{this.verifySuccess && this.renderCongratulations()}
						</ScrollView>
					</View>
				</SafeAreaView>
			</OnboardingScreenWithBg>
		);
	}
}

export default inject('store')(observer(VerifyOTPOnboarding));
