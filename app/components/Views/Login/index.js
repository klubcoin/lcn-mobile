import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
	Switch,
	Alert,
	ActivityIndicator,
	Text,
	View,
	SafeAreaView,
	Image,
	InteractionManager,
	TouchableWithoutFeedback,
	Keyboard,
	Platform
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import Button from 'react-native-button';
import Engine from '../../../core/Engine';
import StyledButton from '../../UI/StyledButton';
import AnimatedFox from 'react-native-animated-fox';
import { colors, fontStyles } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import SecureKeychain from '../../../core/SecureKeychain';
import FadeOutOverlay from '../../UI/FadeOutOverlay';
import setOnboardingWizardStep from '../../../actions/wizard';
import { connect } from 'react-redux';
import Device from '../../../util/Device';
import { OutlinedTextField, FilledTextField } from 'react-native-material-textfield';
import BiometryButton from '../../UI/BiometryButton';
import { recreateVaultWithSamePassword } from '../../../core/Vault';
import preferences from '../../../../app/store/preferences';
import Logger from '../../../util/Logger';
import {
	BIOMETRY_CHOICE_DISABLED,
	ONBOARDING_WIZARD,
	METRICS_OPT_IN,
	ENCRYPTION_LIB,
	TRUE,
	ORIGINAL,
	EXISTING_USER
} from '../../../constants/storage';
import { keycloakAuthUnset } from '../../../actions/user';
import { passwordRequirementsMet } from '../../../util/password';
import ErrorBoundary from '../ErrorBoundary';
import WarningExistingUserModal from '../../UI/WarningExistingUserModal';
import Icon from 'react-native-vector-icons/FontAwesome';
import { trackErrorAsAnalytics } from '../../../util/analyticsV2';
import { tlc, toLowerCaseCompare } from '../../../util/general';
import LoginWithKeycloak from '../LoginWithKeycloak';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';
import { displayName } from '../../../../app.json';
import NetInfo from '@react-native-community/netinfo';
import { showError } from '../../../util/notify';
import { requestMultiple, PERMISSIONS } from 'react-native-permissions';

const isTextDelete = text => tlc(text) === 'delete';

const PASSCODE_NOT_SET_ERROR = strings('login.passcode_not_set_error');
const WRONG_PASSWORD_ERROR = strings('login.wrong_password_error');
const WRONG_PASSWORD_ERROR_ANDROID = strings('login.wrong_password_error_android');
const VAULT_ERROR = strings('login.vault_error');
const CLEAN_VAULT_ERROR = strings('login.clean_vault_error', { appName: displayName });

/**
 * View where returning users can authenticate
 */
class Login extends PureComponent {
	static propTypes = {
		/**
		 * The navigator object
		 */
		navigation: PropTypes.object,
		/**
		 * Action to set onboarding wizard step
		 */
		setOnboardingWizardStep: PropTypes.func,
		/**
		 * Boolean flag that determines if password has been set
		 */
		passwordSet: PropTypes.bool,
		/**
		 * Boolean flag that determines if keycloak authentication has been set
		 */
		keycloakAuth: PropTypes.bool,
		/**
		 * A string representing the selected address => account
		 */
		selectedAddress: PropTypes.string
	};

	state = {
		password: '',
		email: '',
		biometryType: null,
		rememberMe: false,
		biometryChoice: false,
		loading: false,
		error: null,
		biometryPreviouslyDisabled: false,
		warningModalVisible: false,
		deleteModalVisible: false,
		disableDelete: true,
		deleteText: '',
		showDeleteWarning: false,
		internetConnect: true
	};

	mounted = true;

	fieldRef = React.createRef();
	emailFieldRef = React.createRef();

	async componentDidMount() {
		const unsubscribe = NetInfo.addEventListener(state => {
			this.setState({
				internetConnect: state.isConnected
			});
		});
		if (this.props.navigation.state?.params?.isFromBackground) {
			const { email } = preferences?.onboardProfile ?? {};
			this.setState({ email: email });
			this.emailFieldRef.current.setValue(email);
		}
		if (!this.props.passwordSet && !this.props.keycloakAuth) {
			try {
				const { KeyringController } = Engine.context;
				await KeyringController.submitPassword('');
				await SecureKeychain.resetGenericPassword();
				this.props.navigation.navigate('HomeNav');
			} catch (e) {
				//
			}
		} else {
			const biometryType = await SecureKeychain.getSupportedBiometryType();
			if (biometryType) {
				let enabled = true;
				const previouslyDisabled = await AsyncStorage.getItem(BIOMETRY_CHOICE_DISABLED);
				if (previouslyDisabled && previouslyDisabled === TRUE) {
					enabled = false;
				}

				this.setState({
					biometryType: Device.isAndroid() ? 'biometrics' : biometryType,
					biometryChoice: enabled,
					biometryPreviouslyDisabled: !!previouslyDisabled
				});

				try {
					if (enabled && !previouslyDisabled) {
						// const hasCredentials = await this.tryBiometric();
						this.setState({ hasCredentials: true });
					}
				} catch (e) {
					console.warn(e);
				}
			}
		}
	}

