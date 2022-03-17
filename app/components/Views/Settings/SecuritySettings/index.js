import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import {
	Alert,
	Switch,
	Text,
	ScrollView,
	View,
	ActivityIndicator,
	TouchableOpacity,
	Keyboard,
	DeviceEventEmitter
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import { connect } from 'react-redux';
import * as RNFS from 'react-native-fs';
import ActionModal from '../../../UI/ActionModal';
import SecureKeychain from '../../../../core/SecureKeychain';
import SelectComponent from '../../../UI/SelectComponent';
import StyledButton from '../../../UI/StyledButton';
import SettingsNotification from '../../../UI/SettingsNotification';
import { clearHistory } from '../../../../actions/browser';
import { clearHosts, setPrivacyMode, setThirdPartyApiMode } from '../../../../actions/privacy';
import { colors } from '../../../../styles/common';
import Logger from '../../../../util/Logger';
import Device from '../../../../util/Device';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { setLockTime } from '../../../../actions/settings';
import { strings } from '../../../../../locales/i18n';
import Analytics from '../../../../core/Analytics';
import { passwordSet } from '../../../../actions/user';
import Engine from '../../../../core/Engine';
import AppConstants from '../../../../core/AppConstants';
import {
	EXISTING_USER,
	BIOMETRY_CHOICE,
	PASSCODE_CHOICE,
	TRUE,
	PASSCODE_DISABLED,
	BIOMETRY_CHOICE_DISABLED,
	SEED_PHRASE_HINTS,
	BACKUP,
	BACKUP_TYPE
} from '../../../../constants/storage';

import CookieManager from '@react-native-community/cookies';
import Icon from 'react-native-vector-icons/FontAwesome';
import HintModal from '../../../UI/HintModal';
import { trackErrorAsAnalytics } from '../../../../util/analyticsV2';
import SeedPhraseVideo from '../../../UI/SeedPhraseVideo';
import preferences from '../../../../store/preferences';
import { ReadFile } from '../../FilesManager/store/FileStore';
import FileTransferWebRTC from '../../FilesManager/store/FileTransferWebRTC';
import { refWebRTC } from '../../../../services/WebRTC';
import { displayName } from '../../../../../app.json';
import styles from './styles/index';
import OnboardingScreenWithBg from '../../../UI/OnboardingScreenWithBg';

const isIos = Device.isIos();

const Heading = ({ children, first }) => (
	<View style={[styles.setting, first && styles.firstSetting]}>
		<Text style={[styles.title, styles.heading]}>{children}</Text>
	</View>
);

const WarningIcon = () => <Icon size={16} color={colors.red} name="exclamation-triangle" />;

Heading.propTypes = {
	children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]),
	first: PropTypes.bool
};

/**
 * Main view for app configurations
 */
class Settings extends PureComponent {
	static propTypes = {
		/**
		 * Indicates whether privacy mode is enabled
		 */
		privacyMode: PropTypes.bool,
		/**
		 * Called to toggle privacy mode
		 */
		setPrivacyMode: PropTypes.func,
		/**`
		 * Called to toggle set party api mode
		 */
		setThirdPartyApiMode: PropTypes.func,
		/**
		 * Indicates whether third party API mode is enabled
		 */
		thirdPartyApiMode: PropTypes.bool,
		/**
		 * Called to set the passwordSet flag
		 */
		passwordSet: PropTypes.func,
		/**
		/* navigation object required to push new views
		*/
		navigation: PropTypes.object,
		/**
		 * Map of hostnames with approved account access
		 */
		approvedHosts: PropTypes.object,
		/**
		 * Called to clear all hostnames with account access
		 */
		clearHosts: PropTypes.func,
		/**
		 * Array of visited websites
		 */
		browserHistory: PropTypes.array,
		/**
		 * Called to clear the list of visited urls
		 */
		clearBrowserHistory: PropTypes.func,
		/**
		 * Called to set the active search engine
		 */
		setLockTime: PropTypes.func,
		/**
		 * Active search engine
		 */
		lockTime: PropTypes.number,
		/**
		 * Selected address as string
		 */
		selectedAddress: PropTypes.string,
		/**
		 * List of accounts from the AccountTrackerController
		 */
		accounts: PropTypes.object,
		/**
		 * List of accounts from the PreferencesController
		 */
		identities: PropTypes.object,
		/**
		 * redux flag that indicates if the user
		 * completed the seed phrase backup flow
		 */
		seedphraseBackedUp: PropTypes.bool
	};

