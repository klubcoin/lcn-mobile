import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Switch, ActivityIndicator, Alert, Text, View, TextInput, SafeAreaView, StyleSheet, Image } from 'react-native';
import CheckBox from '@react-native-community/checkbox';
import AnimatedFox from 'react-native-animated-fox';
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
import { colors, fontStyles } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import { getOnboardingNavbarOptions } from '../../UI/Navbar';
import SecureKeychain from '../../../core/SecureKeychain';
import Icon from 'react-native-vector-icons/FontAwesome';
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
import { getPasswordStrengthWord, passwordRequirementsMet, MIN_PASSWORD_LENGTH } from '../../../util/password';
import API from 'services/api';
import Routes from 'common/routes';
import * as sha3JS from 'js-sha3';

import { CHOOSE_PASSWORD_STEPS } from '../../../constants/onboarding';
import LoginWithKeycloak from '../LoginWithKeycloak';

import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';
import { displayName } from '../../../../app.json';

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
		secureTextEntry: true,
		biometryType: null,
		biometryChoice: false,
		rememberMe: false,
		loading: false,
		error: null,
		usePasswordAuth: false,
		inputWidth: { width: '99%' }
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
		const { avatar, firstname, lastname } = preferences.onboardProfile;
		const name = `${firstname} ${lastname}`;
		const avatarb64 = await RNFS.readFile(avatar, 'base64');
		const hash = sha3JS.keccak_256(firstname + lastname + selectedAddress + avatarb64);

		API.postRequest(
			Routes.walletCreation,
			[name, selectedAddress, hash],
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
			if (this.state.biometryType && this.state.biometryChoice) {
				await SecureKeychain.setGenericPassword(password, SecureKeychain.TYPES.BIOMETRICS);
			} else if (this.state.rememberMe) {
				await SecureKeychain.setGenericPassword(password, SecureKeychain.TYPES.REMEMBER_ME);
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
								trackColor={Device.isIos() ? { true: colors.green300, false: colors.grey300 } : null}
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
							trackColor={Device.isIos() ? { true: colors.green300, false: colors.grey300 } : null}
							ios_backgroundColor={colors.grey300}
						/>
					</>
				)}
			</View>
		);
	};

	onPasswordChange = val => {
		const passInfo = zxcvbn(val);

		this.setState({ password: val, passwordStrength: passInfo.score });
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

	render() {
		const {
			isSelected,
			inputWidth,
			password,
			passwordStrength,
			confirmPassword,
			secureTextEntry,
			error,
			loading,
			usePasswordAuth
		} = this.state;
		const passwordsMatch = password !== '' && password === confirmPassword;
		const canSubmit = passwordsMatch && isSelected;
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
								<LoginWithKeycloak
									label={strings('choose_password.setup_liquichain_account', {
										appName: displayName
									})}
									onSuccess={this.onKeycloakResult}
									onError={this.onKeycloakResult}
								/>
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
												<Text style={styles.hintLabel}>
													{strings('choose_password.password')}
												</Text>
												<Text onPress={this.toggleShowHide} style={styles.hintLabel}>
													{strings(`choose_password.${secureTextEntry ? 'show' : 'hide'}`)}
												</Text>
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
												/>
												{(password !== '' && (
													<Text style={styles.passwordStrengthLabel}>
														{strings('choose_password.password_strength')}
														<Text style={styles[`strength_${passwordStrengthWord}`]}>
															{' '}
															{strings(
																`choose_password.strength_${passwordStrengthWord}`
															)}
														</Text>
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
												<Text style={styles.passwordStrengthLabel}>
													{strings('choose_password.must_be_at_least', {
														number: MIN_PASSWORD_LENGTH
													})}
												</Text>
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
												type={'blue'}
												onPress={this.onPressCreate}
												testID={'submit-button'}
												disabled={!canSubmit}
											>
												{strings('choose_password.create_button')}
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