	componentWillUnmount() {
		this.mounted = false;
	}

	onLogin = async ({ hasCredentials = false }) => {
		if (!this.state.internetConnect) {
			showError(strings('import_from_seed.network_error'), strings('import_from_seed.no_connection'));
			return;
		}
		const onboardEmail = preferences.onboardProfile.email;
		const { password, email } = this.state;

		const isEmailValid = email.trim().toLowerCase() === onboardEmail;
		if (!isEmailValid) {
			this.setState({ error: strings('login.invalid_email_or_password') });
			return;
		}

		const locked = !passwordRequirementsMet(password);
		if (locked) this.setState({ error: strings('login.invalid_email_or_password') });
		if (this.state.loading || locked) return;
		this.handleLogin(password, hasCredentials);
	};

	requestBiometricIOS() {
		if (Platform.OS === 'ios') {
			requestMultiple([PERMISSIONS.IOS.FACE_ID]);
		}
	}

	handleLogin = async (password, hasCredentials) => {
		try {
			this.setState({ loading: true, error: null });
			const { KeyringController } = Engine.context;

			// Restore vault with user entered password
			await KeyringController.submitPassword(password);
			const encryptionLib = await AsyncStorage.getItem(ENCRYPTION_LIB);
			const existingUser = await AsyncStorage.getItem(EXISTING_USER);
			if (encryptionLib !== ORIGINAL && existingUser) {
				await recreateVaultWithSamePassword(password, this.props.selectedAddress);
				await AsyncStorage.setItem(ENCRYPTION_LIB, ORIGINAL);
			}
			if (!hasCredentials) {
				if (this.state.rememberMe) {
					await SecureKeychain.setGenericPassword(password, SecureKeychain.TYPES.REMEMBER_ME, true);
					this.requestBiometricIOS();
				} else if (this.state.biometryChoice && this.state.biometryType) {
					await SecureKeychain.setGenericPassword(password, SecureKeychain.TYPES.BIOMETRICS, true);
					this.requestBiometricIOS();
				} else {
					await SecureKeychain.resetGenericPassword();
				}
			}

			// Get onboarding wizard state
			const onboardingWizard = await AsyncStorage.getItem(ONBOARDING_WIZARD);
			// Check if user passed through metrics opt-in screen
			const metricsOptIn = await AsyncStorage.getItem(METRICS_OPT_IN);
			if (!metricsOptIn) {
				this.props.navigation.navigate('OptinMetrics');
			} else if (onboardingWizard) {
				this.props.navigation.navigate('HomeNav');
			} else {
				this.props.setOnboardingWizardStep(1);
				this.props.navigation.navigate('HomeNav');
			}
			this.setState({ loading: false });
		} catch (e) {
			// Should we force people to enable passcode / biometrics?
			const error = e.toString();
			if (
				toLowerCaseCompare(error, WRONG_PASSWORD_ERROR) ||
				toLowerCaseCompare(error, WRONG_PASSWORD_ERROR_ANDROID)
			) {
				this.setState({ loading: false, error: strings('login.invalid_email_or_password') });

				trackErrorAsAnalytics('Login: Invalid Password', error);

				return;
			} else if (error === PASSCODE_NOT_SET_ERROR) {
				Alert.alert(
					'Security Alert',
					'In order to proceed, you need to turn Passcode on or any biometrics authentication method supported in your device (FaceID, TouchID or Fingerprint)'
				);
				this.setState({ loading: false });
			} else if (toLowerCaseCompare(error, VAULT_ERROR)) {
				this.setState({
					loading: false,
					error: CLEAN_VAULT_ERROR
				});
			} else {
				this.setState({ loading: false, error });
			}
			Logger.error(error, 'Failed to login');
		}
	};

	delete = async () => {
		const { KeyringController } = Engine.context;
		try {
			await Engine.resetState();
			await KeyringController.createNewVaultAndKeychain(`${Date.now()}`);
			await KeyringController.setLocked();
			this.deleteExistingUser();
		} catch (error) {
			Logger.log(error, `Failed to createNewVaultAndKeychain: ${error}`);
		}
	};

