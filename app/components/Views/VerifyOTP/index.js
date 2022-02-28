import React, { PureComponent } from 'react';
import { ScrollView, Text, View, TouchableOpacity } from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import styles from './styles/index';
import OTPInput from './components/OTPInput';
import StyledButton from '../../UI/StyledButton';

class VerifyOTP extends PureComponent {
	static navigationOptions = ({ navigation }) => {
		return getNavigationOptionsTitle(strings('verify_otp.title'), navigation);
	};
	partnerList = [];
	otpEmail = '';
	otpPhone = '';
	email = '';
	phone = '';
	constructor(props) {
		super(props);
		makeObservable(this, {
			partnerList: observable,
			otpEmail: observable,
			otpPhone: observable,
			email: observable,
			phone: observable
		});
		const { params } = props.navigation.state;
		this.email = params?.email;
		this.phone = params?.phone;
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
				<OTPInput value={this.otpEmail} onChange={text => this.setOtpEmail(text)} />
				<TouchableOpacity style={styles.resendButton} activeOpacity={0.7}>
					<Text style={styles.resendText}>{strings('verify_otp.resend_code').toUpperCase()}</Text>
				</TouchableOpacity>
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

	onVerify() {
		this.props.navigation.goBack();
		this.props.navigation.state.params.onVerify && this.props.navigation.state.params.onVerify();
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
							disabled={
								(this.email && this.email !== '' && this.otpEmail.length < 6) ||
								(this.phone && this.phone !== '' && this.otpPhone.length < 6)
							}
							onPress={() => this.onVerify()}
						>
							{strings('verify_otp.verify_otp')}
						</StyledButton>
					</View>
				</ScrollView>
			</OnboardingScreenWithBg>
		);
	}
}

export default inject('store')(observer(VerifyOTP));
