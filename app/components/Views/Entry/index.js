import React, { useState, useRef, useEffect, useCallback } from 'react';
import { withNavigation } from 'react-navigation';
import PropTypes from 'prop-types';
import { Animated, Dimensions, StyleSheet, View, Text, Image } from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import Engine from '../../../core/Engine';
import LottieView from 'lottie-react-native';
import SecureKeychain from '../../../core/SecureKeychain';
import setOnboardingWizardStep from '../../../actions/wizard';
import { connect } from 'react-redux';
import { colors } from '../../../styles/common';
import Logger from '../../../util/Logger';
import Device from '../../../util/Device';
import { recreateVaultWithSamePassword } from '../../../core/Vault';
import {
	EXISTING_USER,
	ONBOARDING_WIZARD,
	METRICS_OPT_IN,
	ENCRYPTION_LIB,
	ORIGINAL,
	CURRENT_APP_VERSION,
	LAST_APP_VERSION
} from '../../../constants/storage';
import { getVersion } from 'react-native-device-info';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import { displayName } from '../../../../app.json';
import NetInfo from '@react-native-community/netinfo';
import { showError } from '../../../util/notify';

/**
 * Entry Screen that decides which screen to show
 * depending on the state of the user
 * new, existing , logged in or not
 * while showing the fox
 */
const LOGO_SIZE = 175;
const LOGO_PADDING = 25;
const styles = StyleSheet.create({
	main: {
		flex: 1,
		backgroundColor: colors.transparent
	},
	metamaskName: {
		marginTop: 10,
		height: 25,
		width: 170,
		alignSelf: 'center',
		alignItems: 'center',
		justifyContent: 'center'
	},
	logoWrapper: {
		backgroundColor: colors.transparent,
		paddingTop: 50,
		marginTop: Dimensions.get('window').height / 2 - LOGO_SIZE / 2 - LOGO_PADDING,
		height: LOGO_SIZE + LOGO_PADDING * 2
	},
	foxAndName: {
		alignSelf: 'center',
		alignItems: 'center',
		justifyContent: 'center'
	},
	fox: {
		width: 110,
		height: 110,
		alignSelf: 'center',
		alignItems: 'center',
		justifyContent: 'center'
	}
});

