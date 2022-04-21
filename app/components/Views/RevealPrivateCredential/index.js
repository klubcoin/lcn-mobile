import React, { PureComponent } from 'react';
import { Dimensions, SafeAreaView, View, Text, TouchableOpacity, InteractionManager } from 'react-native';
import Clipboard from '@react-native-community/clipboard';
import AsyncStorage from '@react-native-community/async-storage';
import { colors } from '../../../styles/common';
import PropTypes from 'prop-types';
import { strings } from '../../../../locales/i18n';
import ActionView from '../../UI/ActionView';
import Icon from 'react-native-vector-icons/FontAwesome';
import Engine from '../../../core/Engine';
import { connect } from 'react-redux';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import SecureKeychain from '../../../core/SecureKeychain';
import { showAlert } from '../../../actions/alert';
import QRCode from 'react-native-qrcode-svg';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import DefaultTabBar from 'react-native-scrollable-tab-view/DefaultTabBar';
import PreventScreenshot from '../../../core/PreventScreenshot';
import { BIOMETRY_CHOICE } from '../../../constants/storage';
import LoginWithKeycloak from '../LoginWithKeycloak';
import preferences from '../../../store/preferences';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';
import TrackingTextInput from '../../UI/TrackingTextInput';

const WRONG_PASSWORD_ERROR = 'Error: Decrypt failed';

/**
 * View that displays private account information as private key or seed phrase
 */
class RevealPrivateCredential extends PureComponent {
	state = {
		privateCredential: '',
		unlocked: false,
		password: '',
		warningIncorrectPassword: ''
	};

	static navigationOptions = ({ navigation }) =>
		getNavigationOptionsTitle(
			strings(`reveal_credential.${navigation.getParam('privateCredentialName', '')}_title`),
			navigation
		);
	static propTypes = {
		/**
        /* navigation object required to push new views
        */
		navigation: PropTypes.object,
		/**
		 * Action that shows the global alert
		 */
		showAlert: PropTypes.func.isRequired,
		/**
		 * String that represents the selected address
		 */
		selectedAddress: PropTypes.string,
		/**
		 * Boolean that determines if the user has set a password before
		 */
		passwordSet: PropTypes.bool,
		/**
		 * String that determines whether to show the seedphrase or private key export screen
		 */
		privateCredentialName: PropTypes.string,
		/**
		 * Cancel function to be called when cancel button is clicked. If not provided, we go to previous screen on cancel
		 */
		cancel: PropTypes.func
	};

	async componentDidMount() {
		// Try to use biometrics to unloc
		// (if available)
		const biometryType = await SecureKeychain.getSupportedBiometryType();
		if (!this.props.passwordSet) {
			this.tryUnlockWithPassword('');
		} else if (biometryType) {
			const biometryChoice = await AsyncStorage.getItem(BIOMETRY_CHOICE);
			if (biometryChoice !== '' && biometryChoice === biometryType) {
				const credentials = await SecureKeychain.getGenericPassword();
				if (credentials) {
					this.tryUnlockWithPassword(credentials.password);
				}
			}
		}
		InteractionManager.runAfterInteractions(() => {
			PreventScreenshot.forbid();
		});
	}

	componentWillUnmount = () => {
		InteractionManager.runAfterInteractions(() => {
			PreventScreenshot.allow();
		});
	};

	cancel = () => {
		if (this.props.cancel) return this.props.cancel();
		const { navigation } = this.props;
		navigation.pop();
	};

