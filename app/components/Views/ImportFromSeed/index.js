import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
	Switch,
	ActivityIndicator,
	Alert,
	TouchableOpacity,
	Text,
	View,
	TextInput,
	SafeAreaView,
	StyleSheet
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import { getOnboardingNavbarOptions } from '../../UI/Navbar';
import { connect } from 'react-redux';
import { passwordSet, seedphraseBackedUp } from '../../../actions/user';
import { setLockTime } from '../../../actions/settings';
import StyledButton from '../../UI/StyledButton';
import Engine from '../../../core/Engine';
import { colors, fontStyles } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import SecureKeychain from '../../../core/SecureKeychain';
import AppConstants from '../../../core/AppConstants';
import setOnboardingWizardStep from '../../../actions/wizard';
import TermsAndConditions from '../TermsAndConditions';
import zxcvbn from 'zxcvbn';
import Icon from 'react-native-vector-icons/FontAwesome';
import Device from '../../../util/Device';
import { failedSeedPhraseRequirements, isValidMnemonic, parseSeedPhrase } from '../../../util/validators';
import { FilledTextField } from 'react-native-material-textfield';
import {
	SEED_PHRASE_HINTS,
	BIOMETRY_CHOICE_DISABLED,
	NEXT_MAKER_REMINDER,
	ONBOARDING_WIZARD,
	EXISTING_USER,
	METRICS_OPT_IN,
	TRUE
} from '../../../constants/storage';
import Logger from '../../../util/Logger';
import { getPasswordStrengthWord, passwordRequirementsMet, MIN_PASSWORD_LENGTH } from '../../../util/password';
import importAdditionalAccounts from '../../../util/importAdditionalAccounts';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';

const PASSCODE_NOT_SET_ERROR = 'Error: Passcode not set.';

/**
 * View where users can set restore their account
 * using a seed phrase
 */
