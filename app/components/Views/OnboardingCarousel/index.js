import React, { PureComponent } from 'react';
import PropTypes from 'prop-types';
import { Text, View, ScrollView, StyleSheet, Image, Dimensions } from 'react-native';
import StyledButton from '../../UI/StyledButton';
import { colors, fontStyles, baseStyles } from '../../../styles/common';
import { strings } from '../../../../locales/i18n';
import FadeOutOverlay from '../../UI/FadeOutOverlay';
import ScrollableTabView from 'react-native-scrollable-tab-view';
import { getTransparentOnboardingNavbarOptions } from '../../UI/Navbar';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import Device from '../../../util/Device';
import { styles, carousel_images, klubcoin_text } from './styles/index';
import { displayName } from '../../../../app.json';

/**
 * View that is displayed to first time (new) users
 */
export default class OnboardingCarousel extends PureComponent {
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

	onPresGetStarted = () => this.props.navigation.navigate('Onboarding');

	renderTabBar = () => <View />;

	onChangeTab = obj => {
		this.setState({ currentTab: obj.i + 1 });
	};

	//TODO: check what app is

	render() {
		const { currentTab } = this.state;
		return (
			<View style={baseStyles.flexGrow} testID={'onboarding-carousel-screen'}>
				<OnboardingScreenWithBg screen={'carousel'}>
					<ScrollView style={baseStyles.flexGrow} contentContainerStyle={styles.scroll}>
						<View style={styles.wrapper}>
							<Image
								source={klubcoin_text}
								style={[styles.logoText]}
								resizeMethod={'auto'}
								resizeMode={'contain'}
							/>
							<ScrollableTabView
								style={styles.scrollTabs}
								renderTabBar={this.renderTabBar}
								onChangeTab={this.onChangeTab}
							>
								{['one', 'two', 'three'].map((value, index) => {
									const key = index + 1;
									const imgStyleKey = `carouselImage${key}`;
									return (
										<View key={key} style={baseStyles.flexGrow}>
											<View style={styles.tab}>
												<Text style={styles.title} testID={`carousel-screen-${value}`}>
													{strings(`onboarding_carousel.title${key}`, {
														appName: displayName
													})}
												</Text>
												<Text style={styles.subtitle}>
													{strings(`onboarding_carousel.subtitle${key}`, {
														appName: displayName
													})}
												</Text>
											</View>
											<View style={styles.carouselImageWrapper}>
												<Image
													source={carousel_images[index]}
													style={[styles.carouselImage, styles[imgStyleKey]]}
													resizeMethod={'auto'}
													resizeMode={'contain'}
													testID={`carousel-${value}-image`}
												/>
											</View>
										</View>
									);
								})}
							</ScrollableTabView>

							<View style={styles.progessContainer}>
								{[1, 2, 3].map(i => (
									<View key={i} style={[styles.circle, currentTab === i ? styles.solidCircle : {}]} />
								))}
							</View>
						</View>
					</ScrollView>
					<View style={styles.ctas}>
						<View style={styles.ctaWrapper}>
							<StyledButton
								type={'normal'}
								onPress={this.onPresGetStarted}
								testID={'onboarding-get-started-button'}
							>
								{strings('onboarding_carousel.get_started').toUpperCase()}
							</StyledButton>
						</View>
					</View>
				</OnboardingScreenWithBg>
				<FadeOutOverlay />
			</View>
		);
	}
}
