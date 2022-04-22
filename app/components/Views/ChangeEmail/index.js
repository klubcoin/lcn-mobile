import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { KeyboardAvoidingView, ActivityIndicator, Text, View, SafeAreaView, Image } from 'react-native';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux';
import routes from '../../../common/routes';
import preferences from '../../../store/preferences';
import { passwordSet, passwordUnset, seedphraseNotBackedUp } from '../../../actions/user';
import { setLockTime } from '../../../actions/settings';
import StyledButton from '../../UI/StyledButton';
import LoginWithKeycloak from '../LoginWithKeycloak';
import Engine from '../../../core/Engine';
import Device from '../../../util/Device';
import { colors, baseStyles } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import SecureKeychain from '../../../core/SecureKeychain';
import Icon from 'react-native-vector-icons/FontAwesome';
import { ONBOARDING, PREVIOUS_SCREEN } from '../../../constants/navigation';
import { displayName } from '../../../../app.json';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';
import TextField from '../../UI/TextField';
import emojiRegex from 'emoji-regex';
import APIService from '../../../services/APIService';
import validator from 'validator';
import { SUCCESS } from '../ProfileOnboard';
import { renderAccountName } from '../../../util/address';
import Api from '../../../services/api';
import * as sha3JS from 'js-sha3';
import { showError } from '../../../util/notify';
import CryptoSignature from '../../../core/CryptoSignature';
import TrackingTextInput from '../../UI/TrackingTextInput';
import TrackingScrollView from '../../UI/TrackingScrollView';

const CHANGE_EMAIL = 'change_email';
const CONFIRM_PASSWORD = 'confirm_password';

/**
 * View where users can set their password for the first time
 */
class ChangeEmail extends PureComponent {
	static navigationOptions = ({ navigation }) =>
		getNavigationOptionsTitle(strings('change_email.change_email'), navigation);

	static propTypes = {
		/**
		 * The navigator object
		 */
		navigation: PropTypes.object,
		/**
		 * The action to update the password set flag
		 * in the redux store
		 */
		passwordSet: PropTypes.func,
		/**
		 * The action to update the lock time
		 * in the redux store
		 */
		setLockTime: PropTypes.func,
		/**
		 * A string representing the selected address => account
		 */
		selectedAddress: PropTypes.string
	};
	timeoutCheckUniqueEmail = null;
	regex = emojiRegex();
	state = {
		isSelected: false,
		password: '',
		biometryType: null,
		biometryChoice: false,
		rememberMe: false,
		loading: false,
		error: null,
		selectedAddress: this.props.selectedAddress
			? this.props.selectedAddress.slice(2, this.props.selectedAddress.length)
			: '',
		view: CHANGE_EMAIL,
		originalPassword: null,
		ready: true,
		email: '',
		emailFocused: false,
		isCheckingEmail: false,
		isValidEmail: false,
		isLoading: false,
		timeoutCheckUniqueEmail: null
	};

	mounted = true;

	async componentDidMount() {
		const biometryType = await SecureKeychain.getSupportedBiometryType();

		const state = { view: CONFIRM_PASSWORD };
		if (biometryType) {
			state.biometryType = Device.isAndroid() ? 'biometrics' : biometryType;
			state.biometryChoice = true;
		}

		this.setState(state);

		setTimeout(() => {
			this.setState({
				inputWidth: { width: '100%' }
			});
		}, 100);
	}

	componentDidUpdate(prevProps, prevState) {
		const prevLoading = prevState.loading;
		const { loading } = this.state;
		const { navigation } = this.props;
		if (!prevLoading && loading) {
			// update navigationOptions
			navigation.setParams({
				headerLeft: <View />
			});
		}
	}

	componentWillUnmount() {
		this.mounted = false;
	}

	onPressUpdate = async () => {
		this.setState({
			isLoading: true
		});
		const { identities } = Engine.state.PreferencesController;
		const { selectedAddress } = this.props;
		const username = renderAccountName(selectedAddress, identities);
		const lowerCaseSelectedAddress = selectedAddress.toLowerCase();
		const { firstname, lastname, phone } = preferences?.onboardProfile ?? {};
		const name = `${firstname} ${lastname}`;
		const publicInfo = JSON.stringify({ name });
		const privateInfo = JSON.stringify({ emailAddress: this.state.email, phoneNumber: phone });
		const hash = sha3JS.keccak_256(firstname + lastname + lowerCaseSelectedAddress + publicInfo);
		const signature = await CryptoSignature.signMessage(lowerCaseSelectedAddress, publicInfo);
		const params = [username, lowerCaseSelectedAddress, signature, publicInfo, privateInfo];
		Api.postRequest(
			routes.walletUpdate,
			params,
			response => {
				if (response.error) {
					showError(response.error.message);
				} else {
					this.props.navigation.navigate('VerifyOTP', {
						email: this.state.email,
						callback: () => this.props.navigation.goBack()
					});
				}
				this.setState({
					isLoading: false
				});
			},
			error => {
				this.setState({
					isLoading: false
				});
				alert(`${error.toString()}`);
			}
		);
	};

