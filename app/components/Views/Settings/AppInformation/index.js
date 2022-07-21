import React, { PureComponent } from 'react';
import {
	SafeAreaView,
	StyleSheet,
	Image,
	Text,
	InteractionManager,
	View,
	TouchableOpacity,
	Linking
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
import IconFontisto from 'react-native-vector-icons/Fontisto';
import ScaleImage from 'react-native-scalable-image';
import TrackingScrollView from '../../../UI/TrackingScrollView';
import { testID } from '../../../../util/Logger';

const styles = StyleSheet.create({
	wrapper: {
		flex: 1
	},
	wrapperContent: {
		paddingLeft: 24,
		paddingRight: 24,
		paddingVertical: 24
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
	},
	buttonTopText: {
		color: colors.primaryFox,
		fontSize: 16,
		fontWeight: 'bold'
	},
	buttonTop: {
		backgroundColor: colors.white,
		flexDirection: 'row',
		borderRadius: 12,
		marginBottom: 10,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 12,
		width: '100%'
	},
	space: {
		height: 30
	},
	buttonBottom: {
		backgroundColor: colors.purple,
		flexDirection: 'row',
		borderRadius: 12,
		marginBottom: 10,
		justifyContent: 'center',
		alignItems: 'center',
		paddingVertical: 12,
		width: '100%'
	},
	buttonIcon: {
		color: colors.white,
		marginRight: 12
	},
	buttonBottomText: {
		color: colors.white,
		fontSize: 16,
		fontWeight: 'bold'
	}
});

const logo = require('../../../../images/klubcoin_lighten.png');
const logoText = require('../../../../images/klubcoin_text.png');
const data = [
	{
		title: 'klubcoin.net',
		icon: 'world-o',
		url: 'https://klubcoin.net'
	},
	{
		title: 'Telegram',
		icon: 'telegram',
		url: 'https://t.me/klubcoin'
	},
	{
		title: 'Twitter',
		icon: 'twitter',
		url: 'https://twitter.com/klubcoin'
	},
	{
		title: 'Instagram',
		icon: 'instagram',
		url: 'https://www.instagram.com/klubcoin'
	},
	{
		title: 'Discord',
		icon: 'discord',
		url: 'https://discord.com/invite/h8FptErsN7'
	}
];
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
		InteractionManager.runAfterInteractions(async () => {
			if (title === 'Telegram') {
				await Linking.openURL(url);
				return;
			}
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
				<TrackingScrollView contentContainerStyle={styles.wrapperContent}>
					<View style={styles.logoWrapper}>
						<Image source={logo} style={styles.image} resizeMethod={'auto'} />
						<ScaleImage source={logoText} width={200} />
						{/* <Image source={logoText} style={styles.image} resizeMethod={'auto'} /> */}
						<Text style={styles.versionInfo}>{this.state.appInfo}</Text>
					</View>
					<TouchableOpacity
						style={styles.buttonTop}
						onPress={this.onPrivacyPolicy}
						activeOpacity={0.7}
						{...testID('app-information-privacy-policy')}
					>
						<Text style={styles.buttonTopText}>{strings('app_information.privacy_policy')}</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.buttonTop}
						onPress={this.onTermsOfUse}
						activeOpacity={0.7}
						{...testID('app-information-term-of-use')}
					>
						<Text style={styles.buttonTopText}>{strings('app_information.terms_of_use')}</Text>
					</TouchableOpacity>
					<TouchableOpacity
						style={styles.buttonTop}
						onPress={this.onAttributions}
						activeOpacity={0.7}
						{...testID('app-information-attributions')}
					>
						<Text style={styles.buttonTopText}>{strings('app_information.attributions')}</Text>
					</TouchableOpacity>
					<View style={styles.space} />
					{data.map(e => (
						<TouchableOpacity
							activeOpacity={0.7}
							style={styles.buttonBottom}
							onPress={() => this.goTo(e.url, e.title)}
							{...testID(`app-infomation-${e.title}`)}
							key={data.title}
						>
							<IconFontisto name={e.icon} style={styles.buttonIcon} size={20} />
							<Text style={styles.buttonBottomText}>{e.title}</Text>
						</TouchableOpacity>
					))}
				</TrackingScrollView>
			</SafeAreaView>
		</OnboardingScreenWithBg>
	);
}
