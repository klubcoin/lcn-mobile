import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Switch, ActivityIndicator, Alert, Text, View, TextInput, SafeAreaView, Image } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux';
import * as base64 from 'base-64';
import * as RNFS from 'react-native-fs';
import {
	keycloakAuthSet,
	keycloakAuthUnset,
	passwordSet,
	passwordUnset,
	seedphraseNotBackedUp
} from '../../../actions/user';
import { setLockTime } from '../../../actions/settings';
import routes from '../../../common/routes';
import preferences from '../../../../app/store/preferences';
import StyledButton from '../../UI/StyledButton';
import Engine from '../../../core/Engine';
import Device from '../../../util/Device';
import { colors } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import { getOnboardingNavbarOptions } from '../../UI/Navbar';
import SecureKeychain from '../../../core/SecureKeychain';
import Icon from 'react-native-vector-icons/FontAwesome';
import FontAwesome5Icon from 'react-native-vector-icons/FontAwesome5';
import AppConstants from '../../../core/AppConstants';
import OnboardingProgress from '../../UI/OnboardingProgress';
import zxcvbn from 'zxcvbn';
import Logger from '../../../util/Logger';
import { ONBOARDING, PREVIOUS_SCREEN } from '../../../constants/navigation';
import {
	EXISTING_USER,
	NEXT_MAKER_REMINDER,
	TRUE,
	SEED_PHRASE_HINTS,
	BIOMETRY_CHOICE_DISABLED
} from '../../../constants/storage';
import { getPasswordStrengthWord, passwordRequirementsMet } from '../../../util/password';
import API from 'services/api';
import Routes from 'common/routes';
import * as sha3JS from 'js-sha3';
import { CHOOSE_PASSWORD_STEPS } from '../../../constants/onboarding';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';
import { displayName } from '../../../../app.json';
import TextField from '../../UI/TextField';

const PASSCODE_NOT_SET_ERROR = 'Error: Passcode not set.';

/**
 * View where users can set their password for the first time
 */