	static navigationOptions = ({ navigation }) =>
		getNavigationOptionsTitle(strings('app_settings.security_title'), navigation);

	state = {
		approvalModalVisible: false,
		biometryChoice: null,
		biometryType: false,
		browserHistoryModalVisible: false,
		cookiesModalVisible: false,
		metricsOptIn: false,
		passcodeChoice: false,
		showHint: false,
		hintText: '',
		loading: false,
		emailVerified: preferences?.onboardProfile?.emailVerified
	};

	autolockOptions = [
		{
			value: '0',
			label: strings('app_settings.autolock_immediately'),
			key: '0'
		},
		{
			value: '5000',
			label: strings('app_settings.autolock_after', { time: 5 }),
			key: '5000'
		},
		{
			value: '15000',
			label: strings('app_settings.autolock_after', { time: 15 }),
			key: '15000'
		},
		{
			value: '30000',
			label: strings('app_settings.autolock_after', { time: 30 }),
			key: '30000'
		},
		{
			value: '60000',
			label: strings('app_settings.autolock_after', { time: 60 }),
			key: '60000'
		},
		{
			value: '300000',
			label: strings('app_settings.autolock_after_minutes', { time: 5 }),
			key: '300000'
		},
		{
			value: '600000',
			label: strings('app_settings.autolock_after_minutes', { time: 10 }),
			key: '600000'
		},
		{
			value: '-1',
			label: strings('app_settings.autolock_never'),
			key: '-1'
		}
	];

	componentWillUnmount() {
		this.focusListener.remove();
	}

	componentDidUpdate(prevProps) {
		if (prevProps.isFocused !== this.props.isFocused) {
			// Use the `this.props.isFocused` boolean
			// Call any action
		}
	}

	componentDidMount = async () => {
		const unsubscribe = this.props.navigation.addListener('didFocus', () => {});

		const { navigation } = this.props;
		this.focusListener = navigation.addListener('didFocus', () => {
			this.setState({
				loading: false,
				emailVerified: preferences?.onboardProfile?.emailVerified
			});
		});
		const biometryType = await SecureKeychain.getSupportedBiometryType();
		const metricsOptIn = Analytics.getEnabled();

		const currentSeedphraseHints = await AsyncStorage.getItem(SEED_PHRASE_HINTS);
		const parsedHints = currentSeedphraseHints && JSON.parse(currentSeedphraseHints);
		const manualBackup = parsedHints?.manualBackup;

		if (biometryType) {
			let passcodeEnabled = false;
			const biometryChoice = await AsyncStorage.getItem(BIOMETRY_CHOICE);
			if (!biometryChoice) {
				const passcodeChoice = await AsyncStorage.getItem(PASSCODE_CHOICE);
				if (passcodeChoice !== '' && passcodeChoice === TRUE) {
					passcodeEnabled = true;
				}
			}
			this.setState({
				biometryType: biometryType && Device.isAndroid() ? 'biometrics' : biometryType,
				biometryChoice: !!biometryChoice,
				metricsOptIn,
				passcodeChoice: passcodeEnabled,
				hintText: manualBackup
			});
		} else {
			this.setState({
				metricsOptIn,
				hintText: manualBackup
			});
		}
		return unsubscribe;
	};

