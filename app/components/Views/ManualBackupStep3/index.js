import React, { PureComponent } from 'react';
import { Alert, BackHandler, Text, View, SafeAreaView, StyleSheet, Keyboard, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import { colors, fontStyles } from '../../../styles/common';
import routes from '../../../common/routes';
import Emoji from 'react-native-emoji';
import AsyncStorage from '@react-native-community/async-storage';
import OnboardingProgress from '../../UI/OnboardingProgress';
import ActionView from '../../UI/ActionView';
import { strings } from '../../../../locales/i18n';
import { showAlert } from '../../../actions/alert';
import AndroidBackHandler from '../AndroidBackHandler';
import Device from '../../../util/Device';
import Confetti from '../../UI/Confetti';
import HintModal from '../../UI/HintModal';
import { getTransparentOnboardingNavbarOptions } from '../../UI/Navbar';
import { ONBOARDING_WIZARD, METRICS_OPT_IN, SEED_PHRASE_HINTS } from '../../../constants/storage';
import styles from './styles/index';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import { displayName } from '../../../../app.json';

const hardwareBackPress = () => ({});
const HARDWARE_BACK_PRESS = 'hardwareBackPress';

/**
 * View that's shown during the last step of
 * the backup seed phrase flow
 */
class ManualBackupStep3 extends PureComponent {
	static navigationOptions = ({ navigation }) => getTransparentOnboardingNavbarOptions(navigation);

	constructor(props) {
		super(props);
		this.steps = props.navigation.getParam('steps', undefined);
	}

	state = {
		currentStep: 4,
		showHint: false,
		hintText: ''
	};

	static propTypes = {
		/**
		/* navigation object required to push and pop other views
		*/
		navigation: PropTypes.object
	};

	componentWillUnmount = () => {
		BackHandler.removeEventListener(HARDWARE_BACK_PRESS, hardwareBackPress);
	};

	componentDidMount = async () => {
		const currentSeedphraseHints = await AsyncStorage.getItem(SEED_PHRASE_HINTS);
		const parsedHints = currentSeedphraseHints && JSON.parse(currentSeedphraseHints);
		const manualBackup = parsedHints?.manualBackup;
		this.setState({
			hintText: manualBackup
		});
		BackHandler.addEventListener(HARDWARE_BACK_PRESS, hardwareBackPress);
	};

	toggleHint = () => {
		this.setState(state => ({ showHint: !state.showHint }));
	};

	learnMore = () =>
		this.props.navigation.navigate('Webview', {
			url: routes.mainNetWork.helpSupportUrl,
			title: strings('drawer.metamask_support', { appName: displayName })
		});

	isHintSeedPhrase = hintText => {
		const words = this.props.navigation.getParam('words');
		if (words) {
			const lower = string => String(string).toLowerCase();
			return lower(hintText) === lower(words.join(' '));
		}
		return false;
	};

	saveHint = async () => {
		const { hintText } = this.state;
		if (!hintText) return;
		if (this.isHintSeedPhrase(hintText)) {
			Alert.alert('Error!', strings('manual_backup_step_3.no_seedphrase'));
			return;
		}
		this.toggleHint();
		const currentSeedphraseHints = await AsyncStorage.getItem(SEED_PHRASE_HINTS);
		const parsedHints = JSON.parse(currentSeedphraseHints);
		await AsyncStorage.setItem(SEED_PHRASE_HINTS, JSON.stringify({ ...parsedHints, manualBackup: hintText }));
	};

	done = async () => {
		this.props.navigation.navigate('EmailVerifyOnboarding');
		return;
		const onboardingWizard = await AsyncStorage.getItem(ONBOARDING_WIZARD);
		// Check if user passed through metrics opt-in screen
		const metricsOptIn = await AsyncStorage.getItem(METRICS_OPT_IN);
		if (!metricsOptIn) {
			this.props.navigation.navigate('OptinMetrics');
		} else if (onboardingWizard) {
			this.props.navigation.navigate('HomeNav');
			this.props.navigation.popToTop();
			this.props.navigation.goBack(null);
		} else {
			this.props.navigation.navigate('HomeNav');
			this.props.navigation.popToTop();
			this.props.navigation.goBack(null);
		}
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

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<SafeAreaView style={styles.mainWrapper}>
					<Confetti />
					{this.steps ? (
						<View style={styles.onBoardingWrapper}>
							<OnboardingProgress currentStep={this.state.currentStep} steps={this.steps} />
						</View>
					) : null}
					<ActionView
						confirmTestID={'manual-backup-step-3-done-button'}
						confirmText={strings('manual_backup_step_3.done')}
						onConfirmPress={this.done}
						showCancelButton={false}
						confirmButtonMode={'normal'}
					>
						<View style={styles.wrapper} testID={'import-congrats-screen'}>
							<Emoji name="tada" style={styles.emoji} />
							<Text style={styles.congratulations}>
								{strings('manual_backup_step_3.congratulations')}
							</Text>
							<Text style={[styles.baseText, styles.successText]}>
								{strings('manual_backup_step_3.success')}
							</Text>
							<TouchableOpacity onPress={this.toggleHint}>
								<Text style={[styles.baseText, styles.hintText]}>
									{strings('manual_backup_step_3.hint')}
								</Text>
							</TouchableOpacity>
							<Text style={[styles.baseText, styles.recoverText]}>
								{strings('manual_backup_step_3.recover', { appName: displayName })}
							</Text>
							<TouchableOpacity onPress={this.learnMore}>
								<Text style={[styles.baseText, styles.learnText]}>
									{strings('manual_backup_step_3.learn')}
								</Text>
							</TouchableOpacity>
						</View>
					</ActionView>
					{Device.isAndroid() && <AndroidBackHandler customBackPress={this.props.navigation.pop} />}
					{this.renderHint()}
				</SafeAreaView>
			</OnboardingScreenWithBg>
		);
	}
}

const mapDispatchToProps = dispatch => ({
	showAlert: config => dispatch(showAlert(config))
});

export default connect(
	null,
	mapDispatchToProps
)(ManualBackupStep3);
