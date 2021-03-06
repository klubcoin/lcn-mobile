import React, { PureComponent } from 'react';
import {
	Text,
	View,
	SafeAreaView,
	StyleSheet,
	ActivityIndicator,
	InteractionManager,
	KeyboardAvoidingView,
	TouchableOpacity
} from 'react-native';
import PropTypes from 'prop-types';
import { connect } from 'react-redux';
import { colors, fontStyles, baseStyles } from '../../../styles/common';
import preferences from '../../../store/preferences';
import StyledButton from '../../UI/StyledButton';
import OnboardingProgress from '../../UI/OnboardingProgress';
import { strings } from '../../../../locales/i18n';
import FeatherIcons from 'react-native-vector-icons/Feather';
import { BlurView } from '@react-native-community/blur';
import ActionView from '../../UI/ActionView';
import Device from '../../../util/Device';
import Engine from '../../../core/Engine';
import PreventScreenshot from '../../../core/PreventScreenshot';
import SecureKeychain from '../../../core/SecureKeychain';
import { getOnboardingNavbarOptions } from '../../UI/Navbar';
import LoginWithKeycloak from '../LoginWithKeycloak';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import {
	MANUAL_BACKUP_STEPS,
	SEED_PHRASE,
	CONFIRM_PASSWORD,
	WRONG_PASSWORD_ERROR
} from '../../../constants/onboarding';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';
import TrackingTextInput from '../../UI/TrackingTextInput';

/**
 * View that's shown during the second step of
 * the backup seed phrase flow
 */
export class ManualBackupStep1 extends PureComponent {
	static navigationOptions = ({ navigation }) => getOnboardingNavbarOptions(navigation);

	static propTypes = {
		/**
		/* navigation object required to push and pop other views
		*/
		navigation: PropTypes.object
	};

	steps = MANUAL_BACKUP_STEPS;

	state = {
		seedPhraseHidden: true,
		currentStep: 1,
		password: undefined,
		warningIncorrectPassword: undefined,
		ready: false,
		view: SEED_PHRASE
	};

	async componentDidMount() {
		this.words = this.props.navigation.getParam('words', []);
		if (!this.words.length) {
			try {
				const credentials = await SecureKeychain.getGenericPassword();
				if (credentials) {
					this.words = await this.tryExportSeedPhrase(credentials.password);
				} else {
					this.setState({ view: CONFIRM_PASSWORD });
				}
			} catch (e) {
				this.setState({ view: CONFIRM_PASSWORD });
			}
		}
		this.setState({ ready: true });
		InteractionManager.runAfterInteractions(() => PreventScreenshot.forbid());
	}

	onPasswordChange = password => {
		this.setState({ password });
	};

	goNext = () => {
		this.props.navigation.navigate('ManualBackupStep2', { words: this.words, steps: this.steps });
	};

	revealSeedPhrase = () => this.setState({ seedPhraseHidden: false });

