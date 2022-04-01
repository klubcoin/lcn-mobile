import React, { PureComponent } from 'react';
import { ScrollView, Text, View, TouchableOpacity, BackHandler } from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import { getNavigationWithoutBackOptionsTitle } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import styles from './styles/index';
import OTPInput from './components/OTPInput';
import StyledButton from '../../UI/StyledButton';
import APIService from '../../../services/APIService';
import { showSuccess } from '../../../util/notify';
import preferences from '../../../store/preferences';

class VerifyOTP extends PureComponent {
	static navigationOptions = ({ navigation }) => {
		return getNavigationWithoutBackOptionsTitle(strings('verify_otp.title'), navigation);
	};
	partnerList = [];
	otpEmail = '';
	otpPhone = '';
	email = '';
	phone = '';
	timingResend = 0;
	interval = null;
	resendAble = true;
	incorrentOTP = false;
	tooManyVerifyAttempts = false;
	tooManySendOtp = false;
	callback = null;
	resendOTP = false;

	constructor(props) {
		super(props);
		makeObservable(this, {
			partnerList: observable,
			otpEmail: observable,
			otpPhone: observable,
			email: observable,
			phone: observable,
			timingResend: observable,
			interval: observable,
			resendAble: observable,
			incorrentOTP: observable,
			tooManyVerifyAttempts: observable,
			tooManySendOtp: observable,
			resendOTP: observable
		});
		const { params } = props.navigation.state;
		this.email = params?.email;
		this.phone = params?.phone;
		this.callback = params?.callback;
	}

	componentDidMount() {
		this.sendOTPEmail();
		BackHandler.addEventListener('hardwareBackPress', this.disableBackAction);
	}

	componentWillUnmount() {
		console.log('componentWillUnmount');
		BackHandler.removeEventListener('hardwareBackPress', this.disableBackAction);
	}

	disableBackAction() {
		return true;
	}

	sendOTPEmail() {
		APIService.sendEmailOTP(this.email, (success, response) => {
			switch (response) {
				case 'success':
					this.resendOTP = false;
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
				case 'already_verified':
					showSuccess(strings('verify_otp.email_already_verified'));
					preferences
						.getOnboardProfile()
						.then(value =>
							preferences.setOnboardProfile(
								Object.assign(value, {
									emailVerified: true
								})
							)
						)
						.catch(e => console.log('profile onboarding error', e));
					this.props.navigation.navigate('SecuritySettings');
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
					showSuccess(strings('verify_otp.verify_success'));
					preferences
						.getOnboardProfile()
						.then(value =>
							preferences.setOnboardProfile(
								Object.assign(value, {
									email: this.email,
									emailVerified: true
								})
							)
						)
						.catch(e => console.log('profile onboarding error', e));
					this.props.navigation.navigate('SecuritySettings');
					break;
				case 'invalid_code':
					this.incorrentOTP = true;
					break;
				case 'too_many_attempts':
					this.tooManyVerifyAttempts = true;
					break;
				case 'invalid_request':
					this.resendOTP = true;
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

	setOtpPhone(text) {
		this.otpPhone = text.replace(/\D/g, '');
	}

	renderEmailOtp() {
		return (
			<View style={styles.wrapper}>
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
					disable={this.tooManySendOtp || this.tooManyVerifyAttempts || this.resendOTP}
					onChange={text => {
						this.setOtpEmail(text);
						if (text.length === 6) {
							this.verifyOTPEmail();
						}
					}}
				/>
				{!this.tooManyVerifyAttempts &&
					(!this.tooManySendOtp ? (
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
					))}
				{this.incorrentOTP && <Text style={styles.errorText}>{strings('verify_otp.incorrect_otp')}</Text>}
				{this.tooManyVerifyAttempts && (
					<Text>
						<Text style={styles.errorTextBold}>{strings('verify_otp.exceeded_attempts')}</Text>
						<Text style={styles.errorText}>{strings('verify_otp.noti_4')}</Text>
					</Text>
				)}
				{this.resendOTP && <Text style={styles.errorText}>{strings('verify_otp.resend_otp')}</Text>}
			</View>
		);
	}
	renderPhoneOtp() {
		return (
			<View style={styles.wrapper}>
				<Text style={styles.title}>{`${strings('verify_otp.verify_otp')} ${
					this.phone.split('-')[0]
				}-${this.phone
					.split('-')[1]
					.split('')
					.fill('*', 2, 9)
					.join('')}`}</Text>
				<OTPInput value={this.otpPhone} onChange={text => this.setOtpPhone(text)} />
				<TouchableOpacity style={styles.resendButton} activeOpacity={0.7}>
					<Text style={styles.resendText}>{strings('verify_otp.resend_code').toUpperCase()}</Text>
				</TouchableOpacity>
			</View>
		);
	}

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
					{this.email && this.email !== '' && this.renderEmailOtp()}
					{this.phone && this.phone !== '' && this.renderPhoneOtp()}
					<View style={{ flex: 1, width: '100%', justifyContent: 'flex-end', padding: 12 }}>
						<StyledButton
							type={'normal'}
							containerStyle={styles.skipButton}
							onPress={() => {
								this.props.navigation.navigate('SecuritySettings');
							}}
						>
							{strings('verify_otp.proceed_to_settings')}
						</StyledButton>
					</View>
				</ScrollView>
			</OnboardingScreenWithBg>
		);
	}
}

export default inject('store')(observer(VerifyOTP));
