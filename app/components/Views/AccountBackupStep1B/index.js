import React, { useState } from 'react';
import { ScrollView, TouchableOpacity, Text, View, SafeAreaView, StyleSheet, Image, Dimensions } from 'react-native';
import PropTypes from 'prop-types';
import routes from '../../../common/routes';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors, fontStyles } from '../../../styles/common';
import StyledButton from '../../UI/StyledButton';
import OnboardingProgress from '../../UI/OnboardingProgress';
import { strings } from '../../../../locales/i18n';
import AndroidBackHandler from '../AndroidBackHandler';
import Device from '../../../util/Device';
import ActionModal from '../../UI/ActionModal';
import SeedphraseModal from '../../UI/SeedphraseModal';
import { getOnboardingNavbarOptions } from '../../UI/Navbar';
import { CHOOSE_PASSWORD_STEPS } from '../../../constants/onboarding';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import styles from './styles/index';
import { displayName } from '../../../../app.json';

const explain_backup_seedphrase = require('../../../images/explain-backup-seedphrase.png'); // eslint-disable-line

/**
 * View that's shown during the first step of
 * the backup seed phrase flow
 */
const AccountBackupStep1B = props => {
	const [showWhySecureWalletModal, setWhySecureWalletModal] = useState(false);
	const [showWhatIsSeedphraseModal, setWhatIsSeedphraseModal] = useState(false);

	const goNext = () => {
		props.navigation.navigate('ManualBackupStep1', { ...props.navigation.state.params });
	};

	const learnMore = () => {
		setWhySecureWalletModal(false);
		props.navigation.navigate('Webview', {
			url: routes.mainNetWork.helpSupportUrl,
			title: strings('drawer.metamask_support', { appName: displayName })
		});
	};

	const dismiss = () => null;

	const showWhySecureWallet = () => setWhySecureWalletModal(true);
	const hideWhySecureWallet = () => setWhySecureWalletModal(false);

	const showWhatIsSeedphrase = () => setWhatIsSeedphraseModal(true);
	const hideWhatIsSeedphrase = () => setWhatIsSeedphraseModal(false);

	return (
		<OnboardingScreenWithBg screen="a">
			<SafeAreaView style={styles.mainWrapper}>
				<ScrollView
					contentContainerStyle={styles.scrollviewWrapper}
					style={styles.mainWrapper}
					testID={'account-backup-step-1-screen'}
				>
					<View style={styles.wrapper} testID={'protect-your-account-screen'}>
						<OnboardingProgress steps={CHOOSE_PASSWORD_STEPS} currentStep={2} />
						<View style={styles.content}>
							<Text style={styles.titleIcon}>🔒</Text>
							<Text style={styles.title}>{strings('account_backup_step_1B.title')}</Text>
							<View style={styles.text}>
								<Text style={styles.label}>
									{strings('account_backup_step_1B.subtitle_1')}{' '}
									<Text style={styles.blue} onPress={showWhatIsSeedphrase}>
										{strings('account_backup_step_1B.subtitle_2')}
									</Text>
								</Text>
							</View>
							<TouchableOpacity onPress={showWhySecureWallet} style={styles.centerContent}>
								<Icon name="info-circle" style={styles.infoIcon} color={colors.blue} />
								<Text style={styles.whyImportantText}>
									{strings('account_backup_step_1B.why_important')}
								</Text>
							</TouchableOpacity>
						</View>
						<View style={styles.card}>
							<Text style={styles.manualTitle}>{strings('account_backup_step_1B.manual_title')}</Text>
							<Text style={styles.paragraph}>{strings('account_backup_step_1B.manual_subtitle')}</Text>
							<Text style={styles.barsTitle}>{strings('account_backup_step_1B.manual_security')}</Text>
							<View style={styles.barsContainer}>
								<View style={styles.bar} />
								<View style={styles.bar} />
								<View style={styles.bar} />
							</View>
							<Text style={styles.smallParagraph}>{strings('account_backup_step_1B.risks_title')}</Text>
							<Text style={styles.smallParagraph}>• {strings('account_backup_step_1B.risks_1')}</Text>
							<Text style={styles.smallParagraph}>• {strings('account_backup_step_1B.risks_2')}</Text>
							<Text style={styles.paragraph}>• {strings('account_backup_step_1B.risks_3')}</Text>
							<Text style={styles.paragraph}>{strings('account_backup_step_1B.other_options')}</Text>
							<Text style={styles.smallParagraph}>{strings('account_backup_step_1B.tips_title')}</Text>
							<Text style={styles.smallParagraph}>• {strings('account_backup_step_1B.tips_1')}</Text>
							<Text style={styles.smallParagraph}>• {strings('account_backup_step_1B.tips_2')}</Text>
							<Text style={styles.paragraph}>• {strings('account_backup_step_1B.tips_3')}</Text>

							<StyledButton
								containerStyle={styles.button}
								type={'normal'}
								onPress={goNext}
								testID={'submit-button'}
							>
								{strings('account_backup_step_1B.cta_text')}
							</StyledButton>
						</View>
					</View>
				</ScrollView>
				{Device.isAndroid() && <AndroidBackHandler customBackPress={dismiss} />}
				<ActionModal
					modalVisible={showWhySecureWalletModal}
					actionContainerStyle={styles.modalNoBorder}
					displayConfirmButton={false}
					displayCancelButton={false}
					onRequestClose={hideWhySecureWallet}
				>
					<View style={styles.secureModalContainer}>
						<View style={styles.secureModalTitleContainer}>
							<View style={styles.auxCenterView} />
							<Text style={styles.whySecureTitle}>
								{strings('account_backup_step_1B.why_secure_title')}
							</Text>
							<TouchableOpacity
								onPress={hideWhySecureWallet}
								style={styles.secureModalXButton}
								hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
							>
								<Icon name="times" style={styles.secureModalXIcon} />
							</TouchableOpacity>
						</View>
						<View style={styles.explainBackupContainer}>
							<Image
								source={explain_backup_seedphrase}
								style={styles.image}
								resizeMethod={'auto'}
								testID={'carousel-one-image'}
							/>
							<Text style={styles.whySecureText}>
								{strings('account_backup_step_1B.why_secure_1')}
								<Text style={styles.bold}>{strings('account_backup_step_1B.why_secure_2')}</Text>
							</Text>
							<TouchableOpacity
								style={styles.remindLaterButton}
								onPress={learnMore}
								hitSlop={{ top: 10, left: 10, bottom: 10, right: 10 }}
							>
								<Text style={styles.learnMoreText}>{strings('account_backup_step_1B.learn_more')}</Text>
							</TouchableOpacity>
						</View>
					</View>
				</ActionModal>
				<SeedphraseModal
					showWhatIsSeedphraseModal={showWhatIsSeedphraseModal}
					hideWhatIsSeedphrase={hideWhatIsSeedphrase}
				/>
			</SafeAreaView>
		</OnboardingScreenWithBg>
	);
};

AccountBackupStep1B.propTypes = {
	/**
	/* navigation object required to push and pop other views
	*/
	navigation: PropTypes.object
};

AccountBackupStep1B.navigationOptions = ({ navigation }) => getOnboardingNavbarOptions(navigation);

export default AccountBackupStep1B;