	tryExportSeedPhrase = async password => {
		const { KeyringController } = Engine.context;
		const mnemonic = await KeyringController.exportSeedPhrase(password);
		const seed = JSON.stringify(mnemonic)
			.replace(/"/g, '')
			.split(' ');
		return seed;
	};

	tryUnlockWithPassword = async password => {
		this.setState({ ready: false });
		try {
			this.words = await this.tryExportSeedPhrase(password);
			this.setState({ view: SEED_PHRASE, ready: true });
		} catch (e) {
			let msg = strings('reveal_credential.warning_incorrect_password');
			if (e.toString().toLowerCase() !== WRONG_PASSWORD_ERROR.toLowerCase()) {
				msg = strings('reveal_credential.unknown_error');
			}
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

	renderLoader = () => (
		<View style={styles.loader}>
			<ActivityIndicator size="small" color={colors.white} />
		</View>
	);

	renderSeedPhraseConcealer = () => (
		<React.Fragment>
			<TouchableOpacity onPress={this.revealSeedPhrase} style={styles.touchableOpacity}>
				<BlurView blurType="light" blurAmount={5} style={styles.blurView} />
				<View style={styles.seedPhraseConcealer}>
					<FeatherIcons name="eye-off" size={24} style={styles.icon} />
					<Text style={styles.reveal}>{strings('manual_backup_step_1.reveal')}</Text>
					<Text style={styles.watching}>{strings('manual_backup_step_1.watching')}</Text>
					<View style={styles.viewButtonWrapper}>
						<StyledButton
							type={'view'}
							testID={'view-button'}
							onPress={this.revealSeedPhrase}
							containerStyle={styles.viewButtonContainer}
						>
							{strings('manual_backup_step_1.view')}
						</StyledButton>
					</View>
				</View>
			</TouchableOpacity>
		</React.Fragment>
	);

	renderConfirmPassword() {
		const { keycloakAuth } = this.props;
		const { warningIncorrectPassword } = this.state;
		return (
			<KeyboardAvoidingView style={styles.keyboardAvoidingView} behavior={'padding'}>
				<KeyboardAwareScrollView style={baseStyles.flexGrow} enableOnAndroid>
					<View style={styles.confirmPasswordWrapper}>
						<View style={[styles.content, styles.passwordRequiredContent]}>
							<Text style={styles.title}>{strings('manual_backup_step_1.confirm_password')}</Text>
							<View style={styles.text}>
								<Text style={styles.label}>{strings('manual_backup_step_1.before_continiuing')}</Text>
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
										style={styles.input}
										placeholder={'Password'}
										placeholderTextColor={colors.grey100}
										onChangeText={this.onPasswordChange}
										secureTextEntry
										onSubmitEditing={this.tryUnlock}
										testID={'private-credential-password-text-input'}
									/>
									{warningIncorrectPassword && (
										<Text style={styles.warningMessageText}>{warningIncorrectPassword}</Text>
									)}
									<View style={styles.buttonWrapper}>
										<StyledButton
											containerStyle={styles.button}
											type={'normal'}
											onPress={this.tryUnlock}
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

	renderSeedphraseView = () => {
		const words = this.words || [];
		const wordLength = words.length;
		const half = wordLength / 2 || 6;
		return (
			<ActionView
				confirmTestID={'manual-backup-step-1-continue-button'}
				confirmText={strings('manual_backup_step_1.continue').toUpperCase()}
				onConfirmPress={this.goNext}
				confirmDisabled={this.state.seedPhraseHidden}
				showCancelButton={false}
				confirmButtonMode={'normal'}
			>
				<View style={styles.wrapper} testID={'manual_backup_step_1-screen'}>
					<Text style={styles.action}>{strings('manual_backup_step_1.action')}</Text>
					<View style={styles.infoWrapper}>
						<Text style={styles.info}>{strings('manual_backup_step_1.info')}</Text>
					</View>
					<View style={styles.seedPhraseWrapper}>
						<View style={styles.wordColumn}>
							{this.words.slice(0, half).map((word, i) => (
								<View key={`word_${i}`} style={styles.wordWrapper}>
									<Text style={styles.word}>{`${i + 1}. ${word}`}</Text>
								</View>
							))}
						</View>
						<View style={styles.wordColumn}>
							{this.words.slice(-half).map((word, i) => (
								<View key={`word_${i}`} style={styles.wordWrapper}>
									<Text style={styles.word}>{`${i + (half + 1)}. ${word}`}</Text>
								</View>
							))}
						</View>
						{this.state.seedPhraseHidden && this.renderSeedPhraseConcealer()}
					</View>
				</View>
			</ActionView>
		);
	};

	render() {
		const { ready, currentStep, view } = this.state;
		if (!ready) return this.renderLoader();
		return (
			<OnboardingScreenWithBg screen="a">
				<SafeAreaView style={styles.mainWrapper}>
					<View style={styles.onBoardingWrapper}>
						<OnboardingProgress currentStep={currentStep} steps={this.steps} />
					</View>
					{view === SEED_PHRASE ? this.renderSeedphraseView() : this.renderConfirmPassword()}
				</SafeAreaView>
			</OnboardingScreenWithBg>
		);
	}
}

const mapStateToProps = state => ({
	keycloakAuth: state.user.keycloakAuth
});

export default connect(mapStateToProps)(ManualBackupStep1);