	onSingInWithBiometrics = async enabled => {
		this.setState({ loading: true }, async () => {
			let credentials;
			try {
				credentials = await SecureKeychain.getGenericPassword();
			} catch (error) {
				Logger.error(error);
			}
			if (credentials && credentials.password !== '') {
				this.storeCredentials(credentials.password, enabled, 'biometryChoice');
			} else {
				this.props.navigation.navigate('EnterPasswordSimple', {
					onPasswordSet: password => {
						this.storeCredentials(password, enabled, 'biometryChoice');
					}
				});
			}
		});
	};

	onSignInWithPasscode = async enabled => {
		this.setState({ loading: true }, async () => {
			let credentials;
			try {
				credentials = await SecureKeychain.getGenericPassword();
			} catch (error) {
				Logger.error(error);
			}

			if (credentials && credentials.password !== '') {
				this.storeCredentials(credentials.password, enabled, 'passcodeChoice');
			} else {
				this.props.navigation.navigate('EnterPasswordSimple', {
					onPasswordSet: password => {
						this.storeCredentials(password, enabled, 'passcodeChoice');
					}
				});
			}
		});
	};

	storeCredentials = async (password, enabled, type) => {
		try {
			await SecureKeychain.resetGenericPassword();

			await Engine.context.KeyringController.exportSeedPhrase(password);

			await AsyncStorage.setItem(EXISTING_USER, TRUE);

			if (!enabled) {
				this.setState({ [type]: false, loading: false });
				if (type === 'passcodeChoice') {
					await AsyncStorage.setItem(PASSCODE_DISABLED, TRUE);
				} else if (type === 'biometryChoice') {
					await AsyncStorage.setItem(BIOMETRY_CHOICE_DISABLED, TRUE);
				}

				return;
			}

			if (type === 'passcodeChoice')
				await SecureKeychain.setGenericPassword(password, SecureKeychain.TYPES.PASSCODE);
			else if (type === 'biometryChoice')
				await SecureKeychain.setGenericPassword(password, SecureKeychain.TYPES.BIOMETRICS);

			this.props.passwordSet();

			if (this.props.lockTime === -1) {
				this.props.setLockTime(AppConstants.DEFAULT_LOCK_TIMEOUT);
			}

			this.setState({ [type]: true, loading: false });
		} catch (e) {
			if (e.message === 'Invalid password') {
				Alert.alert(strings('app_settings.invalid_password'), strings('app_settings.invalid_password_message'));
				trackErrorAsAnalytics('SecuritySettings: Invalid password', e?.message);
			} else {
				Logger.error(e, 'SecuritySettings:biometrics');
			}
			this.setState({ [type]: !enabled, loading: false });
		}
	};

	toggleClearApprovalsModal = () => {
		this.setState({ approvalModalVisible: !this.state.approvalModalVisible });
	};

	toggleClearBrowserHistoryModal = () => {
		this.setState({ browserHistoryModalVisible: !this.state.browserHistoryModalVisible });
	};

	toggleClearCookiesModal = () => {
		this.setState({ cookiesModalVisible: !this.state.cookiesModalVisible });
	};

	clearApprovals = () => {
		this.props.clearHosts();
		this.toggleClearApprovalsModal();
	};

	clearBrowserHistory = () => {
		this.props.clearBrowserHistory();
		this.toggleClearBrowserHistoryModal();
	};

	clearCookies = () => {
		CookieManager.clearAll().then(() => {
			Logger.log('Browser cookies cleared');
			this.toggleClearCookiesModal();
		});
	};

	togglePrivacy = value => {
		this.props.setPrivacyMode(value);
	};

	toggleThirdPartyAPI = value => {
		this.props.setThirdPartyApiMode(value);
	};

	toggleMetricsOptIn = async value => {
		if (value) {
			Analytics.enable();
			this.setState({ metricsOptIn: true });
		} else {
			Analytics.disable();
			this.setState({ metricsOptIn: false });
			Alert.alert(
				strings('app_settings.metametrics_opt_out'),
				strings('app_settings.metrametrics_restart_required')
			);
		}
	};