class ImportFromSeed extends PureComponent {
	static navigationOptions = ({ navigation }) => getOnboardingNavbarOptions(navigation);

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
		 * The action to set the locktime
		 * in the redux store
		 */
		setLockTime: PropTypes.func,
		/**
		 * The action to update the seedphrase backed up flag
		 * in the redux store
		 */
		seedphraseBackedUp: PropTypes.func,
		/**
		 * Action to set onboarding wizard step
		 */
		setOnboardingWizardStep: PropTypes.func
	};

	state = {
		password: '',
		confirmPassword: '',
		seed: '',
		biometryType: null,
		rememberMe: false,
		secureTextEntry: true,
		biometryChoice: false,
		loading: false,
		error: null,
		seedphraseInputFocused: false,
		inputWidth: { width: '99%' },
		hideSeedPhraseInput: true,
		isValidPassword: true,
		passwordErrorType: '1'
	};

	passwordInput = React.createRef();
	confirmPasswordInput = React.createRef();

	async componentDidMount() {
		const biometryType = await SecureKeychain.getSupportedBiometryType();
		if (biometryType) {
			let enabled = true;
			const previouslyDisabled = await AsyncStorage.removeItem(BIOMETRY_CHOICE_DISABLED);
			if (previouslyDisabled && previouslyDisabled === TRUE) {
				enabled = false;
			}
			this.setState({ biometryType: Device.isAndroid() ? 'biometrics' : biometryType, biometryChoice: enabled });
		}
		// Workaround https://github.com/facebook/react-native/issues/9958
		setTimeout(() => {
			this.setState({ inputWidth: { width: '100%' } });
		}, 100);
	}

	onPressImport = async () => {
		const { loading, seed, password, confirmPassword } = this.state;
		const parsedSeed = parseSeedPhrase(seed);

		if (loading) return;
		let error = null;
		if (!passwordRequirementsMet(password)) {
			error = strings('import_from_seed.password_length_error');
		} else if (password !== confirmPassword) {
			error = strings('import_from_seed.password_dont_match');
		}

		if (failedSeedPhraseRequirements(parsedSeed)) {
			error = strings('import_from_seed.seed_phrase_requirements');
		} else if (!isValidMnemonic(parsedSeed)) {
			error = strings('import_from_seed.invalid_seed_phrase');
		}

		if (error) {
			Alert.alert(strings('import_from_seed.error'), error);
		} else {
			try {
				this.setState({ loading: true });

				const { KeyringController } = Engine.context;
				await Engine.resetState();
				await AsyncStorage.removeItem(NEXT_MAKER_REMINDER);
				await KeyringController.createNewVaultAndRestore(password, parsedSeed);

				if (this.state.rememberMe) {
					await SecureKeychain.setGenericPassword(password, SecureKeychain.TYPES.REMEMBER_ME);
				} else if (this.state.biometryType && this.state.biometryChoice) {
					await SecureKeychain.setGenericPassword(password, SecureKeychain.TYPES.BIOMETRICS);
				} else {
					await SecureKeychain.resetGenericPassword();
				}
				// Get onboarding wizard state
				const onboardingWizard = await AsyncStorage.getItem(ONBOARDING_WIZARD);
				// Check if user passed through metrics opt-in screen
				const metricsOptIn = await AsyncStorage.getItem(METRICS_OPT_IN);
				// mark the user as existing so it doesn't see the create password screen again
				await AsyncStorage.setItem(EXISTING_USER, TRUE);
				await AsyncStorage.removeItem(SEED_PHRASE_HINTS);
				this.setState({ loading: false });
				this.props.passwordSet();
				this.props.setLockTime(AppConstants.DEFAULT_LOCK_TIMEOUT);
				this.props.seedphraseBackedUp();
				if (!metricsOptIn) {
					this.props.navigation.navigate('OptinMetrics');
				} else if (onboardingWizard) {
					this.props.navigation.navigate('ManualBackupStep3');
				} else {
					this.props.setOnboardingWizardStep(1);
					this.props.navigation.navigate('Dashboard');
				}
				await importAdditionalAccounts();
			} catch (error) {
				// Should we force people to enable passcode / biometrics?
				if (error.toString() === PASSCODE_NOT_SET_ERROR) {
					Alert.alert(
						'Security Alert',
						'In order to proceed, you need to turn Passcode on or any biometrics authentication method supported in your device (FaceID, TouchID or Fingerprint)'
					);
					this.setState({ loading: false });
				} else {
					this.setState({ loading: false, error: error.toString() });
					Logger.log('Error with seed phrase import', error);
				}
			}
		}
	};

	onBiometryChoiceChange = value => {
		this.setState({ biometryChoice: value });
	};

	onSeedWordsChange = seed => {
		this.setState({ seed });
	};

	onPasswordChange = val => {
		const passInfo = zxcvbn(val);

		this.setState({ password: val, passwordStrength: passInfo.score });
	};

	onPasswordConfirmChange = val => {
		this.setState({ confirmPassword: val });
	};

	jumpToPassword = () => {
		const { current } = this.passwordInput;
		current && current.focus();
	};

	jumpToConfirmPassword = () => {
		const { current } = this.confirmPasswordInput;
		current && current.focus();
	};

	updateBiometryChoice = async biometryChoice => {
		if (!biometryChoice) {
			await AsyncStorage.setItem(BIOMETRY_CHOICE_DISABLED, TRUE);
		} else {
			await AsyncStorage.removeItem(BIOMETRY_CHOICE_DISABLED);
		}
		this.setState({ biometryChoice });
	};

	renderSwitch = () => {
		if (this.state.biometryType) {
			return (
				<>
					<View style={styles.biometricTop}>
						<Text style={styles.biometryLabel}>{strings(`choose_password.remember_me`)}</Text>
						<Switch
							onValueChange={rememberMe => this.setState({ rememberMe })} // eslint-disable-line react/jsx-no-bind
							value={this.state.rememberMe}
							style={styles.biometrySwitch}
							trackColor={{ true: colors.blue, false: colors.grey200 }}
							ios_backgroundColor={colors.grey300}
						/>
					</View>
					<View style={styles.biometricBottom}>
						<Text style={styles.biometryLabel}>
							{strings(`biometrics.enable_${this.state.biometryType.toLowerCase()}`)}
						</Text>
						<Switch
							onValueChange={this.updateBiometryChoice}
							value={this.state.biometryChoice}
							style={styles.biometrySwitch}
							trackColor={{ true: colors.blue, false: colors.grey200 }}
							ios_backgroundColor={colors.grey300}
						/>
					</View>
				</>
			);
		}

		return (
			<View style={styles.biometrics}>
				<Text style={styles.biometryLabel}>{strings(`choose_password.remember_me`)}</Text>
				<Switch
					onValueChange={rememberMe => this.setState({ rememberMe })} // eslint-disable-line react/jsx-no-bind
					value={this.state.rememberMe}
					style={styles.biometrySwitch}
					trackColor={{ true: colors.blue, false: colors.grey200 }}
					ios_backgroundColor={colors.grey300}
				/>
			</View>
		);
	};

	toggleShowHide = () => {
		this.setState({ secureTextEntry: !this.state.secureTextEntry });
	};

	toggleHideSeedPhraseInput = () => {
		this.setState(({ hideSeedPhraseInput }) => ({ hideSeedPhraseInput: !hideSeedPhraseInput }));
	};

	onQrCodePress = () => {
		setTimeout(this.toggleHideSeedPhraseInput, 100);
		this.props.navigation.navigate('QRScanner', {
			onScanSuccess: ({ seed = undefined }) => {
				if (seed) {
					this.setState({ seed });
				} else {
					Alert.alert(
						strings('import_from_seed.invalid_qr_code_title'),
						strings('import_from_seed.invalid_qr_code_message')
					);
				}
				this.toggleHideSeedPhraseInput();
			},
			onScanError: error => {
				this.toggleHideSeedPhraseInput();
			}
		});
	};

	seedphraseInputFocused = () => this.setState({ seedphraseInputFocused: !this.state.seedphraseInputFocused });

	checkValidPassword() {
		const { password } = this.state;
		if (password.length < 8) {
			this.setState({ isValidPassword: false, passwordErrorType: '1' });
			return;
		}
		if (!/[a-z]/.test(password)) {
			this.setState({ isValidPassword: false, passwordErrorType: '2' });
			return;
		}
		if (!/[A-Z]/.test(password)) {
			this.setState({ isValidPassword: false, passwordErrorType: '3' });
			return;
		}
		if (!/[0-9]/.test(password)) {
			this.setState({ isValidPassword: false, passwordErrorType: '4' });
			return;
		}
		if (!/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)) {
			this.setState({ isValidPassword: false, passwordErrorType: '5' });
			return;
		}
		this.setState({ isValidPassword: true });
		return;
	}

	render() {
		const {
			password,
			passwordStrength,
			confirmPassword,
			seed,
			seedphraseInputFocused,
			inputWidth,
			secureTextEntry,
			error,
			loading,
			hideSeedPhraseInput,
			isValidPassword,
			passwordErrorType
		} = this.state;

		const passwordStrengthWord = getPasswordStrengthWord(passwordStrength);
		const passwordsMatch = password !== '' && password === confirmPassword;

		return (
			<OnboardingScreenWithBg screen="a">
				<SafeAreaView style={styles.mainWrapper}>
					<KeyboardAwareScrollView style={styles.wrapper} resetScrollToCoords={{ x: 0, y: 0 }}>
						<View testID={'import-from-seed-screen'}>
							<Text style={styles.title}>{strings('import_from_seed.title')}</Text>
							<View style={styles.fieldRow}>
								<View style={styles.fieldCol}>
									<Text style={styles.label}>{strings('choose_password.seed_phrase')}</Text>
								</View>
								<View style={[styles.fieldCol, styles.fieldColRight]}>
									<TouchableOpacity onPress={this.toggleHideSeedPhraseInput}>
										<Text style={styles.label}>
											{strings(`choose_password.${hideSeedPhraseInput ? 'show' : 'hide'}`)}
										</Text>
									</TouchableOpacity>
								</View>
							</View>
							{hideSeedPhraseInput ? (
								<FilledTextField
									style={styles.input}
									containerStyle={inputWidth}
									inputContainerStyle={styles.inputContainerStyle}
									placeholder={strings('import_from_seed.seed_phrase_placeholder')}
									testID="input-seed-phrase"
									returnKeyType="next"
									autoCapitalize="none"
									secureTextEntry={hideSeedPhraseInput}
									onChangeText={this.onSeedWordsChange}
									value={seed}
									baseColor={colors.red}
									tintColor={colors.blue}
									placeholderTextColor={colors.grey300}
									onSubmitEditing={this.jumpToPassword}
									lineWidth={0}
									activeLineWidth={0}
								/>
							) : (
								<TextInput
									value={seed}
									numberOfLines={3}
									style={[
										styles.seedPhrase,
										inputWidth,
										seedphraseInputFocused && styles.inputFocused
									]}
									secureTextEntry
									multiline={!hideSeedPhraseInput}
									placeholder={strings('import_from_seed.seed_phrase_placeholder')}
									placeholderTextColor={colors.grey200}
									onChangeText={this.onSeedWordsChange}
									testID="input-seed-phrase"
									blurOnSubmit
									onSubmitEditing={this.jumpToPassword}
									returnKeyType="next"
									keyboardType={
										(!hideSeedPhraseInput && Device.isAndroid() && 'visible-password') || 'default'
									}
									autoCapitalize="none"
									autoCorrect={false}
									onFocus={(!hideSeedPhraseInput && this.seedphraseInputFocused) || null}
									onBlur={(!hideSeedPhraseInput && this.seedphraseInputFocused) || null}
								/>
							)}
							<TouchableOpacity style={styles.qrCode} onPress={this.onQrCodePress}>
								<Icon name="qrcode" size={20} color={colors.fontSecondary} />
							</TouchableOpacity>
							<View style={styles.field}>
								<View style={styles.fieldRow}>
									<View style={styles.fieldCol}>
										<Text style={styles.label}>{strings('import_from_seed.new_password')}</Text>
									</View>
									<View style={[styles.fieldCol, styles.fieldColRight]}>
										<TouchableOpacity onPress={this.toggleShowHide}>
											<Text style={styles.label}>
												{strings(`choose_password.${secureTextEntry ? 'show' : 'hide'}`)}
											</Text>
										</TouchableOpacity>
									</View>
								</View>
								<FilledTextField
									style={styles.input}
									containerStyle={inputWidth}
									inputContainerStyle={styles.inputContainerStyle}
									ref={this.passwordInput}
									placeholder={strings('import_from_seed.new_password')}
									testID={'input-password-field'}
									returnKeyType={'next'}
									autoCapitalize="none"
									secureTextEntry={secureTextEntry}
									onChangeText={this.onPasswordChange}
									value={password}
									baseColor={colors.white}
									tintColor={colors.blue}
									lineWidth={0}
									activeLineWidth={0}
									placeholderTextColor={colors.grey300}
									onSubmitEditing={this.jumpToConfirmPassword}
									onBlur={() => {
										this.checkValidPassword();
									}}
								/>

								{(!isValidPassword && (
									<Text style={styles.passwordStrengthLabel} numberOfLines={2}>
										{strings(`choose_password.password_error_${passwordErrorType}`)}
									</Text>
								)) || <Text style={styles.passwordStrengthLabel} />}
							</View>

							<View style={styles.field}>
								<Text style={styles.label}>{strings('import_from_seed.confirm_password')}</Text>
								<FilledTextField
									style={styles.input}
									containerStyle={inputWidth}
									inputContainerStyle={styles.inputContainerStyle}
									ref={this.confirmPasswordInput}
									testID={'input-password-field-confirm'}
									onChangeText={this.onPasswordConfirmChange}
									returnKeyType={'next'}
									autoCapitalize="none"
									secureTextEntry={secureTextEntry}
									placeholder={strings('import_from_seed.confirm_password')}
									value={confirmPassword}
									baseColor={colors.white}
									tintColor={colors.blue}
									placeholderTextColor={colors.grey300}
									onSubmitEditing={this.onPressImport}
									lineWidth={0}
									activeLineWidth={0}
								/>

								<View style={styles.showMatchingPasswords}>
									{password !== '' && password === confirmPassword ? (
										<Icon name="check" size={12} color={colors.green300} />
									) : null}
								</View>
								{!passwordsMatch && (
									<Text style={styles.passwordStrengthLabel}>
										{strings('choose_password.password_match')}
									</Text>
								)}
							</View>

							{this.renderSwitch()}

							{!!error && (
								<Text style={styles.errorMsg} testID={'invalid-seed-phrase'}>
									{error}
								</Text>
							)}

							<View style={styles.ctaWrapper}>
								<StyledButton
									type={'normal'}
									onPress={this.onPressImport}
									testID={'submit'}
									disabled={!(password !== '' && password === confirmPassword)}
								>
									{loading ? (
										<ActivityIndicator size="small" color="white" />
									) : (
										strings('import_from_seed.import_button')
									)}
								</StyledButton>
							</View>
						</View>
					</KeyboardAwareScrollView>
					<View style={styles.termsAndConditions}>
						<TermsAndConditions
							navigation={this.props.navigation}
							action={strings('import_from_seed.import_button')}
						/>
					</View>
				</SafeAreaView>
			</OnboardingScreenWithBg>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	setLockTime: time => dispatch(setLockTime(time)),
	setOnboardingWizardStep: step => dispatch(setOnboardingWizardStep(step)),
	passwordSet: () => dispatch(passwordSet()),
	seedphraseBackedUp: () => dispatch(seedphraseBackedUp())
});

export default connect(
	null,
	mapDispatchToProps
)(ImportFromSeed);