class ChoosePassword extends PureComponent {
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
		 * The action to update the password set flag
		 * in the redux store to false
		 */
		passwordUnset: PropTypes.func,
		/**
		 * The action to update the lock time
		 * in the redux store
		 */
		setLockTime: PropTypes.func,
		/**
		 * A string representing the selected address => account
		 */
		selectedAddress: PropTypes.string,
		/**
		 * Action to reset the flag seedphraseBackedUp in redux
		 */
		seedphraseNotBackedUp: PropTypes.func
	};

	state = {
		isSelected: false,
		password: '',
		confirmPassword: '',
		username: '',
		secureTextEntry: true,
		biometryType: null,
		biometryChoice: false,
		rememberMe: false,
		loading: false,
		error: null,
		usePasswordAuth: true,
		inputWidth: { width: '99%' },
		isValidPassword: true,
		passwordErrorType: '1'
	};

	mounted = true;

	confirmPasswordInput = React.createRef();
	// Flag to know if password in keyring was set or not
	keyringControllerPasswordSet = false;

	async componentDidMount() {
		const biometryType = await SecureKeychain.getSupportedBiometryType();
		if (biometryType) {
			this.setState({ biometryType: Device.isAndroid() ? 'biometrics' : biometryType, biometryChoice: true });
		}
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

	createNewVaultAndKeychain = async password => {
		const { KeyringController } = Engine.context;
		await Engine.resetState();
		await KeyringController.createNewVaultAndKeychain(password);
		this.keyringControllerPasswordSet = true;
	};

	async sendAccount() {
		const { selectedAddress, keyringController } = this.props;
		let vault = JSON.parse(keyringController.vault);
		console.log('selected', selectedAddress);
		console.log('keyringController', vault);
		if (selectedAddress == null) {
			return;
		}
		const { avatar, firstname, lastname, email, phone } = preferences.onboardProfile;
		const { username } = this.state;
		const name = `${firstname} ${lastname}`;
		const avatarb64 = await RNFS.readFile(avatar, 'base64');
		const publicInfo = JSON.stringify({ email, phone, name });
		const hash = sha3JS.keccak_256(firstname + lastname + selectedAddress + publicInfo + avatarb64);
		const params = [username, selectedAddress, hash, publicInfo];

		API.postRequest(
			Routes.walletCreation,
			params,
			response => {
				console.log('account creation', response);
			},
			error => {
				console.log('error account', error);
			}
		);
	}

	onPressCreate = async () => {
		const { loading, isSelected, password, confirmPassword } = this.state;
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

			const previous_screen = this.props.navigation.getParam(PREVIOUS_SCREEN);

			if (previous_screen === ONBOARDING) {
				await this.createNewVaultAndKeychain(password);
				this.props.seedphraseNotBackedUp();
				await AsyncStorage.removeItem(NEXT_MAKER_REMINDER);
				await AsyncStorage.setItem(EXISTING_USER, TRUE);
				await AsyncStorage.removeItem(SEED_PHRASE_HINTS);
			} else {
				await this.recreateVault(password);
			}

			// Set state in app as it was with password
			await SecureKeychain.resetGenericPassword();
			if (this.state.rememberMe) {
				await SecureKeychain.setGenericPassword(password, SecureKeychain.TYPES.REMEMBER_ME);
			} else if (this.state.biometryType && this.state.biometryChoice) {
				await SecureKeychain.setGenericPassword(password, SecureKeychain.TYPES.BIOMETRICS);
			} else {
				await SecureKeychain.resetGenericPassword();
			}
			preferences.setKeycloakHash(password);
			await AsyncStorage.setItem(EXISTING_USER, TRUE);
			await AsyncStorage.removeItem(SEED_PHRASE_HINTS);
			this.sendAccount();
			this.props.passwordSet();
			this.props.setLockTime(AppConstants.DEFAULT_LOCK_TIMEOUT);
			this.setState({ loading: false });
			this.props.navigation.navigate('AccountBackupStep1');
		} catch (error) {
			this.onError(error);
		}
	};

	onError = async error => {
		await this.recreateVault('');
		// Set state in app as it was with no password
		await SecureKeychain.resetGenericPassword();
		await AsyncStorage.removeItem(NEXT_MAKER_REMINDER);
		await AsyncStorage.setItem(EXISTING_USER, TRUE);
		await AsyncStorage.removeItem(SEED_PHRASE_HINTS);
		this.props.passwordUnset();
		this.props.keycloakAuthUnset();
		this.props.setLockTime(-1);
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
	};

	/**
	 * Recreates a vault
	 *
	 * @param password - Password to recreate and set the vault with
	 */
	recreateVault = async password => {
		const { KeyringController, PreferencesController } = Engine.context;
		const seedPhrase = await this.getSeedPhrase(password);

		let importedAccounts = [];
		try {
			const keychainPassword = this.keyringControllerPasswordSet ? password : '';
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
		await KeyringController.createNewVaultAndRestore(password, seedPhrase);
		// Keyring is set with empty password or not
		this.keyringControllerPasswordSet = password !== '';

		// Get props to restore vault
		const hdKeyring = KeyringController.state.keyrings[0];
		const existingAccountCount = hdKeyring.accounts.length;
		const selectedAddress = this.props.selectedAddress;
		let preferencesControllerState = PreferencesController.state;

		// Create previous accounts again
		for (let i = 0; i < existingAccountCount - 1; i++) {
			await KeyringController.addNewAccount();
		}

		console.log('create new accounts on recreate');

		try {
			// Import imported accounts again
			for (let i = 0; i < importedAccounts.length; i++) {
				await KeyringController.importAccountWithStrategy('privateKey', [importedAccounts[i]]);
			}
		} catch (e) {
			Logger.error(e, 'error while trying to import accounts on recreate vault');
		}

		// Reset preferencesControllerState
		preferencesControllerState = PreferencesController.state;

		// Set preferencesControllerState again
		await PreferencesController.update(preferencesControllerState);
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
	getSeedPhrase = async password => {
		const { KeyringController } = Engine.context;
		const keychainPassword = this.keyringControllerPasswordSet ? password : '';
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

	onPasswordChange = val => {
		const passInfo = zxcvbn(val);

		this.setState({ password: val, passwordStrength: passInfo.score });
	};

	onUsernameChange = val => {
		this.setState({ username: val });
	};

	toggleShowHide = () => {
		this.setState(state => ({ secureTextEntry: !state.secureTextEntry }));
	};

	learnMore = () => {
		this.props.navigation.push('Webview', {
			url: routes.mainNetWork.helpSupportUrl,
			title: strings('drawer.metamask_support', { appName: displayName })
		});
	};

	setConfirmPassword = val => this.setState({ confirmPassword: val });

	onUsePassword = () => {
		this.setState({ usePasswordAuth: true });
	};

	onKeycloakResult = async error => {
		if (!error) {
			try {
				const password = base64.encode(`${new Date().getUTCMilliseconds()}`);
				preferences.setKeycloakHash(password);

				this.setState({ loading: true });

				const previous_screen = this.props.navigation.getParam(PREVIOUS_SCREEN);

				if (previous_screen === ONBOARDING) {
					await this.createNewVaultAndKeychain(password);
					this.props.seedphraseNotBackedUp();
					await AsyncStorage.removeItem(NEXT_MAKER_REMINDER);
					await AsyncStorage.setItem(EXISTING_USER, TRUE);
					await AsyncStorage.removeItem(SEED_PHRASE_HINTS);
				} else {
					await this.recreateVault(password);
				}

				// Set state in app as it was with password
				await SecureKeychain.resetGenericPassword();
				if (this.state.biometryType && this.state.biometryChoice) {
					await SecureKeychain.setGenericPassword(password, SecureKeychain.TYPES.BIOMETRICS);
				} else if (this.state.rememberMe) {
					await SecureKeychain.setGenericPassword(password, SecureKeychain.TYPES.REMEMBER_ME);
				} else {
					await SecureKeychain.resetGenericPassword();
				}
				await AsyncStorage.setItem(EXISTING_USER, TRUE);
				await AsyncStorage.removeItem(SEED_PHRASE_HINTS);
				this.sendAccount();
				this.props.keycloakAuthSet();
				this.props.setLockTime(AppConstants.DEFAULT_LOCK_TIMEOUT);
				this.setState({ loading: false });
				this.props.navigation.navigate('AccountBackupStep1');
			} catch (error) {
				this.onError(error);
			}
		}
	};

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
			isSelected,
			inputWidth,
			password,
			passwordStrength,
			confirmPassword,
			username,
			secureTextEntry,
			error,
			loading,
			usePasswordAuth,
			isValidPassword,
			passwordErrorType
		} = this.state;
		const passwordsMatch = password !== '' && password === confirmPassword;
		const canSubmit = passwordsMatch && isSelected && username !== '';
		const previousScreen = this.props.navigation.getParam(PREVIOUS_SCREEN);
		const passwordStrengthWord = getPasswordStrengthWord(passwordStrength);

		return (
			<OnboardingScreenWithBg screen="a">
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
							<OnboardingProgress steps={CHOOSE_PASSWORD_STEPS} currentStep={1} />
							<KeyboardAwareScrollView
								style={styles.scrollableWrapper}
								contentContainerStyle={styles.keyboardScrollableWrapper}
								resetScrollToCoords={{ x: 0, y: 0 }}
							>
								{/* <LoginWithKeycloak
									label={strings('choose_password.setup_liquichain_account', {
										appName: displayName
									})}
									onSuccess={this.onKeycloakResult}
									onError={this.onKeycloakResult}
								/> */}
								{!usePasswordAuth && (
									<>
										<Text style={styles.or}>{strings('choose_password.or')}</Text>
										<StyledButton
											style={styles.button}
											type={'normal'}
											onPress={this.onUsePassword}
										>
											{strings('choose_password.setup_local_account')}
										</StyledButton>
									</>
								)}
								{usePasswordAuth && (
									<>
										<View testID={'create-password-screen'}>
											<View style={styles.content}>
												<Text style={styles.title}>{strings('choose_password.title')}</Text>
												<View style={styles.text}>
													<Text style={styles.subtitle}>
														{strings('choose_password.subtitle', { appName: displayName })}
													</Text>
												</View>
											</View>
											<View style={styles.field}>
												<View style={styles.newPwdTitle}>
													<Text style={styles.hintLabel}>
														{strings('choose_password.password')}
													</Text>
													<FontAwesome5Icon
														name={'eye'}
														color={colors.white}
														size={20}
														onPress={this.toggleShowHide}
													/>
													{/* <Text onPress={this.toggleShowHide} style={styles.hintLabel}>
															{strings(`choose_password.${secureTextEntry ? 'show' : 'hide'}`)}
														</Text> */}
												</View>
												<TextInput
													style={[styles.input, inputWidth]}
													value={password}
													onChangeText={this.onPasswordChange}
													secureTextEntry={secureTextEntry}
													placeholder=""
													testID="input-password"
													onSubmitEditing={this.jumpToConfirmPassword}
													returnKeyType="next"
													autoCapitalize="none"
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
												<Text style={styles.hintLabel}>
													{strings('choose_password.confirm_password')}
												</Text>
												<TextInput
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
												{!passwordsMatch && (
													<Text style={styles.passwordStrengthLabel}>
														{strings('choose_password.password_match')}
													</Text>
												)}
											</View>
											<TextField
												value={username}
												label={strings('choose_password.username')}
												placeholder={strings('login.type_here')}
												containerStyle={styles.usernameField}
												onChangeText={this.onUsernameChange}
											/>
											<View>{this.renderSwitch()}</View>
											<View style={styles.checkboxContainer}>
												<CheckBox
													value={isSelected}
													onValueChange={this.setSelection}
													style={styles.checkbox}
													onCheckColor={colors.blue}
													onTintColor={colors.blue}
													tintColors={{ true: colors.blue }}
													boxType="square"
													testID={'password-understand-box'}
												/>
												<Text
													style={styles.label}
													onPress={this.setSelection}
													testID={'i-understand-text'}
												>
													{strings('choose_password.i_understand', { appName: displayName })}{' '}
													<Text onPress={this.learnMore} style={styles.learnMore}>
														{strings('choose_password.learn_more')}
													</Text>
												</Text>
											</View>

											{!!error && <Text style={styles.errorMsg}>{error}</Text>}
										</View>

										<View style={styles.ctaWrapper}>
											<StyledButton
												type={'white'}
												onPress={this.onPressCreate}
												testID={'submit-button'}
												disabled={!canSubmit}
											>
												{strings('choose_password.create_button').toUpperCase()}
											</StyledButton>
										</View>
									</>
								)}
							</KeyboardAwareScrollView>
						</View>
					)}
				</SafeAreaView>
			</OnboardingScreenWithBg>
		);
	}
}

const mapStateToProps = state => ({
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	keyringController: state.engine.backgroundState.KeyringController
});

const mapDispatchToProps = dispatch => ({
	keycloakAuthSet: () => dispatch(keycloakAuthSet()),
	keycloakAuthUnset: () => dispatch(keycloakAuthUnset()),
	passwordSet: () => dispatch(passwordSet()),
	passwordUnset: () => dispatch(passwordUnset()),
	setLockTime: time => dispatch(setLockTime(time)),
	seedphraseNotBackedUp: () => dispatch(seedphraseNotBackedUp())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(ChoosePassword);