	goToRevealPrivateCredential = () => {
		this.props.navigation.navigate('RevealPrivateCredentialView', { privateCredentialName: 'seed_phrase' });
	};

	goToExportPrivateKey = () => {
		this.props.navigation.navigate('RevealPrivateCredentialView', { privateCredentialName: 'private_key' });
	};

	selectLockTime = lockTime => {
		this.props.setLockTime(parseInt(lockTime, 10));
	};

	manualBackup = async () => {
		await AsyncStorage.setItem(BACKUP, BACKUP_TYPE.SETTING);
		this.props.navigation.navigate('ManualBackupStep1');
	};

	resetPassword = () => {
		this.props.navigation.navigate('ResetPassword');
	};

	verifyEmail = () => {
		this.props.navigation.navigate('VerifyOTP', { email: preferences.onboardProfile?.email });
	};

	changeEmail = () => {
		this.props.navigation.navigate('ChangeEmail');
	};

	saveHint = async () => {
		const { hintText } = this.state;
		if (!hintText) return;
		this.toggleHint();
		const currentSeedphraseHints = await AsyncStorage.getItem(SEED_PHRASE_HINTS);
		const parsedHints = JSON.parse(currentSeedphraseHints);
		await AsyncStorage.setItem(SEED_PHRASE_HINTS, JSON.stringify({ ...parsedHints, manualBackup: hintText }));
	};

	toggleHint = () => {
		this.setState(state => ({ showHint: !state.showHint }));
	};

	handleChangeText = text => this.setState({ hintText: text });

	renderHint = () => {
		const { showHint, hintText } = this.state;
		return (
			<HintModal
				onConfirm={this.saveHint}
				onCancel={this.toggleHint}
				modalVisible={showHint}
				onRequestClose={Keyboard.dismiss}
				value={hintText}
				onChangeText={this.handleChangeText}
			/>
		);
	};

	backupPrivateKey = () => {
		this.props.navigation.navigate('Contacts', {
			contactSelection: true,
			onConfirm: this.sendPrivateKeyBackup
		});
	};

	async getPrivateKey() {
		const { selectedAddress } = this.props;
		const { KeyringController } = Engine.context;

		const password = await preferences.getKeycloakHash();
		return await KeyringController.exportAccount(password, selectedAddress);
	}

	sendPrivateKeyBackup = async contacts => {
		if (contacts.length < 2) {
			alert(strings('private_key.must_select_at_least_2_contacts'));
			return;
		}

		const webrtc = refWebRTC();
		const { selectedAddress, identities, navigation } = this.props;
		const account = identities[selectedAddress];
		const lookupName = `${account.name?.name || account?.name} private key`;

		const privateKey = await this.getPrivateKey();
		const addresses = contacts.map(e => e.address);

		FileTransferWebRTC.sendAsParts(privateKey, lookupName, selectedAddress, addresses, webrtc);
		const statsEvent = DeviceEventEmitter.addListener('FileTransStat', stats => {
			const { completed, name, error } = stats;
			if (name != lookupName) return;

			if (completed) {
				alert('Sent backup successfully');
				statsEvent.remove();
				this.setState({ privateKeyBackupStats: null });
			} else if (error) {
				const { peer, partCount, currentPart } = stats;

				alert(`Error: Failed to send ${currentPart}/${partCount} to ${peer}`);
				statsEvent.remove();
				this.setState({ privateKeyBackupStats: null });
			} else {
				this.setState({ privateKeyBackupStats: stats });
			}
		});
	};