const Entry = props => {
	const [viewToGo, setViewToGo] = useState(null);
	const [fingerScanned, setFingerScanned] = useState(false);
	const opacity = useRef(new Animated.Value(1)).current;

	const onAnimationFinished = useCallback(
		viewToGo => {
			if (viewToGo && (viewToGo !== 'Dashboard' || viewToGo !== 'Onboarding')) {
				props.navigation.navigate(viewToGo);
			} else if (viewToGo === 'Onboarding') {
				props.navigation.navigate('OnboardingRootNav');
			} else {
				const { selectedAddress } = props;
				if (selectedAddress) {
					props.navigation.navigate('HomeNav');
				} else {
					props.navigation.navigate('OnboardingRootNav');
				}
			}
		},
		[props]
	);

	const animateAndGoTo = useCallback(
		viewToGo => {
			setViewToGo(viewToGo);
			Animated.timing(opacity, {
				toValue: 0,
				duration: 1000,
				useNativeDriver: true,
				isInteraction: false
			}).start(() => {
				onAnimationFinished(viewToGo);
			});
		},
		[onAnimationFinished, opacity]
	);

	const unlockKeychain = useCallback(async () => {
		try {
			// Retreive the credentials
			const { KeyringController } = Engine.context;
			const credentials = fingerScanned ? null : await SecureKeychain.getGenericPassword();
			setFingerScanned(true);
			if (credentials) {
				// Restore vault with existing credentials

				await KeyringController.submitPassword(credentials.password);
				const encryptionLib = await AsyncStorage.getItem(ENCRYPTION_LIB);
				if (encryptionLib !== ORIGINAL) {
					await recreateVaultWithSamePassword(credentials.password, props.selectedAddress);
					await AsyncStorage.setItem(ENCRYPTION_LIB, ORIGINAL);
				}
				// Get onboarding wizard state
				const onboardingWizard = await AsyncStorage.getItem(ONBOARDING_WIZARD);
				// Check if user passed through metrics opt-in screen
				const metricsOptIn = await AsyncStorage.getItem(METRICS_OPT_IN);
				if (!metricsOptIn) {
					animateAndGoTo('OptinMetrics');
				} else if (onboardingWizard) {
					animateAndGoTo('HomeNav');
				} else {
					props.setOnboardingWizardStep(1);
					animateAndGoTo('Dashboard');
				}
			} else if (props.passwordSet) {
				animateAndGoTo('Welcome');
			} else {
				await KeyringController.submitPassword('');
				await SecureKeychain.resetGenericPassword();
				props.navigation.navigate('HomeNav');
			}
		} catch (error) {
			Logger.log("Keychain couldn't be accessed", error);
			animateAndGoTo('Welcome');
		}
	}, [animateAndGoTo, props, fingerScanned]);

	useEffect(() => {
		async function startApp() {
			const existingUser = await AsyncStorage.getItem(EXISTING_USER);
			try {
				const currentVersion = await getVersion();
				const savedVersion = await AsyncStorage.getItem(CURRENT_APP_VERSION);
				if (currentVersion !== savedVersion) {
					if (savedVersion) {
						await AsyncStorage.setItem(LAST_APP_VERSION, savedVersion);
					}
					await AsyncStorage.setItem(CURRENT_APP_VERSION, currentVersion);
				}

				const lastVersion = await AsyncStorage.getItem(LAST_APP_VERSION);
				if (!lastVersion) {
					if (existingUser) {
						// Setting last version to first version if user exists and lastVersion does not, to simulate update
						await AsyncStorage.setItem(LAST_APP_VERSION, '0.0.1');
					} else {
						// Setting last version to current version so that it's not treated as an update
						await AsyncStorage.setItem(LAST_APP_VERSION, currentVersion);
					}
				}
			} catch (error) {
				Logger.error(error);
			}

			if (existingUser !== null) {
				const state = await NetInfo.fetch();
				if (!state.isConnected) {
					animateAndGoTo('Welcome');
					return;
				}
				unlockKeychain();
			} else {
				animateAndGoTo('OnboardingRootNav');
			}
		}

		startApp();

		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []);

	return (
		<OnboardingScreenWithBg screen="a">
			<View style={styles.main}>
				<Animated.View
					style={{
						...styles.logoWrapper,
						opacity,
						alignItems: 'center',
						justifyContent: 'center'
					}}
				>
					<Image
						source={require('../../../images/klubcoin_lighten.png')}
						style={{
							width: 150,
							height: 150
						}}
					/>
					<Text
						style={{
							fontSize: 14,
							fontWeight: 'bold',
							textAlign: 'center',
							color: colors.fontPrimary
						}}
					>
						{displayName.toUpperCase()}
					</Text>
				</Animated.View>
			</View>
		</OnboardingScreenWithBg>
	);
};

Entry.propTypes = {
	/**
	/* navigation object required to push new views
	*/
	navigation: PropTypes.object,
	/**
	 * A string that represents the selected address
	 */
	selectedAddress: PropTypes.string,
	/**
	 * Boolean that determines if the user has set a password before
	 */
	passwordSet: PropTypes.bool,
	/**
	 * Dispatch set onboarding wizard step
	 */
	setOnboardingWizardStep: PropTypes.func
};

const mapDispatchToProps = dispatch => ({
	setOnboardingWizardStep: step => dispatch(setOnboardingWizardStep(step))
});

const mapStateToProps = state => ({
	passwordSet: state.user.passwordSet,
	selectedAddress:
		state.engine.backgroundState.PreferencesController &&
		state.engine.backgroundState.PreferencesController.selectedAddress
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(withNavigation(Entry));
