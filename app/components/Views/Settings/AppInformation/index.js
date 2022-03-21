import React, { PureComponent } from 'react';
import {
	SafeAreaView,
	StyleSheet,
	Image,
	Text,
	InteractionManager,
	View,
	ScrollView,
	TouchableOpacity
} from 'react-native';
import { getApplicationName, getVersion, getBuildNumber } from 'react-native-device-info';
import { colors, fontStyles } from '../../../../styles/common';
import routes from '../../../../common/routes';
import PropTypes from 'prop-types';
import { strings } from '../../../../../locales/i18n';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import AppConstants from '../../../../core/AppConstants';
import { displayName } from '../../../../../app.json';
import OnboardingScreenWithBg from '../../../UI/OnboardingScreenWithBg';

const styles = StyleSheet.create({
	wrapper: {
		flex: 1
	},
	wrapperContent: {
		paddingLeft: 24,
		paddingRight: 24,
		paddingVertical: 24
	},
	title: {
		fontSize: 18,
		textAlign: 'left',
		marginBottom: 20,
		...fontStyles.normal,
		color: colors.white
	},
	link: {
		fontSize: 18,
		textAlign: 'left',
		marginBottom: 20,
		...fontStyles.normal,
		color: colors.grey000
	},
	division: {
		borderBottomColor: colors.grey400,
		borderBottomWidth: 1,
		width: '30%',
		marginBottom: 20
	},
	image: {
		width: 100,
		height: 100
	},
	logoWrapper: {
		flex: 1,
		alignItems: 'center',
		justifyContent: 'center',
		top: 20,
		marginBottom: 40
	},
	versionInfo: {
		marginTop: 20,
		fontSize: 18,
		textAlign: 'left',
		marginBottom: 20,
		color: colors.fontSecondary,
		...fontStyles.normal
	}
});

const foxImage = require('../../../../images/klubcoin_lighten.png');

/**
 * View that contains app information
 */
export default class AppInformation extends PureComponent {
	static navigationOptions = ({ navigation }) =>
		getNavigationOptionsTitle(strings('app_settings.info_title', { appName: displayName }), navigation);

	static propTypes = {
		/**
		/* navigation object required to push new views
		*/
		navigation: PropTypes.object
	};

	state = {
		appInfo: ''
	};

	componentDidMount = async () => {
		const appName = await getApplicationName();
		const appVersion = await getVersion();
		const buildNumber = await getBuildNumber();
		this.setState({ appInfo: `${appName} v${appVersion} (${buildNumber})` });
	};

	goTo = (url, title) => {
		InteractionManager.runAfterInteractions(() => {
			this.props.navigation.navigate('Webview', {
				url,
				title
			});
		});
	};

	onPrivacyPolicy = () => {
		const url = AppConstants.URLS.PRIVACY_POLICY;
		this.goTo(url, strings('app_information.privacy_policy'));
	};

	onTermsOfUse = () => {
		const url = AppConstants.URLS.TERMS_AND_CONDITIONS;
		this.goTo(url, strings('app_information.terms_of_use'));
	};

	onAttributions = () => {
		const url = 'https://klubcoin.net/legal-notice';
		this.goTo(url, strings('app_information.attributions'));
	};

	onSupportCenter = () => {
		const url = AppConstants.URLS.SUPPORT_CENTER;
		this.goTo(url, strings('drawer.metamask_support', { appName: displayName }));
	};

	onWebSite = () => {
		const url = routes.mainNetWork.portalUrl;
		this.goTo(url, routes.mainNetWork.hostDomain);
	};

	onContactUs = () => {
		const url = routes.mainNetWork.contactUrl;
		this.goTo(url, strings('drawer.metamask_support', { appName: displayName }));
	};

	render = () => (
		<OnboardingScreenWithBg screen="a">
			<SafeAreaView style={styles.wrapper} testID={'app-settings-screen'}>
				<ScrollView contentContainerStyle={styles.wrapperContent}>
					<View style={styles.logoWrapper}>
						<Image source={foxImage} style={styles.image} resizeMethod={'auto'} />
						<Text style={styles.versionInfo}>{this.state.appInfo}</Text>
					</View>
					<Text style={styles.title}>{strings('app_information.links')}</Text>
					<View style={styles.link}>
						<TouchableOpacity onPress={this.onPrivacyPolicy} activeOpacity={0.7}>
							<Text style={styles.link}>{strings('app_information.privacy_policy')}</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={this.onTermsOfUse} activeOpacity={0.7}>
							<Text style={styles.link}>{strings('app_information.terms_of_use')}</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={this.onAttributions} activeOpacity={0.7}>
							<Text style={styles.link}>{strings('app_information.attributions')}</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.division} />
					<View style={styles.links}>
						<TouchableOpacity onPress={this.onSupportCenter} activeOpacity={0.7}>
							<Text style={styles.link}>{strings('app_information.support_center')}</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={this.onWebSite} activeOpacity={0.7}>
							<Text style={styles.link}>{strings('app_information.web_site')}</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={this.onContactUs} activeOpacity={0.7}>
							<Text style={styles.link}>{strings('app_information.contact_us')}</Text>
						</TouchableOpacity>
					</View>
				</ScrollView>
			</SafeAreaView>
		</OnboardingScreenWithBg>
	);
}
