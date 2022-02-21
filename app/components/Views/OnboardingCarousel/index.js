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
import { styles, carousel_images, klubcoin_text, DEVICE_WIDTH, IMG_PADDING } from './styles/index';
import { displayName } from '../../../../app.json';
import ScaleImage from 'react-native-scalable-image';
import APIService from '../../../services/APIService';
import preferences from '../../../store/preferences';

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
		currentTab: 1,
		onboardingData: []
	};

	async componentDidMount() {
		await this.fetchOnboardingData();
		this.fetchOnboardingContent();
	}

	async fetchOnboardingData() {
		const data = await preferences.fetch('onboading');
		if (data !== null) {
			this.setState({
				onboardingData: data
			});
		}
	}

	fetchOnboardingContent() {
		APIService.getOnboardingContent((success, json) => {
			if (!!json && Array.isArray(json) && json.length > 0) {
				const data = json;
				data.sort((a, b) => {
					if (a.code.toUpperCase() > b.code.toUpperCase()) return 1;
					return -1;
				});
				preferences.save('onboarding', data);
				this.setState({
					onboardingData: data
				});
			}
		});
	}

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
							<ScaleImage
								source={klubcoin_text}
								width={Math.min(Device.getDeviceWidth() / 2, 200)}
								style={[styles.logoText]}
							/>
							<ScrollableTabView
								style={styles.scrollTabs}
								renderTabBar={this.renderTabBar}
								onChangeTab={this.onChangeTab}
							>
								{this.state.onboardingData.map((value, index) => {
									const key = index + 1;
									const imgStyleKey = `carouselImage${key}`;
									return (
										<View key={key} style={baseStyles.flexGrow}>
											<View style={styles.tab}>
												<Text style={styles.title} testID={`carousel-screen-${value}`}>
													{value.title}
												</Text>
												<Text style={styles.subtitle}>{value.content}</Text>
											</View>
											<View style={styles.carouselImageWrapper}>
												{/* <Image
													source={carousel_images[index]}
													style={[styles.carouselImage, styles[imgStyleKey]]}
													resizeMethod={'auto'}
													resizeMode={'contain'}
													testID={`carousel-${value}-image`}
												/> */}
												<ScaleImage
													source={carousel_images[index]}
													width={DEVICE_WIDTH - IMG_PADDING}
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
								accessibilityLabel={'onboarding-get-started-button'}
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
