import React, { PureComponent } from 'react';
import { ScrollView, Text, View, Image } from 'react-native';
import { inject, observer } from 'mobx-react';
import OnboardingScreenWithBg from '../../../UI/OnboardingScreenWithBg';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { strings } from '../../../../../locales/i18n';
import { fontStyles, colors } from '../../../../styles/common';
import StyledButton from '../../../UI/StyledButton';
import styles from './styles/index';

class PartnerDetails extends PureComponent {
	static navigationOptions = ({ navigation }) =>
		getNavigationOptionsTitle(navigation.getParam('partner'), navigation);

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<View style={styles.wrapper}>
					<Text style={styles.title}>Get 500 free Klub Coins{'\n'}if you own a DJenerates</Text>
					<Text style={styles.desc}>
						Supported by legends such as Carl Cox, Paul Oakenfold, Paul Van Dyk, Benny Benassi, Sven Väth,
						Blond:ish, Luciano, Jamie Jones, Adam Beyer, Ricardo Villalobos and many more, the Djenerates
						NFT collection is the first to immortalize electronic music icons into digital collectibles on
						the blockchain. Each DJenerates NFT owner automatically receive 500 Klub Coins.
					</Text>
					<Image
						source={require('../../../../images/partner_sample.png')}
						resizeMode={'cover'}
						style={styles.partnerImage}
					/>
					<View style={styles.button}>
						<StyledButton
							type={'normal-padding'}
							onPress={this.onViewPartners}
							testID={'onboarding-import-button'}
						>
							{strings('onboarding.website').toUpperCase()}
						</StyledButton>
					</View>
				</View>
			</OnboardingScreenWithBg>
		);
	}
}
export default inject('store')(observer(PartnerDetails));
