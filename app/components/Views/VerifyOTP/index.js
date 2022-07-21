import React, { PureComponent } from 'react';
import { Text, View, BackHandler, ActivityIndicator } from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable, runInAction } from 'mobx';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import { getNavigationWithoutBackOptionsTitle } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import styles from './styles/index';
import OTPInput from '../../UI/OTPInput';
import StyledButton from '../../UI/StyledButton';
import APIService from '../../../services/APIService';
import { showSuccess } from '../../../util/notify';
import preferences from '../../../store/preferences';
import AsyncStorage from '@react-native-community/async-storage';
import TrackingScrollView from '../../UI/TrackingScrollView';
import { colors } from '../../../styles/common';

class VerifyOTP extends PureComponent {
	static navigationOptions = ({ navigation }) => {
		return getNavigationWithoutBackOptionsTitle(strings('verify_otp.title'), navigation);
	};
	partnerList = [];
	otpEmail = '';
	email = '';
	timingResend = 0;
	interval = null;
	resendAble = true;
	incorrectOTP = false;
	tooManyVerifyAttempts = false;
	tooManySendOtp = false;
	callback = null;
	resendOTP = false;
	isSentEmail = false;
	sendingOTP = false;
	gettingEmailStatus = false;

	constructor(props) {
		super(props);
		makeObservable(this, {
			partnerList: observable,
			otpEmail: observable,
			email: observable,
			timingResend: observable,
			interval: observable,
			resendAble: observable,
			incorrectOTP: observable,
			tooManyVerifyAttempts: observable,
			tooManySendOtp: observable,
			resendOTP: observable,
			isSentEmail: observable,
			sendingOTP: observable,
			gettingEmailStatus: observable
		});
		const { params } = props.navigation.state;
		this.email = params?.email;
		this.callback = params?.callback;
	}

	async componentDidMount() {
		const sentEmail = await AsyncStorage.getItem(this.email);
		if (sentEmail) {
			runInAction(() => {
				const timeResent = Math.ceil(60 - (new Date().getTime() - +sentEmail) / 1000);
				this.timingResend = timeResent;
				if (timeResent > 0) {
					this.isSentEmail = true;
					this.timing();
				} else {
					this.verifyEmailBeforeSendOTP();
				}
			});
		} else {
			this.verifyEmailBeforeSendOTP();
		}
		BackHandler.addEventListener('hardwareBackPress', this.disableBackAction);
	}

	componentWillUnmount() {
		clearInterval(this.interval);
		BackHandler.removeEventListener('hardwareBackPress', this.disableBackAction);
	}

	disableBackAction() {
		return true;
	}

	async storeTimeSendEmail(time) {
		AsyncStorage.setItem(this.email, `${time}`);
	}

	sendOTPEmail() {
		if (this.sendEmailOTP) {
			return;
		}
		runInAction(() => {
			this.sendingOTP = true;
		});
		APIService.sendEmailOTP(this.email, (success, response) => {
			runInAction(() => {
				this.sendingOTP = false;
				switch (response) {
					case 'success':
						this.resendOTP = false;
						this.isSentEmail = false;
						break;
					case 'retry_later':
						break;
					case 'too_many_requests':
						this.tooManySendOtp = true;
						break;
					case 'too_many_attempts':
						this.tooManyVerifyAttempts = true;
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
				this.verifyEmail();
			});
		});
	}

	verifyEmail = () => {
		runInAction(() => {
			this.gettingEmailStatus = true;
		});
		APIService.getOtpStatus(this.email, (success, json) => {
			runInAction(() => {
				this.gettingEmailStatus = false;
				if (+json.attempts >= 5) {
					this.tooManyVerifyAttempts = true;
				} else if (!!json?.creationDate) {
					this.storeTimeSendEmail(json?.creationDate);
					this.timingResend = Math.ceil(60 - (new Date().getTime() - +json.creationDate) / 1000);
					this.timing();
				} else {
					this.timingResend = 0;
				}
			});
		});
	};

	verifyEmailBeforeSendOTP = () => {
		runInAction(() => {
			this.gettingEmailStatus = true;
		});
		APIService.getOtpStatus(this.email, (success, json) => {
			runInAction(() => {
				this.gettingEmailStatus = false;
				if (+json.attempts >= 5) {
					this.tooManyVerifyAttempts = true;
				} else if (!!json?.creationDate) {
					this.storeTimeSendEmail(json?.creationDate);
					this.timingResend = Math.ceil(60 - (new Date().getTime() - +json.creationDate) / 1000);
					this.timing();
					if (this.timingResend <= 0) {
						this.sendOTPEmail();
					}
				} else {
					this.timingResend = 0;
					this.sendOTPEmail();
				}
			});
		});
	};

	verifyOTPEmail() {
		APIService.verifyEmailOTP(this.email, this.otpEmail, (success, response) => {
			runInAction(() => {
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
						this.incorrectOTP = true;
						break;
					case 'too_many_attempts':
						this.tooManyVerifyAttempts = true;
						break;
					case 'invalid_request':
						this.resendOTP = true;
						break;
					default:
				}
				this.verifyEmail();
			});
		});
	}

	timing() {
		clearInterval(this.interval);
		this.interval = setInterval(() => {
			runInAction(() => {
				this.timingResend = this.timingResend - 1;
				if (this.timingResend <= 0) {
					clearInterval(this.interval);
				}
			});
		}, 1000);
	}

	setOtpEmail(text) {
		runInAction(() => {
			this.otpEmail = text.replace(/\D/g, '');
		});
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
					containerTestId={'verify-otp-container-otp-input'}
					textFieldTestId={'verify-otp-text-field-otp-input'}
				/>
				{!this.tooManyVerifyAttempts &&
					(!this.tooManySendOtp ? (
						this.sendingOTP ? (
							<View style={styles.loadingWrapper1}>
								<ActivityIndicator color={colors.white} size={'small'} />
							</View>
						) : (
							<Text style={styles.textWrapper}>
								{!this.isSentEmail && <Text>{strings('verify_otp.not_receive_code')}</Text>}
								{this.gettingEmailStatus ? (
									<View style={styles.loadingWrapper}>
										<ActivityIndicator color={colors.white} />
									</View>
								) : this.timingResend > 0 ? (
									<Text>{strings('verify_otp.resend_in', { second: this.timingResend })}</Text>
								) : (
									<Text style={styles.resendText} onPress={() => this.verifyEmailBeforeSendOTP()}>
										{strings('verify_otp.resend_now')}
									</Text>
								)}
							</Text>
						)
					) : (
						<Text style={styles.errorText}>{strings('verify_otp.exceeded_send_otp')}</Text>
					))}
				{this.incorrectOTP && <Text style={styles.errorText}>{strings('verify_otp.incorrect_otp')}</Text>}
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

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<TrackingScrollView contentContainerStyle={styles.flexGrow}>
					{this.email && this.email !== '' && this.renderEmailOtp()}
					<View style={styles.buttonWrapper}>
						<StyledButton
							type={'normal'}
							containerStyle={styles.skipButton}
							onPress={() => {
								this.props.navigation.navigate('SecuritySettings');
							}}
							testID={'verify-otp-proceed-to-settings'}
						>
							{strings('verify_otp.proceed_to_settings')}
						</StyledButton>
					</View>
				</TrackingScrollView>
			</OnboardingScreenWithBg>
		);
	}
}

export default inject('store')(observer(VerifyOTP));
