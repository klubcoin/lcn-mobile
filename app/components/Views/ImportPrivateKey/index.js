import React, { PureComponent } from 'react';
import {
	Alert,
	ActivityIndicator,
	TouchableOpacity,
	Text,
	View,
	StyleSheet,
	InteractionManager,
	Modal
} from 'react-native';

import PropTypes from 'prop-types';
import routes from '../../../common/routes';
import { colors, fontStyles } from '../../../styles/common';
import StyledButton from '../../UI/StyledButton';
import Icon from 'react-native-vector-icons/Feather';
import { KeyboardAwareScrollView } from 'react-native-keyboard-aware-scroll-view';
import MaterialIcon from 'react-native-vector-icons/MaterialIcons';
import { strings } from '../../../../locales/i18n';
import Device from '../../../util/Device';
import { importAccountFromPrivateKey } from '../../../util/address';
import PreventScreenshot from '../../../core/PreventScreenshot';
import { displayName } from '../../../../app.json';
import styles from './styles/index';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import QRScanner from '../../UI/QRScanner';
import TrackingTextInput from '../../UI/TrackingTextInput';
/**
 * View that's displayed the first time a user receives funds
 */
export default class ImportPrivateKey extends PureComponent {
	static propTypes = {
		/**
		/* navigation object required to push and pop other views
		*/
		navigation: PropTypes.object
	};

	state = {
		privateKey: '',
		loading: false,
		inputWidth: Device.isAndroid() ? '99%' : undefined,
		isScanQR: false
	};

	componentDidMount = () => {
		this.mounted = true;
		// Workaround https://github.com/facebook/react-native/issues/9958
		this.state.inputWidth &&
			setTimeout(() => {
				this.mounted && this.setState({ inputWidth: '100%' });
			}, 100);
		InteractionManager.runAfterInteractions(() => PreventScreenshot.forbid());
	};

	componentWillUnmount = () => {
		this.mounted = false;
		InteractionManager.runAfterInteractions(() => PreventScreenshot.allow());
	};

	goNext = async () => {
		if (this.state.privateKey === '') {
			Alert.alert(strings('import_private_key.error_title'), strings('import_private_key.error_empty_message'));
			this.setState({ loading: false });
		}
		this.setState({ loading: true });
		// Import private key
		try {
			await importAccountFromPrivateKey(this.state.privateKey);
			this.props.navigation.navigate('ImportPrivateKeySuccess');
			this.setState({ loading: false, privateKey: '' });
		} catch (e) {
			Alert.alert(strings('import_private_key.error_title'), strings('import_private_key.error_message'));
			this.setState({ loading: false });
		}
	};

	learnMore = () =>
		this.props.navigation.navigate('Webview', {
			url: routes.mainNetWork.helpSupportUrl,
			title: strings('drawer.metamask_support', { appName: displayName })
		});

	onInputChange = value => {
		this.setState({ privateKey: value });
	};

	dismiss = () => {
		this.props.navigation.goBack(null);
	};

	scanPkey = () => {
		this.setState({ isScanQR: true });
		// this.props.navigation.navigate('QRScanner', {
		// 	onScanSuccess: data => {
		// 		if (data.private_key) {
		// 			this.setState({ privateKey: data.private_key }, () => {
		// 				// this.goNext();
		// 			});
		// 		} else {
		// 			Alert.alert(strings('import_private_key.error_title'), strings('import_private_key.error_message'));
		// 		}
		// 	}
		// });
	};

	onQRScan = response => {
		const content = response.data;

		if (!content) {
			this.setState({ isScanQR: false });
			Alert.alert(strings('import_private_key.error_title'), strings('import_private_key.error_message'));
			return false;
		}
		this.setState({ isScanQR: false, privateKey: content }, () => {
			this.goNext();
		});
	};

	render() {
		const { isScanQR } = this.state;
		return (
			<View style={styles.mainWrapper}>
				<KeyboardAwareScrollView
					contentContainerStyle={styles.wrapper}
					style={styles.mainWrapper}
					testID={'first-incoming-transaction-screen'}
					resetScrollToCoords={{ x: 0, y: 0 }}
				>
					<View style={styles.content} testID={'import-account-screen'}>
						<TouchableOpacity onPress={this.dismiss} style={styles.navbarRightButton}>
							<MaterialIcon name="close" size={15} style={styles.closeIcon} />
						</TouchableOpacity>
						<View style={styles.top}>
							<Icon name="download" style={styles.icon} color={colors.white} />
							<Text style={styles.title}>{strings('import_private_key.title')}</Text>
							<View style={styles.dataRow}>
								<Text style={styles.label}>
									{strings('import_private_key.description_one', { appName: displayName })}
								</Text>
							</View>
							<View style={styles.dataRow}>
								<Text style={styles.label} onPress={this.learnMore}>
									{strings('import_private_key.learn_more_here')}
								</Text>
							</View>
						</View>
						<View style={styles.bottom}>
							<View style={styles.subtitleText}>
								<Text style={styles.subtitleText}>{strings('import_private_key.subtitle')}</Text>
							</View>
							<TrackingTextInput
								value={this.state.privateKey}
								numberOfLines={3}
								multiline
								style={[styles.input, this.state.inputWidth ? { width: this.state.inputWidth } : {}]}
								onChangeText={this.onInputChange}
								testID={'input-private-key'}
								blurOnSubmit
								onSubmitEditing={this.goNext}
								returnKeyType={'next'}
								placeholder={strings('import_private_key.example')}
								placeholderTextColor={colors.grey100}
								autoCapitalize={'none'}
							/>
							<View style={styles.scanPkeyRow}>
								<TouchableOpacity onPress={this.scanPkey} style={styles.scanPkey}>
									<Text style={styles.scanPkeyText}>
										{strings('import_private_key.or_scan_a_qr_code')}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
					<View style={styles.buttonWrapper}>
						<StyledButton
							containerStyle={styles.button}
							type={'normal'}
							onPress={this.goNext}
							testID={'import-button'}
						>
							{this.state.loading ? (
								<ActivityIndicator size="small" color="white" />
							) : (
								strings('import_private_key.cta_text')
							)}
						</StyledButton>
					</View>
					<Modal visible={isScanQR}>
						<QRScanner
							onBarCodeRead={e => this.onQRScan(e)}
							onClose={() => {
								this.setState({ isScanQR: false });
							}}
						/>
					</Modal>
				</KeyboardAwareScrollView>
			</View>
		);
	}
}
