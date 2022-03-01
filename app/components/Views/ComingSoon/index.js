import React, { PureComponent } from 'react';
import { ScrollView, Text, View, TouchableOpacity,Linking } from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import { getComingSoonNavbarOptions } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import styles from './styles/index';
import ScaleImage from 'react-native-scalable-image';
import IconFontAwesome from 'react-native-vector-icons/FontAwesome';
import IconFontisto from 'react-native-vector-icons/Fontisto';

const onboarding_carousel_klubcoin = require('../../../images/klubcoin.png'); // eslint-disable-line
const klubcoin_text = require('../../../images/klubcoin_text.png');

const data=[
	{
		title:"klubcoin.net",
		icon:'world-o',
		url:'https://klubcoin.net'
	},
	{
		title:"Telegram",
		icon:'telegram',
		url:'https://t.me/klubcoin'
	},
	{
		title:"Twitter",
		icon:'twitter',
		url:'https://twitter.com/klubcoin'
	},
	{
		title:"Instagram",
		icon:'instagram',
		url:'https://www.instagram.com/klubcoin'
	},
	{
		title:"Discord",
		icon:'discord',
		url:'https://discord.com/invite/h8FptErsN7'
	},
]

class ComingSoon extends PureComponent {

	static navigationOptions = ({ navigation }) => {
		return getComingSoonNavbarOptions(navigation);
	};

	async onRedirect(url){
		await Linking.openURL(url);

	}
	
	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<ScrollView contentContainerStyle={styles.scrollView}>
					<ScaleImage style={styles.image} source={onboarding_carousel_klubcoin} width={160} />
					<ScaleImage style={styles.imageText} source={klubcoin_text} width={220} />
					<Text style={styles.text1}>{strings(`coming_soon.coming_soon`)}...</Text>
					<Text style={styles.text2}>{strings(`coming_soon.stay_in_touch_with_us`)}</Text>
					{
						data.map(e=>(
							<TouchableOpacity activeOpacity={0.7} style={styles.itemWrapper} onPress={()=>this.onRedirect(e.url)}>
								<IconFontisto name={e.icon} style={styles.itemIcon} size={20}/>
								<Text style={styles.itemText}>
								{e.title}
								</Text>
							</TouchableOpacity>
						))
					}
				</ScrollView>
			</OnboardingScreenWithBg>
		);
	}
}

export default inject('store')(observer(ComingSoon));