	tryExportSeedPhrase = async password => {
		// const { originalPassword } = this.state;
		const { KeyringController } = Engine.context;
		await KeyringController.exportSeedPhrase(password);
	};

	tryUnlockWithPassword = async password => {
		this.setState({ ready: false });
		try {
			// Just try
			await this.tryExportSeedPhrase(password);
			this.setState({
				password: null,
				originalPassword: password,
				ready: true,
				view: CHANGE_EMAIL
			});
		} catch (e) {
			const msg = strings('reveal_credential.warning_incorrect_password');
			this.setState({
				warningIncorrectPassword: msg,
				ready: true
			});
		}
	};

	tryUnlock = hash => {
		const { password } = this.state;
		this.tryUnlockWithPassword(hash || password);
	};

	onKeycloakResult = async error => {
		if (!error) {
			const hash = await preferences.getKeycloakHash();
			this.tryUnlock(hash);
		}
	};

	onPasswordChange = val => {
		this.setState({ password: val });
	};

	onEmailChange = val => {
		this.setState({ email: val.replace(this.regex, ''), emailFocused: false });
		if (!validator.isEmail(val.trim())) {
			this.setState({
				isCheckingEmail: false,
				isValidEmail: false
			});
			return;
		}
		this.setState({
			isCheckingEmail: true,
			isValidEmail: false
		});
		if (this.timeoutCheckUniqueEmail) {
			clearTimeout(this.timeoutCheckUniqueEmail);
		}
		this.timeoutCheckUniqueEmail = setTimeout(() => {
			APIService.checkUniqueFieldInWallet('email', val.trim(), this.state.selectedAddress, (success, json) => {
				if (this.state.email.trim() !== val.trim()) {
					this.setState({
						isCheckingEmail: false
					});
					return;
				}
				if (json === SUCCESS) {
					this.setState({
						isCheckingEmail: false,
						isValidEmail: true
					});
				} else {
					this.setState({
						isCheckingEmail: false,
						isValidEmail: false
					});
				}
			});
		}, 2000);
	};

	learnMore = () => {
		this.props.navigation.push('Webview', {
			url: routes.mainNetWork.helpSupportUrl,
			title: strings('drawer.metamask_support', { appName: displayName })
		});
	};

	renderLoader = () => (
		<View style={styles.loader}>
			<ActivityIndicator size="small" color={'white'} />
		</View>
	);

	renderConfirmPassword() {
		const { keycloakAuth } = this.props;
		const { warningIncorrectPassword } = this.state;
		return (
			<KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={'padding'}>
				<KeyboardAwareScrollView style={baseStyles.flexGrow} enableOnAndroid>
					<View style={styles.confirmPasswordWrapper}>
						<View style={[styles.content, styles.passwordRequiredContent]}>
							<Text style={styles.confirm_title}>{strings('manual_backup_step_1.confirm_password')}</Text>
							<View style={styles.text}>
								<Text style={styles.confirm_label}>
									{strings('manual_backup_step_1.before_continiuing')}
								</Text>
							</View>
							{keycloakAuth ? (
								<LoginWithKeycloak
									type={'sign'}
									label={strings('manual_backup_step_1.confirm_password')}
									onSuccess={this.onKeycloakResult}
									onError={this.onKeycloakResult}
								/>
							) : (
								<>
									<TrackingTextInput
										style={styles.confirm_input}
										placeholder={'Password'}
										placeholderTextColor={colors.grey100}
										onChangeText={this.onPasswordChange}
										onSubmitEditing={() => this.tryUnlock()}
										testID={'private-credential-password-text-input'}
										autoCapitalize="none"
										secureTextEntry
									/>
									{warningIncorrectPassword && (
										<Text style={styles.warningMessageText}>{warningIncorrectPassword}</Text>
									)}
									<View style={styles.buttonWrapper}>
										<StyledButton
											containerStyle={styles.button}
											type={'normal'}
											onPress={() => this.tryUnlock()}
											testID={'submit-button'}
										>
											{strings('manual_backup_step_1.confirm')}
										</StyledButton>
									</View>
								</>
							)}
						</View>
					</View>
				</KeyboardAwareScrollView>
			</KeyboardAvoidingView>
		);
	}

