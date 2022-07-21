import React, { PureComponent } from 'react';
import { Text, TouchableOpacity, InteractionManager, Linking } from 'react-native';
import { inject, observer } from 'mobx-react';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import { getComingSoonNavbarOptions } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import styles from './styles/index';
import ScaleImage from 'react-native-scalable-image';
import IconFontisto from 'react-native-vector-icons/Fontisto';
import TrackingScrollView from '../../UI/TrackingScrollView';

const onboarding_carousel_klubcoin = require('../../../images/klubcoin.png'); // eslint-disable-line
const klubcoin_text = require('../../../images/klubcoin_text.png');

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

class ComingSoon extends PureComponent {
	static navigationOptions = ({ navigation }) => {
		return getComingSoonNavbarOptions(navigation);
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

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<TrackingScrollView contentContainerStyle={styles.scrollView}>
					<ScaleImage style={styles.image} source={onboarding_carousel_klubcoin} width={160} />
					<ScaleImage style={styles.imageText} source={klubcoin_text} width={220} />
					<Text style={styles.text1}>{strings(`coming_soon.coming_soon`)}...</Text>
					<Text style={styles.text2}>{strings(`coming_soon.stay_in_touch_with_us`)}</Text>
					{data.map((e, index) => (
						<TouchableOpacity
							key={index}
							activeOpacity={0.7}
							style={styles.itemWrapper}
							onPress={() => this.goTo(e.url, e.title)}
						>
							<IconFontisto name={e.icon} style={styles.itemIcon} size={20} />
							<Text style={styles.itemText}>{e.title}</Text>
						</TouchableOpacity>
					))}
				</TrackingScrollView>
			</OnboardingScreenWithBg>
		);
	}
}

export default inject('store')(observer(ComingSoon));
