import React, { PureComponent } from 'react';
import { ScrollView } from 'react-native';
import { inject, observer } from 'mobx-react';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import PartnerItem from './components/PartnerItem';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';

const assetPath = '../../../images';
const logos = {
	AmnesiaIbiza: require(`${assetPath}/logo_amnesia_Ibiza.png`),
	ClubbingTV: require(`${assetPath}/logo_clubbingtv.png`),
	DJenerates: require(`${assetPath}/logo_djenerates.png`),
	LiquiChain: require(`${assetPath}/logo_liquichain.png`),
	Atlanticus: require(`${assetPath}/logo_atlanticus.png`)
};

class Partners extends PureComponent {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle(strings('drawer.partners'), navigation);

	gotoDetails = data => {
		const { navigation } = this.props;
		navigation.navigate('PartnerDetails', { partner: data });
	};

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<ScrollView>
					{Object.keys(logos).map((e, index) => (
						<PartnerItem imageSrc={logos[e]} onItemPress={() => this.gotoDetails(e)} key={index} />
					))}
				</ScrollView>
			</OnboardingScreenWithBg>
		);
	}
}

export default inject('store')(observer(Partners));