	renderChangeEmail() {
		const { email, error, loading, emailFocused, isCheckingEmail, isValidEmail, isLoading } = this.state;
		const previousScreen = this.props.navigation.getParam(PREVIOUS_SCREEN);
		let emailErrorText = '';
		if (!!email && validator.isEmail(email) && !isCheckingEmail && !isValidEmail) {
			emailErrorText = strings('profile.email_used');
		} else if (emailFocused && !email) {
			emailErrorText = strings('profile.email_required');
		} else if (emailFocused && !validator.isEmail(email)) {
			emailErrorText = strings('profile.invalid_email');
		}

		return (
			<SafeAreaView style={styles.mainWrapper}>
				{loading ? (
					<View style={styles.loadingWrapper}>
						<View style={styles.foxWrapper}>
							<Image
								source={require('../../../images/klubcoin_lighten.png')}
								style={styles.image}
								resizeMethod={'auto'}
							/>
						</View>
						<ActivityIndicator size="large" color={Device.isAndroid() ? colors.blue : colors.grey} />
						<Text style={styles.title}>
							{strings(
								previousScreen === ONBOARDING
									? 'create_wallet.title'
									: 'secure_your_wallet.creating_password'
							)}
						</Text>
						<Text style={styles.subtitle}>{strings('create_wallet.subtitle')}</Text>
					</View>
				) : (
					<View style={styles.wrapper} testID={'choose-password-screen'}>
						<KeyboardAwareScrollView
							style={styles.scrollableWrapper}
							contentContainerStyle={styles.keyboardScrollableWrapper}
							resetScrollToCoords={{ x: 0, y: 0 }}
						>
							<View testID={'create-password-screen'}>
								<View style={styles.content}>
									<Text style={styles.title}>{strings('change_email.enter_new_email_id')}</Text>
								</View>
								<View style={styles.field}>
									<TextField
										value={email}
										// label={strings('change_email.new_email')}
										placeholder={strings('change_email.email_id')}
										onChangeText={text => this.onEmailChange(text)}
										keyboardType="email-address"
										textInputWrapperStyle={styles.textInputWrapperStyle}
										containerStyle={styles.textContainerStyle}
										rightItem={
											!email ? null : isCheckingEmail ? (
												<ActivityIndicator size="small" color="#fff" />
											) : isValidEmail ? (
												<Icon name="check" size={16} color={colors.success} />
											) : (
												<Icon name="remove" size={16} color={colors.fontError} />
											)
										}
										onBlur={() => {
											this.setState({
												emailFocused: true
											});
										}}
									/>
									{!!emailErrorText && <Text style={styles.errorText}>{emailErrorText}</Text>}
								</View>

								{!!error && <Text style={styles.errorMsg}>{error}</Text>}
							</View>

							<View style={styles.ctaWrapper}>
								<StyledButton
									type={'normal'}
									onPress={() => this.onPressUpdate()}
									testID={'submit-button'}
									disabled={loading || !isValidEmail}
								>
									{isLoading ? (
										<ActivityIndicator size="small" color="#fff" />
									) : (
										strings('change_email.verify')
									)}
								</StyledButton>
							</View>
						</KeyboardAwareScrollView>
					</View>
				)}
			</SafeAreaView>
		);
	}

	render() {
		const { view, ready } = this.state;
		if (!ready) return this.renderLoader();
		return (
			<OnboardingScreenWithBg screen="a">
				<SafeAreaView style={styles.mainWrapper}>
					<TrackingScrollView
						contentContainerStyle={styles.scrollviewWrapper}
						style={styles.mainWrapper}
						testID={'account-backup-step-4-screen'}
					>
						{view === CHANGE_EMAIL ? this.renderChangeEmail() : this.renderConfirmPassword()}
					</TrackingScrollView>
				</SafeAreaView>
			</OnboardingScreenWithBg>
		);
	}
}

const mapStateToProps = state => ({
	keycloakAuth: state.user.keycloakAuth,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress
});

const mapDispatchToProps = dispatch => ({
	passwordSet: () => dispatch(passwordSet()),
	passwordUnset: () => dispatch(passwordUnset()),
	setLockTime: time => dispatch(setLockTime(time)),
	seedphraseNotBackedUp: () => dispatch(seedphraseNotBackedUp())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ChangeEmail);