	async tryUnlockWithPassword(password) {
		const { KeyringController } = Engine.context;
		const { selectedAddress } = this.props;

		const privateCredentialName =
			this.props.privateCredentialName || this.props.navigation.state.params.privateCredentialName;

		try {
			if (privateCredentialName === 'seed_phrase') {
				const mnemonic = await KeyringController.exportSeedPhrase(password);
				const privateCredential = JSON.stringify(mnemonic).replace(/"/g, '');
				this.setState({ privateCredential, unlocked: true });
			} else if (privateCredentialName === 'private_key') {
				const privateCredential = await KeyringController.exportAccount(password, selectedAddress);
				this.setState({ privateCredential, unlocked: true });
			}
		} catch (e) {
			let msg = strings('reveal_credential.warning_incorrect_password');
			if (e.toString().toLowerCase() !== WRONG_PASSWORD_ERROR.toLowerCase()) {
				msg = strings('reveal_credential.unknown_error');
			}

			this.setState({
				unlock: false,
				warningIncorrectPassword: msg
			});
		}
	}

	tryUnlock = hash => {
		const { password } = this.state;
		hash = typeof hash === 'string' ? hash : '';
		this.tryUnlockWithPassword(hash || password);
	};

	onKeycloakResult = async error => {
		if (!error) {
			const hash = await preferences.getKeycloakHash();
			this.tryUnlock(hash);
		}
	};

	onPasswordChange = password => {
		this.setState({ password });
	};

	copyPrivateCredentialToClipboard = async () => {
		const { privateCredential } = this.state;
		const privateCredentialName =
			this.props.privateCredentialName || this.props.navigation.state.params.privateCredentialName;

		await Clipboard.setString(privateCredential);
		this.props.showAlert({
			isVisible: true,
			autodismiss: 1500,
			content: 'clipboard-alert',
			data: { msg: strings(`reveal_credential.${privateCredentialName}_copied`) }
		});
	};

	renderTabBar() {
		return (
			<DefaultTabBar
				underlineStyle={styles.tabUnderlineStyle}
				activeTextColor={colors.blue}
				inactiveTextColor={colors.fontTertiary}
				backgroundColor={colors.transparent}
				tabStyle={styles.tabStyle}
				textStyle={styles.textStyle}
			/>
		);
	}

	render = () => {
		const { keycloakAuth } = this.props;
		const { unlocked, privateCredential } = this.state;
		const privateCredentialName =
			this.props.privateCredentialName || this.props.navigation.state.params.privateCredentialName;

		return (
			<OnboardingScreenWithBg screen="a">
				<SafeAreaView style={styles.wrapper} testID={'reveal-private-credential-screen'}>
					<ActionView
						cancelText={strings('reveal_credential.cancel')}
						confirmText={strings('reveal_credential.confirm')}
						onCancelPress={this.cancel}
						testID={`next-button`}
						onConfirmPress={this.tryUnlock}
						showConfirmButton={!unlocked}
					>
						<View>
							<View style={[styles.rowWrapper, styles.header]}>
								<Text style={styles.label}>
									{strings(`reveal_credential.${privateCredentialName}_explanation`)}
								</Text>
							</View>
							<View style={styles.warningWrapper}>
								<View style={[styles.rowWrapper, styles.warningRowWrapper]}>
									<Icon style={styles.icon} name="warning" size={22} />
									<Text style={styles.warningMessageText}>
										{strings(`reveal_credential.${privateCredentialName}_warning_explanation`)}
									</Text>
								</View>
							</View>

							<View style={styles.rowWrapper}>
								{unlocked ? (
									<ScrollableTabView renderTabBar={this.renderTabBar}>
										<View tabLabel={strings(`reveal_credential.text`)} style={styles.tabContent}>
											<Text style={styles.label}>
												{strings(`reveal_credential.${privateCredentialName}`)}
											</Text>
											<View style={styles.seedPhraseView}>
												<TrackingTextInput
													value={privateCredential}
													numberOfLines={3}
													multiline
													selectTextOnFocus
													style={styles.seedPhrase}
													editable={false}
													testID={'private-credential-text'}
												/>
												<TouchableOpacity
													style={styles.privateCredentialAction}
													onPress={this.copyPrivateCredentialToClipboard}
													testID={'private-credential-touchable'}
												>
													<Icon style={styles.actionIcon} name="copy" size={18} />
													<Text style={styles.actionText}>
														{strings('reveal_credential.copy_to_clipboard')}
													</Text>
												</TouchableOpacity>
											</View>
										</View>
										<View tabLabel={strings(`reveal_credential.qr_code`)} style={styles.tabContent}>
											<View style={styles.qrCodeWrapper}>
												<QRCode
													value={privateCredential}
													size={Dimensions.get('window').width - 160}
													logoSize={50}
													logoBackgroundColor="black"
													logoBorderRadius={100}
													logoMargin={5}
												/>
											</View>
										</View>
									</ScrollableTabView>
								) : keycloakAuth ? (
									<LoginWithKeycloak
										type={'sign'}
										label={strings('reveal_credential.confirm_password')}
										onSuccess={this.onKeycloakResult}
										onError={this.onKeycloakResult}
									/>
								) : (
									<View>
										<Text style={styles.enterPassword}>
											{strings('reveal_credential.enter_password')}
										</Text>
										<TrackingTextInput
											style={styles.input}
											testID={'private-credential-password-text-input'}
											placeholder={'Password'}
											placeholderTextColor={colors.grey100}
											onChangeText={this.onPasswordChange}
											secureTextEntry
											onSubmitEditing={this.tryUnlock}
										/>
										<Text style={styles.warningText} testID={'password-warning'}>
											{this.state.warningIncorrectPassword}
										</Text>
									</View>
								)}
							</View>
						</View>
					</ActionView>
				</SafeAreaView>
			</OnboardingScreenWithBg>
		);
	};
}

const mapStateToProps = state => ({
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	passwordSet: state.user.passwordSet,
	keycloakAuth: state.user.keycloakAuth
});

const mapDispatchToProps = dispatch => ({
	showAlert: config => dispatch(showAlert(config))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(RevealPrivateCredential);
