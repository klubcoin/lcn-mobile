import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, View, ScrollView } from 'react-native';
import StyledButton from '../../UI/StyledButton';
import { baseStyles } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import FadeOutOverlay from '../../UI/FadeOutOverlay';
import { getTransparentOnboardingNavbarOptions } from '../../UI/Navbar';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import Device from '../../../util/Device';
import { styles, onboarding_carousel_klubcoin, klubcoin_text, DEVICE_WIDTH, IMG_PADDING } from './styles/index';
import { displayName } from '../../../../app.json';
import ScaleImage from 'react-native-scalable-image';

/**
 * View that is displayed to first time (new) users
 */
export default class Welcome extends PureComponent {
	static navigationOptions = ({ navigation }) => getTransparentOnboardingNavbarOptions(navigation);

	static propTypes = {
		/**
		 * The navigator object
		 */
		navigation: PropTypes.object
	};

	state = {
		currentTab: 1
	};

	onLogin = () => this.props.navigation.navigate('Login');

	renderTabBar = () => <View />;

	onChangeTab = obj => {
		this.setState({ currentTab: obj.i + 1 });
	};

	//TODO: check what app is

	render() {
		return (
			<View style={baseStyles.flexGrow} testID={'onboarding-carousel-screen'}>
				<OnboardingScreenWithBg screen={'carousel'}>
					<ScrollView style={baseStyles.flexGrow} contentContainerStyle={styles.scroll}>
						<View style={styles.wrapper}>
							<ScaleImage
								source={klubcoin_text}
								width={Math.min(Device.getDeviceWidth() / 2, 200)}
								style={[styles.logoText]}
							/>
							<View style={styles.scrollTabs}>
								<View style={baseStyles.flexGrow}>
									<View style={styles.tab}>
										<Text style={styles.title}>
											{strings(`welcome.title`, {
												appName: displayName
											})}
										</Text>
										<Text style={styles.subtitle}>
											{strings(`welcome.subtitle`, {
												appName: displayName
											})}
										</Text>
									</View>
									<View style={styles.carouselImageWrapper}>
										<ScaleImage
											source={onboarding_carousel_klubcoin}
											width={DEVICE_WIDTH - IMG_PADDING}
										/>
									</View>
								</View>
							</View>
						</View>
					</ScrollView>
					<View style={styles.ctas}>
						<View style={styles.ctaWrapper}>
							<StyledButton
								type={'normal'}
								onPress={this.onLogin}
								testID={'onboarding-get-started-button'}
								accessibilityLabel={'onboarding-get-started-button'}
							>
								{strings('welcome.go_to_my_wallet').toUpperCase()}
							</StyledButton>
						</View>
					</View>
				</OnboardingScreenWithBg>
				<FadeOutOverlay />
			</View>
		);
	}
}