	deleteExistingUser = async () => {
		try {
			this.props.keycloakAuthUnset();
			preferences.setOnboardProfile(null);
			await AsyncStorage.removeItem(EXISTING_USER);
			this.props.navigation.navigate('Onboarding', { delete: true });
		} catch (error) {
			Logger.log(error, `Failed to remove key: ${EXISTING_USER} from AsyncStorage`);
		}
	};

	toggleWarningModal = () => this.setState(state => ({ warningModalVisible: !state.warningModalVisible }));

	toggleDeleteModal = () => this.setState(state => ({ deleteModalVisible: !state.deleteModalVisible }));

	checkDelete = text => {
		this.setState({
			deleteText: text,
			showDeleteWarning: false,
			disableDelete: !isTextDelete(text)
		});
	};

	submitDelete = () => {
		const { deleteText } = this.state;
		this.setState({ showDeleteWarning: !isTextDelete(deleteText) });
		if (isTextDelete(deleteText)) this.delete();
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
							onValueChange={biometryChoice => this.updateBiometryChoice(biometryChoice)} // eslint-disable-line react/jsx-no-bind
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

	setPassword = val => this.setState({ password: val });

	setEmail = val => this.setState({ email: val });

	onCancelPress = () => {
		this.toggleWarningModal();
		InteractionManager.runAfterInteractions(this.toggleDeleteModal);
	};

	tryBiometric = async e => {
		if (e) e.preventDefault();
		const { current: field } = this.fieldRef;
		const { current: emailField } = this.emailFieldRef;
		field.blur();
		emailField.blur();
		const { hasCredentials, rememberMe } = this.state;
		try {
			const credentials = await SecureKeychain.getGenericPassword();
			if (!this.state.internetConnect) {
				showError(strings('import_from_seed.network_error'), strings('import_from_seed.no_connection'));
				return true;
			}
			if (!credentials) return false;
			field.blur();
			emailField.blur();
			this.setState({ password: credentials.password, email: preferences?.onboardProfile?.email });
			field.setValue(credentials.password);
			emailField.setValue(preferences?.onboardProfile?.email);
			field.blur();
			emailField.blur();
			this.onLogin({ hasCredentials: hasCredentials && !rememberMe });
		} catch (error) {
			Logger.log(error);
		}
		field.blur();
		return true;
	};

	onKeycloakResult = async error => {
		if (!error) {
			const hash = await preferences.getKeycloakHash();
			this.handleLogin(hash);
		} else {
			this.setState({ loading: false, error: error.toString() });
		}
	};

	render = () => (
		<ErrorBoundary view="Login">
			<WarningExistingUserModal
				warningModalVisible={this.state.warningModalVisible}
				cancelText={strings('login.i_understand').toUpperCase()}
				onCancelPress={this.onCancelPress}
				onRequestClose={this.toggleWarningModal}
				onConfirmPress={this.toggleWarningModal}
			>
				<View style={styles.areYouSure}>
					<Icon style={styles.warningIcon} size={46} color={colors.red} name="exclamation-triangle" />
					<Text style={[styles.heading, styles.red]}>{strings('login.are_you_sure')}</Text>
					<Text style={styles.warningText}>
						<Text>{strings('login.your_current_wallet')}</Text>
						<Text style={styles.bold}>{strings('login.removed_from')}</Text>
						<Text>{strings('login.this_action')}</Text>
					</Text>
					<Text style={[styles.warningText, styles.noMarginBottom]}>
						<Text>{strings('login.you_can_only')}</Text>
						<Text style={styles.bold}>{strings('login.recovery_phrase')}</Text>
						<Text>{strings('login.metamask_does_not', { appName: displayName })}</Text>
					</Text>
				</View>
			</WarningExistingUserModal>

			<WarningExistingUserModal
				warningModalVisible={this.state.deleteModalVisible}
				cancelText={strings('login.delete_my').toUpperCase()}
				cancelButtonDisabled={this.state.disableDelete}
				onCancelPress={this.submitDelete}
				onRequestClose={this.toggleDeleteModal}
				onConfirmPress={this.toggleDeleteModal}
				onSubmitEditing={this.submitDelete}
			>
				<TouchableWithoutFeedback onPress={Keyboard.dismiss}>
					<View style={styles.areYouSure}>
						<Text style={[styles.heading, styles.delete]}>{strings('login.type_delete')}</Text>
						<FilledTextField
							containerStyle={[styles.inputContainer, styles.deleteContainer]}
							inputContainerStyle={[styles.inputContainerStyle, styles.deleteContainer]}
							style={[styles.input, styles.inputDelete]}
							autoFocus
							returnKeyType={'done'}
							onChangeText={this.checkDelete}
							placeholder={strings('login.type_here') + '...'}
							autoCapitalize="none"
							value={this.state.deleteText}
							baseColor={colors.transparent}
							tintColor={colors.black}
							onSubmitEditing={this.submitDelete}
							lineWidth={0}
							activeLineWidth={0}
						/>
						{this.state.showDeleteWarning && (
							<Text style={styles.deleteWarningMsg}>{strings('login.cant_proceed')}</Text>
						)}
					</View>
				</TouchableWithoutFeedback>
			</WarningExistingUserModal>

			<OnboardingScreenWithBg screen={'a'}>
				<SafeAreaView style={styles.mainWrapper}>
					<KeyboardAwareScrollView style={styles.wrapper} resetScrollToCoords={{ x: 0, y: 0 }}>
						<View testID={'login'}>
							<View style={styles.foxWrapper}>
								<Image
									source={require('../../../images/klubcoin_vertical_logo.png')}
									style={styles.image}
									resizeMethod={'auto'}
									resizeMode={'contain'}
								/>
							</View>
							{/* <Text style={styles.title}>{strings('login.title')}</Text> */}
							{this.props.keycloakAuth ? (
								<LoginWithKeycloak
									type={'sign'}
									label={strings('login.login_liquichain_with_keycloak', { appName: displayName })}
									onSuccess={this.onKeycloakResult}
									onError={this.onKeycloakResult}
								/>
							) : (
								<>
									<View style={styles.field}>
										<Text style={styles.label}>{strings('login.email')}</Text>
										<OutlinedTextField
											style={styles.input}
											inputContainerStyle={styles.inputContainer}
											placeholder={strings('login.type_here') + '...'}
											placeholderTextColor={'white'}
											testID={'login-password-input'}
											returnKeyType={'done'}
											autoCapitalize="none"
											ref={this.emailFieldRef}
											keyboardType={'email-address'}
											onChangeText={this.setEmail}
											value={this.state.email}
											baseColor={colors.transparent}
											tintColor={colors.blue}
											onSubmitEditing={this.onLogin}
											lineWidth={0}
											activeLineWidth={0}
											renderRightAccessory={() => (
												<BiometryButton
													onPress={this.tryBiometric}
													hidden={
														!(
															this.state.biometryChoice &&
															this.state.biometryType &&
															this.state.hasCredentials
														)
													}
													type={this.state.biometryType}
												/>
											)}
										/>
									</View>
									<View style={styles.field}>
										<Text style={styles.label}>{strings('login.password')}</Text>
										<OutlinedTextField
											style={styles.input}
											inputContainerStyle={styles.inputContainer}
											placeholder={strings('login.password')}
											placeholderTextColor={'white'}
											testID={'login-password-input'}
											returnKeyType={'done'}
											autoCapitalize="none"
											secureTextEntry
											ref={this.fieldRef}
											onChangeText={this.setPassword}
											value={this.state.password}
											baseColor={colors.transparent}
											tintColor={colors.blue}
											onSubmitEditing={this.onLogin}
											lineWidth={0}
											activeLineWidth={0}
											renderRightAccessory={() => (
												<BiometryButton
													onPress={this.tryBiometric}
													hidden={
														!(
															this.state.biometryChoice &&
															this.state.biometryType &&
															this.state.hasCredentials
														)
													}
													type={this.state.biometryType}
												/>
											)}
										/>
									</View>

									{this.renderSwitch()}

									{!!this.state.error && (
										<Text style={styles.errorMsg} testID={'invalid-password-error'}>
											{this.state.error}
										</Text>
									)}

									<View style={styles.ctaWrapper} testID={'log-in-button'}>
										<StyledButton type={'normal-padding'} onPress={this.onLogin}>
											{this.state.loading ? (
												<ActivityIndicator size="small" color="white" />
											) : (
												strings('login.login_button')
											)}
										</StyledButton>
									</View>
								</>
							)}

							<View style={styles.footer}>
								<Text style={styles.cant}>{strings('login.go_back')}</Text>
								<Button style={styles.goBack} onPress={this.toggleWarningModal}>
									{strings('login.reset_wallet')}
								</Button>
							</View>
						</View>
					</KeyboardAwareScrollView>
					<FadeOutOverlay />
				</SafeAreaView>
			</OnboardingScreenWithBg>
		</ErrorBoundary>
	);
}

const mapStateToProps = state => ({
	keycloakAuth: state.user.keycloakAuth,
	passwordSet: state.user.passwordSet,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress
});

const mapDispatchToProps = dispatch => ({
	setOnboardingWizardStep: step => dispatch(setOnboardingWizardStep(step)),
	keycloakAuthUnset: () => dispatch(keycloakAuthUnset())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Login);
