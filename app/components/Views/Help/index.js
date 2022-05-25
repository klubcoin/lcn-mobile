import React, { PureComponent } from 'react';
import { SafeAreaView, StyleSheet, Image, Text, InteractionManager, View, TouchableOpacity } from 'react-native';
import { colors, fontStyles } from '../../../styles/common';
import routes from '../../../common/routes';
import { strings } from '../../../../locales/i18n';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import AppConstants from '../../../core/AppConstants';
import { displayName } from '../../../../app.json';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import TrackingScrollView from '../../UI/TrackingScrollView';

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
		fontSize: 22,
		textAlign: 'left',
		marginBottom: 20,
		...fontStyles.normal,
		color: colors.blue,
		fontWeight: 'bold'
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

const foxImage = require('../../../images/klubcoin_lighten.png');

/**
 * View that contains app information
 */
export default class Help extends PureComponent {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle(strings('help.title'), navigation);

	goTo = (url, title) => {
		InteractionManager.runAfterInteractions(() => {
			this.props.navigation.navigate('Webview', {
				url,
				title
			});
		});
	};

	onPasswordSetup = () => {
		const url = AppConstants.URLS.LEARN_MORE;
		this.goTo(url, strings('help.password_setup'));
	};

	onSecureWallet = () => {
		const url = AppConstants.URLS.WHY_IT_IMPORTANT;
		this.goTo(url, strings('help.secure_your_wallet'));
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
		this.goTo(url, strings('help.contact_us'));
	};

	render = () => (
		<OnboardingScreenWithBg screen="a">
			<SafeAreaView style={styles.wrapper} testID={'app-settings-screen'}>
				<TrackingScrollView contentContainerStyle={styles.wrapperContent}>
					<View style={styles.logoWrapper}>
						<Image source={foxImage} style={styles.image} resizeMethod={'auto'} />
					</View>
					<Text style={styles.title}>{strings('help.help_support_links')}</Text>
					<View style={styles.link}>
						<TouchableOpacity onPress={this.onPasswordSetup} activeOpacity={0.7}>
							<Text style={styles.link}>{strings('help.password_setup')}</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={this.onSecureWallet} activeOpacity={0.7}>
							<Text style={styles.link}>{strings('help.secure_your_wallet')}</Text>
						</TouchableOpacity>
					</View>
					<View style={styles.division} />
					<View style={styles.links}>
						<TouchableOpacity onPress={this.onSupportCenter} activeOpacity={0.7}>
							<Text style={styles.link}>{strings('help.visit_our_support_center')}</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={this.onWebSite} activeOpacity={0.7}>
							<Text style={styles.link}>{strings('help.visit_our_website')}</Text>
						</TouchableOpacity>
						<TouchableOpacity onPress={this.onContactUs} activeOpacity={0.7}>
							<Text style={styles.link}>{strings('help.contact_us')}</Text>
						</TouchableOpacity>
					</View>
				</TrackingScrollView>
			</SafeAreaView>
		</OnboardingScreenWithBg>
	);
}
