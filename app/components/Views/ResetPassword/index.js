import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
	KeyboardAvoidingView,
	Switch,
	ActivityIndicator,
	Alert,
	Text,
	View,
	SafeAreaView,
	Image,
	InteractionManager
} from 'react-native';
import CheckBox from '@react-native-community/checkbox';
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
import AppConstants from '../../../core/AppConstants';
import zxcvbn from 'zxcvbn';
import Logger from '../../../util/Logger';
import { ONBOARDING, PREVIOUS_SCREEN } from '../../../constants/navigation';
import { EXISTING_USER, TRUE, BIOMETRY_CHOICE_DISABLED } from '../../../constants/storage';
import { getPasswordStrengthWord, passwordRequirementsMet } from '../../../util/password';
import NotificationManager from '../../../core/NotificationManager';
import { syncPrefs } from '../../../util/sync';
import { displayName } from '../../../../app.json';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';
import TrackingTextInput from '../../UI/TrackingTextInput';
import TrackingScrollView from '../../UI/TrackingScrollView';

const PASSCODE_NOT_SET_ERROR = 'Error: Passcode not set.';
const RESET_PASSWORD = 'reset_password';
const CONFIRM_PASSWORD = 'confirm_password';

/**
 * View where users can set their password for the first time
 */
class ResetPassword extends PureComponent {
	static navigationOptions = ({ navigation }) =>
		getNavigationOptionsTitle(strings('password_reset.change_password'), navigation);

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

	state = {
		isSelected: false,
		password: '',
		confirmPassword: '',
		secureTextEntry: true,
		biometryType: null,
		biometryChoice: false,
		rememberMe: false,
		loading: false,
		error: null,
		inputWidth: { width: '99%' },
		view: RESET_PASSWORD,
		originalPassword: null,
		ready: true,
		validatePassword: {
			length: false,
			textUpperCase: false,
			textLowerCase: false,
			number: false,
			specialCharacter: false
		},
		isValidPassword: true,
		isBlurPassword: false
	};

	mounted = true;

	confirmPasswordInput = React.createRef();

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

	setSelection = () => {
		const { isSelected } = this.state;
		this.setState(() => ({ isSelected: !isSelected }));
	};

	onPressCreate = async () => {
		const { loading, isSelected, password, confirmPassword, originalPassword } = this.state;
		const passwordsMatch = password !== '' && password === confirmPassword;
		const canSubmit = passwordsMatch && isSelected;

		if (!canSubmit) return;
		if (loading) return;
		if (!passwordRequirementsMet(password)) {
			Alert.alert('Error', strings('choose_password.password_length_error'));
			return;
		} else if (password !== confirmPassword) {
			Alert.alert('Error', strings('choose_password.password_dont_match'));
			return;
		}
		try {
			this.setState({ loading: true });

			await this.recreateVault(originalPassword);
			// Set biometrics for new password
			await SecureKeychain.resetGenericPassword();
			try {
				if (this.state.biometryType && this.state.biometryChoice) {
					await SecureKeychain.setGenericPassword(password, SecureKeychain.TYPES.BIOMETRICS);
				} else if (this.state.rememberMe) {
					await SecureKeychain.setGenericPassword(password, SecureKeychain.TYPES.REMEMBER_ME);
				}
			} catch (error) {
				Logger.error(error);
			}

			await AsyncStorage.setItem(EXISTING_USER, TRUE);
			this.props.passwordSet();
			this.props.setLockTime(AppConstants.DEFAULT_LOCK_TIMEOUT);

			this.setState({ loading: false });
			InteractionManager.runAfterInteractions(() => {
				this.props.navigation.navigate('SecuritySettings');
				NotificationManager.showSimpleNotification({
					status: 'success',
					duration: 5000,
					title: strings('reset_password.password_updated'),
					description: strings('reset_password.successfully_changed')
				});
			});
		} catch (error) {
			// Should we force people to enable passcode / biometrics?
			if (error.toString() === PASSCODE_NOT_SET_ERROR) {
				Alert.alert(
					strings('choose_password.security_alert_title'),
					strings('choose_password.security_alert_message')
				);
				this.setState({ loading: false });
			} else {
				this.setState({ loading: false, error: error.toString() });
			}
		}
	};

