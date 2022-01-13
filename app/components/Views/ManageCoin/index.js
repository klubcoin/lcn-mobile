import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import {
	ActivityIndicator,
	BackHandler,
	FlatList,
	Text,
	View,
	ScrollView,
	StyleSheet,
	Alert,
	Image,
	InteractionManager
} from 'react-native';
import AsyncStorage from '@react-native-community/async-storage';
import StyledButton from '../../UI/StyledButton';
import { colors, fontStyles, baseStyles } from '../../../styles/common';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import { strings } from '../../../../locales/i18n';
import Button from 'react-native-button';
import { connect } from 'react-redux';
import SecureKeychain from '../../../core/SecureKeychain';
import Engine from '../../../core/Engine';
import FadeOutOverlay from '../../UI/FadeOutOverlay';
import TermsAndConditions from '../TermsAndConditions';
import Analytics from '../../../core/Analytics';
import { ANALYTICS_EVENT_OPTS } from '../../../util/analytics';
import { saveOnboardingEvent } from '../../../actions/onboarding';
import { getTransparentBackOnboardingNavbarOptions } from '../../UI/Navbar';
import ScanStep from '../../UI/ScanStep';
import PubNubWrapper from '../../../util/syncWithExtension';
import ActionModal from '../../UI/ActionModal';
import Logger from '../../../util/Logger';
import Device from '../../../util/Device';
import BaseNotification from '../../UI/Notification/BaseNotification';
import Animated, { Easing } from 'react-native-reanimated';
import ElevatedView from 'react-native-elevated-view';
import { passwordSet, seedphraseBackedUp, loadingSet, loadingUnset } from '../../../actions/user';
import { setLockTime } from '../../../actions/settings';
import AppConstants from '../../../core/AppConstants';
import AnimatedFox from 'react-native-animated-fox';
import PreventScreenshot from '../../../core/PreventScreenshot';
import WarningExistingUserModal from '../../UI/WarningExistingUserModal';
import { PREVIOUS_SCREEN, ONBOARDING } from '../../../constants/navigation';
import {
	SEED_PHRASE_HINTS,
	EXISTING_USER,
	BIOMETRY_CHOICE,
	BIOMETRY_CHOICE_DISABLED,
	NEXT_MAKER_REMINDER,
	METRICS_OPT_IN,
	TRUE
} from '../../../constants/storage';
import styles from './styles';
import { displayName } from '../../../../app.json';

/**
 * View that is displayed to first time (new) users
 */
class ManageCoin extends PureComponent {
	static navigationOptions = ({ navigation }) =>
		getTransparentBackOnboardingNavbarOptions(navigation, strings('drawer.manage_coins'));

	static propTypes = {
		/**
		 * The navigator object
		 */
		navigation: PropTypes.object,
		/**
		 * Selected address
		 */
		selectedAddress: PropTypes.string,
		/**
		 * loading status
		 */
		loading: PropTypes.bool,
		/**
		 * loadings msg
		 */
		loadingMsg: PropTypes.string
	};

	state = {
		loading: false
	};

	componentDidMount() {}

	renderLoader = () => (
		<View style={styles.wrapper}>
			<View style={styles.loader}>
				<ActivityIndicator size="small" />
				<Text style={styles.loadingText}>{this.props.loadingMsg}</Text>
			</View>
		</View>
	);

	renderContent() {
		return (
			<View style={styles.ctas}>
				<Image
					source={require('../../../images/klubcoin_text.png')}
					style={styles.image}
					resizeMode={'contain'}
				/>
				<Text style={styles.title} testID={'onboarding-screen-title'}>
					{strings('drawer.manage_coins')}
				</Text>
				<View style={styles.createWrapper}>
					<View style={styles.buttonWrapper}>
						<StyledButton
							containerStyle={styles.button}
							type={'pink-padding'}
							onPress={this.onPressCreate}
							testID={'create-wallet-button'}
						>
							{strings('manage_coin.scan_qr_to_collect').toUpperCase()}
						</StyledButton>
					</View>
					<View style={styles.buttonWrapper}>
						<StyledButton
							type={'normal-padding'}
							onPress={this.onPressImport}
							testID={'import-wallet-import-from-seed-button'}
							containerStyle={styles.button}
						>
							{strings('manage_coin.scan_qr_to_pay').toUpperCase()}
						</StyledButton>
					</View>
					<View style={styles.buttonWrapper}>
						<StyledButton
							containerStyle={styles.button}
							type={'normal-padding'}
							onPress={this.onPressSync}
							testID={'onboarding-import-button'}
						>
							{strings('manage_coin.scan_qr_to_tip').toUpperCase()}
						</StyledButton>
					</View>
					<View style={styles.buttonWrapper}>
						<StyledButton
							containerStyle={styles.button}
							type={'white-padding'}
							onPress={this.onViewPartners}
							testID={'onboarding-import-button'}
						>
							{strings('manage_coin.send_to_friend').toUpperCase()}
						</StyledButton>
					</View>
				</View>
			</View>
		);
	}

	render() {
		const { loading } = this.props;
		const { qrCodeModalVisible } = this.state;

		return (
			<View style={baseStyles.flexGrow} testID={'onboarding-screen'}>
				<OnboardingScreenWithBg screen={'c'}>
					<ScrollView style={baseStyles.flexGrow} contentContainerStyle={styles.scroll}>
						<View style={styles.wrapper}>{this.renderContent()}</View>
					</ScrollView>
					<View style={styles.termsAndConditions}>
						<TermsAndConditions navigation={this.props.navigation} />
					</View>
				</OnboardingScreenWithBg>
			</View>
		);
	}
}

const mapStateToProps = state => ({
	selectedAddress: state?.engine?.backgroundState?.PreferencesController?.selectedAddress,
	accounts: state.engine.backgroundState.AccountTrackerController.accounts,
	passwordSet: state.user.passwordSet,
	keycloakAuth: state.user.keycloakAuth,
	loading: state.user.loadingSet,
	loadingMsg: state.user.loadingMsg
});

export default connect(mapStateToProps)(ManageCoin);
