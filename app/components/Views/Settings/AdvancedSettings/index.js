import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { ActivityIndicator, SafeAreaView, StyleSheet, Switch, Text, View } from 'react-native';
import { connect } from 'react-redux';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import ActionModal from '../../../UI/ActionModal';
import Engine from '../../../../core/Engine';
import StyledButton from '../../../UI/StyledButton';
import { colors, fontStyles, baseStyles } from '../../../../styles/common';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { setShowCustomNonce, setShowHexData } from '../../../../actions/settings';
import { strings } from '../../../../../locales/i18n';
import { getApplicationName, getVersion, getBuildNumber } from 'react-native-device-info';
import Share from 'react-native-share';
import RNFS from 'react-native-fs';
import { Buffer } from 'buffer';
import Logger from '../../../../util/Logger';
import ipfsGateways from '../../../../util/ipfs-gateways.json';
import SelectComponent from '../../../UI/SelectComponent';
import { timeoutFetch } from '../../../../util/general';
import Device from '../../../../util/Device';
import { displayName } from '../../../../../app.json';
import OnboardingScreenWithBg from '../../../UI/OnboardingScreenWithBg';
import styles from './styles/index';

const HASH_TO_TEST = 'Qmaisz6NMhDB51cCvNWa1GMS7LU1pAxdF4Ld6Ft9kZEP2a';
const HASH_STRING = 'Hello from IPFS Gateway Checker';

/**
 * Main view for app configurations
 */
class AdvancedSettings extends PureComponent {
	static propTypes = {
		/**
		 * A string that of the chosen ipfs gateway
		 */
		ipfsGateway: PropTypes.string,
		/**
		/* navigation object required to push new views
		*/
		navigation: PropTypes.object,
		/**
		 * Indicates whether hex data should be shown in transaction editor
		 */
		showHexData: PropTypes.bool,
		/**
		 * Called to toggle show hex data
		 */
		setShowHexData: PropTypes.func,
		/**
		 * Called to toggle show custom nonce
		 */
		setShowCustomNonce: PropTypes.func,
		/**
		 * Indicates whether custom nonce should be shown in transaction editor
		 */
		showCustomNonce: PropTypes.bool,
		/**
		 * Entire redux state used to generate state logs
		 */
		fullState: PropTypes.object
	};

	static navigationOptions = ({ navigation }) =>
		getNavigationOptionsTitle(strings('app_settings.advanced_title'), navigation);

	state = {
		resetModalVisible: false,
		inputWidth: Device.isAndroid() ? '99%' : undefined,
		onlineIpfsGateways: [],
		gotAvailableGateways: false
	};

	componentDidMount = async () => {
		await this.handleAvailableIpfsGateways();
		this.mounted = true;
		// Workaround https://github.com/facebook/react-native/issues/9958
		this.state.inputWidth &&
			setTimeout(() => {
				this.mounted && this.setState({ inputWidth: '100%' });
			}, 100);
	};

	componentWillUnmount = () => {
		this.mounted = false;
	};

	handleAvailableIpfsGateways = async () => {
		const ipfsGatewaysPromises = ipfsGateways.map(async ipfsGateway => {
			const testUrl = ipfsGateway.value + HASH_TO_TEST + '#x-ipfs-companion-no-redirect';
			try {
				const res = await timeoutFetch(testUrl, 1200);
				const text = await res.text();
				const available = text.trim() === HASH_STRING.trim();
				ipfsGateway.available = available;
				return ipfsGateway;
			} catch (e) {
				ipfsGateway.available = false;
				return ipfsGateway;
			}
		});
		const ipfsGatewaysAvailability = await Promise.all(ipfsGatewaysPromises);
		const onlineIpfsGateways = ipfsGatewaysAvailability.filter(ipfsGateway => ipfsGateway.available);
		const sortedOnlineIpfsGateways = onlineIpfsGateways.sort((a, b) => a.key < b.key);
		this.setState({ gotAvailableGateways: true, onlineIpfsGateways: sortedOnlineIpfsGateways });
	};

	displayResetAccountModal = () => {
		this.setState({ resetModalVisible: true });
	};

	resetAccount = () => {
		const { TransactionController } = Engine.context;
		const { navigation } = this.props;
		TransactionController.wipeTransactions(true);
		navigation.navigate('Dashboard');
	};

	cancelResetAccount = () => {
		this.setState({ resetModalVisible: false });
	};

	downloadStateLogs = async () => {
		const appName = await getApplicationName();
		const appVersion = await getVersion();
		const buildNumber = await getBuildNumber();
		const path = RNFS.DocumentDirectoryPath + `/state-logs-v${appVersion}-(${buildNumber}).json`;
		// A not so great way to copy objects by value
		const fullState = JSON.parse(JSON.stringify(this.props.fullState));

		// Remove stuff we don't want to sync
		delete fullState.engine.backgroundState.AssetsController;
		delete fullState.engine.backgroundState.AssetsContractController;
		delete fullState.engine.backgroundState.AssetsDetectionController;
		delete fullState.engine.backgroundState.PhishingController;
		delete fullState.engine.backgroundState.AssetsContractController;

		// Add extra stuff
		fullState.engine.backgroundState.KeyringController.keyrings = Engine.context.KeyringController.state.keyrings;
		try {
			const data = JSON.stringify(fullState);

			let url = `data:text/plain;base64,${new Buffer(data).toString('base64')}`;
			// // Android accepts attachements as BASE64
			if (Device.isIos()) {
				await RNFS.writeFile(path, data, 'utf8');
				url = path;
			}

			await Share.open({
				subject: `${appName} State logs -  v${appVersion} (${buildNumber})`,
				title: `${appName} State logs -  v${appVersion} (${buildNumber})`,
				url
			});
		} catch (err) {
			Logger.error(err, 'State log error');
		}
	};