	/**
	 * Recreates a vault
	 *
	 * @param password - Password to recreate and set the vault with
	 */
	recreateVault = async password => {
		const { originalPassword, password: newPassword } = this.state;
		const { KeyringController, PreferencesController } = Engine.context;
		const seedPhrase = await this.getSeedPhrase();
		const oldPrefs = PreferencesController.state;

		let importedAccounts = [];
		try {
			const keychainPassword = originalPassword;
			// Get imported accounts
			const simpleKeyrings = KeyringController.state.keyrings.filter(
				keyring => keyring.type === 'Simple Key Pair'
			);
			for (let i = 0; i < simpleKeyrings.length; i++) {
				const simpleKeyring = simpleKeyrings[i];
				const simpleKeyringAccounts = await Promise.all(
					simpleKeyring.accounts.map(account => KeyringController.exportAccount(keychainPassword, account))
				);
				importedAccounts = [...importedAccounts, ...simpleKeyringAccounts];
			}
		} catch (e) {
			Logger.error(e, 'error while trying to get imported accounts on recreate vault');
		}

		// Recreate keyring with password given to this method
		await KeyringController.createNewVaultAndRestore(newPassword, seedPhrase);

		// Get props to restore vault
		const hdKeyring = KeyringController.state.keyrings[0];
		const existingAccountCount = hdKeyring.accounts.length;
		const selectedAddress = this.props.selectedAddress;

		// Create previous accounts again
		for (let i = 0; i < existingAccountCount - 1; i++) {
			await KeyringController.addNewAccount();
		}

		try {
			// Import imported accounts again
			for (let i = 0; i < importedAccounts.length; i++) {
				await KeyringController.importAccountWithStrategy('privateKey', [importedAccounts[i]]);
			}
		} catch (e) {
			Logger.error(e, 'error while trying to import accounts on recreate vault');
		}

		//Persist old account/identities names
		const preferencesControllerState = PreferencesController.state;
		const prefUpdates = syncPrefs(oldPrefs, preferencesControllerState);

		// Set preferencesControllerState again
		await PreferencesController.update(prefUpdates);
		// Reselect previous selected account if still available
		if (hdKeyring.accounts.includes(selectedAddress)) {
			PreferencesController.setSelectedAddress(selectedAddress);
		} else {
			PreferencesController.setSelectedAddress(hdKeyring.accounts[0]);
		}
	};