	recoverPrivateKey = () => {
		const { selectedAddress, addressBook, network, identities } = this.props;
		const addresses = addressBook[network] || {};
		const account = identities[selectedAddress];
		const lookupName = `${account.name?.name || account?.name} private key`;

		const from = selectedAddress;
		const contacts = Object.keys(addresses).map(addr => addresses[addr]);

		const webrtc = refWebRTC();
		const command = ReadFile(from, null, null, lookupName);
		FileTransferWebRTC.readFile(command, contacts.map(e => e.address), webrtc);
		DeviceEventEmitter.once('FileTransFetched', async ({ path }) => {
			const content = await RNFS.readFile(path, 'utf8');
			alert('Restored private key: ' + content);
		});
	};

	render = () => {
		const { approvedHosts, seedphraseBackedUp, browserHistory, privacyMode, thirdPartyApiMode } = this.props;
		const {
			approvalModalVisible,
			biometryType,
			browserHistoryModalVisible,
			cookiesModalVisible,
			metricsOptIn,
			loading,
			hintText,
			privateKeyBackupStats,
			emailVerified
		} = this.state;
		const { accounts, identities, selectedAddress } = this.props;
		const account = { address: selectedAddress, ...identities[selectedAddress], ...accounts[selectedAddress] };

		if (loading)
			return (
				<View style={styles.loader}>
					<ActivityIndicator size="large" color={'#ffffff'} />
				</View>
			);

		return (
			<OnboardingScreenWithBg screen="a">
				<ScrollView
					style={styles.wrapper}
					contentContainerStyle={styles.wrapperContainer}
					testID={'security-settings-scrollview'}
				>
					<View style={styles.inner}>
						<Heading first>{strings('app_settings.security_heading')}</Heading>
						<View style={[styles.setting, styles.firstSetting]}>
							<Text style={styles.title}>
								{!seedphraseBackedUp ? (
									<>
										<WarningIcon />{' '}
									</>
								) : null}
								<Text style={styles.title}>{strings('app_settings.protect_your_wallet')}</Text>
							</Text>
							{/* <SeedPhraseVideo style={styles.seedPhraseVideo} /> */}
							<Text style={styles.desc}>{strings('app_settings.protect_desc')}</Text>
							<SettingsNotification isWarning={!seedphraseBackedUp}>
								<Text
									style={[
										styles.warningText,
										seedphraseBackedUp ? styles.warningTextGreen : styles.warningTextRed,
										styles.marginLeft
									]}
								>
									{strings(
										seedphraseBackedUp
											? 'app_settings.seedphrase_backed_up'
											: 'app_settings.seedphrase_not_backed_up'
									)}
								</Text>
								{hintText && seedphraseBackedUp ? (
									<TouchableOpacity style={styles.viewHint} onPress={this.toggleHint}>
										<Text style={[styles.warningText, styles.warningBold]}>
											{strings('app_settings.view_hint')}
										</Text>
									</TouchableOpacity>
								) : null}
							</SettingsNotification>
							{!seedphraseBackedUp ? (
								<StyledButton type="white" onPress={this.manualBackup} containerStyle={styles.confirm}>
									{strings('app_settings.back_up_now')}
								</StyledButton>
							) : (
								<View style={styles.protect}>
									<StyledButton
										type="normal"
										onPress={this.manualBackup}
										containerStyle={[styles.confirm, styles.col]}
									>
										{strings('app_settings.back_up_again')}
									</StyledButton>
									<StyledButton
										type="warning"
										onPress={this.goToRevealPrivateCredential}
										containerStyle={[styles.confirm, styles.col]}
										testID={'reveal-seed-button'}
									>
										{strings('reveal_credential.seed_phrase_title')}
									</StyledButton>
								</View>
							)}
						</View>
						<View style={styles.setting} testID={'verify-email-section'}>
							<Text style={styles.title}>{strings('verify_email.title')}</Text>
							<Text style={styles.desc}>{strings('verify_email.desc')}</Text>
							<View style={styles.protect}>
								{emailVerified ? (
									<StyledButton
										type={'disable'}
										containerStyle={[styles.verifyEmailButton, styles.confirm, styles.col]}
										disable={true}
									>
										{strings('verify_email.verified')}
									</StyledButton>
								) : (
									<StyledButton
										type={'warning'}
										onPress={this.verifyEmail}
										containerStyle={[styles.verifyEmailButton, styles.confirm, styles.col]}
									>
										{strings('verify_email.verify_your_email')}
									</StyledButton>
								)}
								<StyledButton
									type={'normal'}
									onPress={this.changeEmail}
									containerStyle={[styles.verifyEmailButton, styles.confirm, styles.col]}
								>
									{strings('verify_email.change_email')}
								</StyledButton>
							</View>
						</View>
						<View style={styles.setting} testID={'change-password-section'}>
							<Text style={styles.title}>{strings('password_reset.password_title')}</Text>
							<Text style={styles.desc}>
								{strings('password_reset.password_desc', { appName: displayName })}
							</Text>
							<StyledButton type="normal" onPress={this.resetPassword} containerStyle={styles.confirm}>
								{strings('password_reset.change_password')}
							</StyledButton>
						</View>
						<View style={styles.setting} testID={'auto-lock-section'}>
							<Text style={styles.title}>{strings('app_settings.auto_lock')}</Text>
							<Text style={styles.desc}>{strings('app_settings.auto_lock_desc')}</Text>
							<View style={styles.picker}>
								{this.autolockOptions && (
									<SelectComponent
										selectedValue={this.props.lockTime.toString()}
										onValueChange={this.selectLockTime}
										label={strings('app_settings.auto_lock')}
										options={this.autolockOptions}
									/>
								)}
							</View>
						</View>
						{biometryType && (
							<View style={styles.setting} testID={'biometrics-option'}>
								<Text style={styles.title}>
									{strings(`biometrics.enable_${this.state.biometryType.toLowerCase()}`)}
								</Text>
								<View style={styles.switchElement}>
									<Switch
										onValueChange={this.onSingInWithBiometrics}
										value={this.state.biometryChoice}
										trackColor={{ true: colors.blue, false: colors.grey200 }}
										ios_backgroundColor={colors.grey000}
									/>
								</View>
							</View>
						)}
						{biometryType && !this.state.biometryChoice && (
							<View style={styles.setting}>
								<Text style={styles.title}>
									{isIos
										? strings(`biometrics.enable_device_passcode_ios`)
										: strings(`biometrics.enable_device_passcode_android`)}
								</Text>
								<View style={styles.switchElement}>
									<Switch
										onValueChange={this.onSignInWithPasscode}
										value={this.state.passcodeChoice}
										trackColor={{ true: colors.blue, false: colors.grey200 }}
										ios_backgroundColor={colors.grey000}
									/>
								</View>
							</View>
						)}
						<View style={styles.setting} testID={'reveal-private-key-section'}>
							<Text style={styles.title}>
								{strings('reveal_credential.private_key_title_for_account', {
									accountName: account.name
								})}
							</Text>
							<Text style={styles.desc}>
								{strings('reveal_credential.private_key_warning', { accountName: account.name })}
							</Text>
							<StyledButton
								type="normal"
								onPress={this.goToExportPrivateKey}
								containerStyle={styles.confirm}
							>
								{strings('reveal_credential.show_private_key')}
							</StyledButton>
						</View>
						<View style={styles.setting}>
							<Text style={styles.title}>{strings('private_key.backup_private_key')}</Text>
							<Text style={styles.desc}>{strings('private_key.backup_private_key_desc')}</Text>
							<StyledButton type="normal" onPress={this.backupPrivateKey} containerStyle={styles.confirm}>
								{strings('private_key.backup_private_key')}
							</StyledButton>
							{!!privateKeyBackupStats && (
								<View style={{ flexDirection: 'row' }}>
									<Text style={styles.desc}>
										{strings('private_key.sending_backup_progress', {
											progress: privateKeyBackupStats.currentPart + 1,
											total: privateKeyBackupStats.partCount
										})}
									</Text>
									<ActivityIndicator />
								</View>
							)}
						</View>
						<View style={styles.setting}>
							<Text style={styles.title}>{strings('private_key.recover_private_key')}</Text>
							<Text style={styles.desc}>{strings('private_key.recover_private_key_desc')}</Text>
							<StyledButton
								type="normal"
								onPress={this.recoverPrivateKey}
								containerStyle={styles.confirm}
							>
								{strings('private_key.recover_private_key')}
							</StyledButton>
						</View>
						<Heading>{strings('app_settings.privacy_heading')}</Heading>
						<View style={[styles.setting, styles.firstSetting]} testID={'clear-privacy-section'}>
							<Text style={styles.title}>{strings('app_settings.clear_privacy_title')}</Text>
							<Text style={styles.desc}>{strings('app_settings.clear_privacy_desc')}</Text>
							<StyledButton
								type="normal"
								onPress={this.toggleClearApprovalsModal}
								disabled={Object.keys(approvedHosts).length === 0}
								containerStyle={styles.confirm}
							>
								{strings('app_settings.clear_privacy_title')}
							</StyledButton>
						</View>
						<View style={styles.setting}>
							<Text style={styles.title}>{strings('app_settings.clear_browser_history_desc')}</Text>
							<Text style={styles.desc}>{strings('app_settings.clear_history_desc')}</Text>
							<StyledButton
								type="normal"
								onPress={this.toggleClearBrowserHistoryModal}
								disabled={browserHistory.length === 0}
								containerStyle={styles.confirm}
							>
								{strings('app_settings.clear_browser_history_desc')}
							</StyledButton>
						</View>
						<View style={styles.setting} testID={'clear-cookies-section'}>
							<Text style={styles.title}>{strings('app_settings.clear_browser_cookies_desc')}</Text>
							<Text style={styles.desc}>{strings('app_settings.clear_cookies_desc')}</Text>
							<StyledButton
								type="normal"
								onPress={this.toggleClearCookiesModal}
								containerStyle={styles.confirm}
							>
								{strings('app_settings.clear_browser_cookies_desc')}
							</StyledButton>
						</View>
						<View style={styles.setting} testID={'privacy-mode-section'}>
							<Text style={styles.title}>{strings('app_settings.privacy_mode')}</Text>
							<Text style={styles.desc}>{strings('app_settings.privacy_mode_desc')}</Text>
							<View style={styles.switchElement}>
								<Switch
									value={privacyMode}
									onValueChange={this.togglePrivacy}
									trackColor={{ true: colors.blue, false: colors.grey200 }}
									ios_backgroundColor={colors.grey000}
								/>
							</View>
						</View>
						<View style={styles.setting} testID={'metametrics-section'}>
							<Text style={styles.title}>{strings('app_settings.metametrics_title')}</Text>
							<Text style={styles.desc}>
								{strings('app_settings.metametrics_description', { appName: displayName })}
							</Text>
							<View style={styles.switchElement}>
								<Switch
									value={metricsOptIn}
									onValueChange={this.toggleMetricsOptIn}
									trackColor={{ true: colors.blue, false: colors.grey200 }}
									ios_backgroundColor={colors.grey000}
									testID={'metametrics-switch'}
								/>
							</View>
						</View>
						<View style={styles.setting} testID={'third-party-section'}>
							<Text style={styles.title}>{strings('app_settings.third_party_title')}</Text>
							<Text style={styles.desc}>
								{strings('app_settings.third_party_description', { appName: displayName })}
							</Text>
							<View style={styles.switchElement}>
								<Switch
									value={thirdPartyApiMode}
									onValueChange={this.toggleThirdPartyAPI}
									trackColor={{ true: colors.blue, false: colors.grey200 }}
									ios_backgroundColor={colors.grey000}
								/>
							</View>
						</View>
					</View>
					<View style={styles.setting} testID={'reveal-private-key-section'}>
						<Text style={styles.title}>
							{strings('reveal_credential.private_key_title_for_account', {
								accountName: account.name?.name || account?.name
							})}
						</Text>
						<Text style={styles.desc}>
							{strings('reveal_credential.private_key_warning', {
								accountName: account.name?.name || account?.name
							})}
						</Text>
						<StyledButton type="normal" onPress={this.goToExportPrivateKey} containerStyle={styles.confirm}>
							{strings('reveal_credential.show_private_key')}
						</StyledButton>
					</View>
					<View style={styles.setting}>
						<Text style={styles.title}>{strings('private_key.backup_private_key')}</Text>
						<Text style={styles.desc}>{strings('private_key.backup_private_key_desc')}</Text>
						<StyledButton type="normal" onPress={this.backupPrivateKey} containerStyle={styles.confirm}>
							{strings('private_key.backup_private_key')}
						</StyledButton>
						{!!privateKeyBackupStats && (
							<View style={{ flexDirection: 'row' }}>
								<Text style={styles.desc}>
									{strings('private_key.sending_backup_progress', {
										progress: privateKeyBackupStats.currentPart + 1,
										total: privateKeyBackupStats.partCount
									})}
								</Text>
							</View>
						)}
						<ActionModal
							modalVisible={browserHistoryModalVisible}
							confirmText={strings('app_settings.clear')}
							cancelText={strings('app_settings.reset_account_cancel_button')}
							onCancelPress={this.toggleClearBrowserHistoryModal}
							onRequestClose={this.toggleClearBrowserHistoryModal}
							onConfirmPress={this.clearBrowserHistory}
						>
							<View style={styles.modalView}>
								<Text style={styles.modalTitle}>
									{strings('app_settings.clear_browser_history_modal_title')}
								</Text>
								<Text style={styles.modalText}>
									{strings('app_settings.clear_browser_history_modal_message')}
								</Text>
							</View>
						</ActionModal>
						<ActionModal
							modalVisible={cookiesModalVisible}
							confirmText={strings('app_settings.clear')}
							cancelText={strings('app_settings.reset_account_cancel_button')}
							onCancelPress={this.toggleClearCookiesModal}
							onRequestClose={this.toggleClearCookiesModal}
							onConfirmPress={this.clearCookies}
							modalStyle={styles.modal}
							actionContainerStyle={styles.modalActionView}
							cancelButtonMode="normal"
						>
							<View style={styles.modalView}>
								<Text style={styles.modalTitle}>
									{strings('app_settings.clear_cookies_modal_title')}
								</Text>
								<Text style={styles.modalText}>
									{strings('app_settings.clear_cookies_modal_message')}
								</Text>
							</View>
						</ActionModal>
						{this.renderHint()}
					</View>
				</ScrollView>
			</OnboardingScreenWithBg>
		);
	};
}

const mapStateToProps = state => ({
	approvedHosts: state.privacy.approvedHosts,
	browserHistory: state.browser.history,
	lockTime: state.settings.lockTime,
	privacyMode: state.privacy.privacyMode,
	thirdPartyApiMode: state.privacy.thirdPartyApiMode,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	identities: state.engine.backgroundState.PreferencesController.identities,
	keyrings: state.engine.backgroundState.KeyringController.keyrings,
	passwordHasBeenSet: state.user.passwordSet,
	seedphraseBackedUp: state.user.seedphraseBackedUp,
	addressBook: state.engine.backgroundState.AddressBookController.addressBook,
	network: state.engine.backgroundState.NetworkController.network
});

const mapDispatchToProps = dispatch => ({
	clearBrowserHistory: () => dispatch(clearHistory()),
	clearHosts: () => dispatch(clearHosts()),
	setLockTime: lockTime => dispatch(setLockTime(lockTime)),
	setPrivacyMode: enabled => dispatch(setPrivacyMode(enabled)),
	setThirdPartyApiMode: enabled => dispatch(setThirdPartyApiMode(enabled)),
	passwordSet: () => dispatch(passwordSet())
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Settings);