	setIpfsGateway = ipfsGateway => {
		const { PreferencesController } = Engine.context;
		PreferencesController.setIpfsGateway(ipfsGateway);
	};

	render = () => {
		const { showHexData, showCustomNonce, setShowHexData, setShowCustomNonce, ipfsGateway } = this.props;
		const { resetModalVisible, onlineIpfsGateways } = this.state;
		return (
			<OnboardingScreenWithBg screen="a">
				<SafeAreaView style={baseStyles.flexGrow}>
					<KeyboardAwareScrollView style={styles.wrapper} resetScrollToCoords={{ x: 0, y: 0 }}>
						<View style={styles.inner}>
							<ActionModal
								modalVisible={resetModalVisible}
								confirmText={strings('app_settings.reset_account_confirm_button')}
								cancelText={strings('app_settings.reset_account_cancel_button')}
								onCancelPress={this.cancelResetAccount}
								onRequestClose={this.cancelResetAccount}
								onConfirmPress={this.resetAccount}
								confirmButtonMode='normal'
								cancelButtonMode='danger'
							>
								<View style={styles.modalView}>
									<Text style={styles.modalTitle}>
										{strings('app_settings.reset_account_modal_title')}
									</Text>
									<Text style={styles.modalText}>
										{strings('app_settings.reset_account_modal_message')}
									</Text>
								</View>
							</ActionModal>
							<View style={[styles.setting, styles.firstSetting]}>
								<Text style={styles.title}>{strings('app_settings.reset_account')}</Text>
								<Text style={styles.desc}>{strings('app_settings.reset_desc')}</Text>
								<StyledButton
									type="normal"
									onPress={this.displayResetAccountModal}
									containerStyle={styles.marginTop}
								>
									{strings('app_settings.reset_account_button')}
								</StyledButton>
							</View>
							<View style={[styles.setting]}>
								<Text style={styles.title}>{strings('app_settings.ipfs_gateway')}</Text>
								<Text style={styles.desc}>{strings('app_settings.ipfs_gateway_desc')}</Text>
								<View style={styles.picker}>
									{this.state.gotAvailableGateways ? (
										<SelectComponent
											selectedValue={ipfsGateway}
											defaultValue={strings('app_settings.ipfs_gateway_down')}
											onValueChange={this.setIpfsGateway}
											label={strings('app_settings.ipfs_gateway')}
											options={onlineIpfsGateways}
										/>
									) : (
										<View style={styles.ipfsGatewayLoadingWrapper}>
											<ActivityIndicator size="small" />
										</View>
									)}
								</View>
							</View>
							<View style={styles.setting}>
								<Text style={styles.title}>{strings('app_settings.show_hex_data')}</Text>
								<Text style={styles.desc}>{strings('app_settings.hex_desc')}</Text>
								<View style={styles.marginTop}>
									<Switch
										value={showHexData}
										onValueChange={setShowHexData}
										trackColor={{ true: colors.blue, false: colors.grey200 }}
										ios_backgroundColor={colors.grey000}
									/>
								</View>
							</View>
							<View style={styles.setting}>
								<Text style={styles.title}>{strings('app_settings.show_custom_nonce')}</Text>
								<Text style={styles.desc}>{strings('app_settings.custom_nonce_desc')}</Text>
								<View style={styles.marginTop}>
									<Switch
										value={showCustomNonce}
										onValueChange={setShowCustomNonce}
										trackColor={{ true: colors.blue, false: colors.grey200 }}
										ios_backgroundColor={colors.grey000}
									/>
								</View>
							</View>
							<View style={styles.setting}>
								<Text style={styles.title}>{strings('app_settings.state_logs')}</Text>
								<Text style={styles.desc}>
									{strings('app_settings.state_logs_desc', { appName: displayName })}
								</Text>
								<StyledButton
									type="normal"
									onPress={this.downloadStateLogs}
									containerStyle={styles.marginTop}
								>
									{strings('app_settings.state_logs_button')}
								</StyledButton>
							</View>
						</View>
					</KeyboardAwareScrollView>
				</SafeAreaView>
			</OnboardingScreenWithBg>
		);
	};
}

const mapStateToProps = state => ({
	ipfsGateway: state.engine.backgroundState.PreferencesController.ipfsGateway,
	showHexData: state.settings.showHexData,
	showCustomNonce: state.settings.showCustomNonce,
	fullState: state
});

const mapDispatchToProps = dispatch => ({
	setShowHexData: showHexData => dispatch(setShowHexData(showHexData)),
	setShowCustomNonce: showCustomNonce => dispatch(setShowCustomNonce(showCustomNonce))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(AdvancedSettings);