	/**
	 * Returns current vault seed phrase
	 * It does it using an empty password or a password set by the user
	 * depending on the state the app is currently in
	 */
	getSeedPhrase = async () => {
		const { KeyringController } = Engine.context;
		const { originalPassword } = this.state;
		const keychainPassword = originalPassword;
		const mnemonic = await KeyringController.exportSeedPhrase(keychainPassword);
		return JSON.stringify(mnemonic).replace(/"/g, '');
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
		const { biometryType, rememberMe, biometryChoice } = this.state;
		return (
			<View style={styles.biometrics}>
				{biometryType ? (
					<>
						<Text style={styles.biometryLabel}>
							{strings(`biometrics.enable_${biometryType.toLowerCase()}`)}
						</Text>
						<View>
							<Switch
								onValueChange={this.updateBiometryChoice} // eslint-disable-line react/jsx-no-bind
								value={biometryChoice}
								style={styles.biometrySwitch}
								trackColor={{ true: colors.blue, false: colors.grey200 }}
								ios_backgroundColor={colors.grey300}
							/>
						</View>
					</>
				) : (
					<>
						<Text style={styles.biometryLabel}>{strings(`choose_password.remember_me`)}</Text>
						<Switch
							onValueChange={rememberMe => this.setState({ rememberMe })} // eslint-disable-line react/jsx-no-bind
							value={rememberMe}
							style={styles.biometrySwitch}
							trackColor={{ true: colors.blue, false: colors.grey200 }}
							ios_backgroundColor={colors.grey300}
						/>
					</>
				)}
			</View>
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
				view: RESET_PASSWORD
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
		this.tryUnlockWithPassword(password || hash);
	};

	onKeycloakResult = async error => {
		if (!error) {
			const hash = await preferences.getKeycloakHash();
			this.tryUnlock(hash);
		}
	};

	onPasswordChange = val => {
		const passInfo = zxcvbn(val);

		this.setState({ password: val, passwordStrength: passInfo.score });
	};

	onPasswordChangeWithValidate = val => {
		const passInfo = zxcvbn(val);

		this.setState({ password: val, passwordStrength: passInfo.score });
		this.checkValidPassword(val);
	};

	checkValidPassword(password) {
		this.setState({
			validatePassword: {
				length: password.length >= 8,
				textLowerCase: /[a-z]/.test(password),
				textUpperCase: /[A-Z]/.test(password),
				number: /[0-9]/.test(password),
				specialCharacter: /[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)
			},
			isValidPassword:
				password.length >= 8 &&
				/[a-z]/.test(password) &&
				/[A-Z]/.test(password) &&
				/[0-9]/.test(password) &&
				/[ `!@#$%^&*()_+\-=\[\]{};':"\\|,.<>\/?~]/.test(password)
		});
	}

	toggleShowHide = () => {
		this.setState(state => ({ secureTextEntry: !state.secureTextEntry }));
	};

	learnMore = () => {
		this.props.navigation.push('Webview', {
			url: routes.mainNetWork.helpSupportUrl,
			title: strings('drawer.metamask_support', { appName: displayName })
		});
	};

	renderLoader = () => (
		<View style={styles.loader}>
			<ActivityIndicator size="small" color={colors.white} />
		</View>
	);

	setConfirmPassword = val => this.setState({ confirmPassword: val });

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
										secureTextEntry
										onSubmitEditing={() => this.tryUnlock()}
										testID={'private-credential-password-text-input'}
										autoCapitalize="none"
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

	renderResetPassword() {
		const {
			isSelected,
			inputWidth,
			password,
			passwordStrength,
			confirmPassword,
			secureTextEntry,
			error,
			loading,
			validatePassword,
			isValidPassword,
			isBlurPassword
		} = this.state;
		const passwordsMatch = password !== '' && password === confirmPassword;
		const canSubmit = passwordsMatch && isValidPassword && isSelected;
		const previousScreen = this.props.navigation.getParam(PREVIOUS_SCREEN);
		const passwordStrengthWord = getPasswordStrengthWord(passwordStrength);
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
									<Text style={styles.title}>{strings('reset_password.title')}</Text>
									<View style={styles.text}>
										<Text style={styles.subtitle}>
											{strings('reset_password.subtitle', { appName: displayName })}
										</Text>
									</View>
								</View>
								<View style={styles.field}>
									<Text style={styles.hintLabel}>{strings('reset_password.password')}</Text>
									<Text onPress={this.toggleShowHide} style={[styles.hintLabel, styles.showPassword]}>
										{strings(`reset_password.${secureTextEntry ? 'show' : 'hide'}`)}
									</Text>
									<TrackingTextInput
										style={[styles.input, inputWidth]}
										value={password}
										onChangeText={this.onPasswordChangeWithValidate}
										secureTextEntry={secureTextEntry}
										placeholder=""
										testID="input-password"
										onSubmitEditing={this.jumpToConfirmPassword}
										returnKeyType="next"
										autoCapitalize="none"
									/>
									<Text style={styles.passwordValidateTitle}>
										{strings(`choose_password.password_validate_title`)}
									</Text>
									<View style={styles.passwordItemWrapper}>
										{validatePassword.length && (
											<Icon style={styles.passwordItemIcon} name={'check'} />
										)}
										<Text
											style={
												isBlurPassword && !validatePassword.length
													? styles.passwordItemTextError
													: styles.passwordItemText
											}
										>
											{strings(`choose_password.password_validate_1`)}
										</Text>
									</View>
									<View style={styles.passwordItemWrapper}>
										{validatePassword.textLowerCase && (
											<Icon style={styles.passwordItemIcon} name={'check'} />
										)}
										<Text
											style={
												isBlurPassword && !validatePassword.textLowerCase
													? styles.passwordItemTextError
													: styles.passwordItemText
											}
										>
											{strings(`choose_password.password_validate_2`)}
										</Text>
									</View>
									<View style={styles.passwordItemWrapper}>
										{validatePassword.textUpperCase && (
											<Icon style={styles.passwordItemIcon} name={'check'} />
										)}
										<Text
											style={
												isBlurPassword && !validatePassword.textUpperCase
													? styles.passwordItemTextError
													: styles.passwordItemText
											}
										>
											{strings(`choose_password.password_validate_3`)}
										</Text>
									</View>
									<View style={styles.passwordItemWrapper}>
										{validatePassword.number && (
											<Icon style={styles.passwordItemIcon} name={'check'} />
										)}
										<Text
											style={
												isBlurPassword && !validatePassword.number
													? styles.passwordItemTextError
													: styles.passwordItemText
											}
										>
											{strings(`choose_password.password_validate_4`)}
										</Text>
									</View>
									<View style={styles.passwordItemWrapper}>
										{validatePassword.specialCharacter && (
											<Icon style={styles.passwordItemIcon} name={'check'} />
										)}
										<Text
											style={
												isBlurPassword && !validatePassword.specialCharacter
													? styles.passwordItemTextError
													: styles.passwordItemText
											}
										>
											{strings(`choose_password.password_validate_5`)}
										</Text>
									</View>
								</View>
								<View style={styles.field}>
									<Text style={styles.hintLabel}>{strings('reset_password.confirm_password')}</Text>
									<TrackingTextInput
										ref={this.confirmPasswordInput}
										style={[styles.input, inputWidth]}
										value={confirmPassword}
										onChangeText={this.setConfirmPassword}
										secureTextEntry={secureTextEntry}
										placeholder={''}
										placeholderTextColor={colors.grey100}
										testID={'input-password-confirm'}
										onSubmitEditing={this.onPressCreate}
										returnKeyType={'done'}
										autoCapitalize="none"
									/>
									<View style={styles.showMatchingPasswords}>
										{passwordsMatch ? (
											<Icon name="check" size={16} color={colors.green300} />
										) : null}
									</View>
									{/* <Text style={styles.hintLabel}>
										{strings('reset_password.must_be_at_least', { number: 8 })}
									</Text> */}
									{isValidPassword && !!confirmPassword && !passwordsMatch && (
										<Text style={styles.passwordStrengthLabel}>
											{strings('choose_password.password_match')}
										</Text>
									)}
								</View>
								<View>{this.renderSwitch()}</View>
								<View style={styles.checkboxContainer}>
									<CheckBox
										value={isSelected}
										onValueChange={this.setSelection}
										style={styles.checkbox}
										tintColors={{ true: colors.blue }}
										boxType="square"
										testID={'password-understand-box'}
									/>
									<Text style={styles.label} onPress={this.setSelection} testID={'i-understand-text'}>
										{strings('reset_password.i_understand', { appName: displayName })}{' '}
										<Text onPress={this.learnMore} style={styles.learnMore}>
											{strings('reset_password.learn_more')}
										</Text>
									</Text>
								</View>

								{!!error && <Text style={styles.errorMsg}>{error}</Text>}
							</View>

							<View style={styles.ctaWrapper}>
								<StyledButton
									type={'normal'}
									onPress={this.onPressCreate}
									testID={'submit-button'}
									disabled={!canSubmit}
								>
									{strings('reset_password.reset_button')}
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
						{view === RESET_PASSWORD ? this.renderResetPassword() : this.renderConfirmPassword()}
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
)(ResetPassword);
