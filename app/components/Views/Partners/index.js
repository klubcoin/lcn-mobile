import React, { PureComponent } from 'react';
import { ScrollView } from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import PartnerItem from './components/PartnerItem';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import APIService from '../../../services/APIService';

class Partners extends PureComponent {
	static navigationOptions = ({ navigation }) => {
		return getNavigationOptionsTitle(strings('drawer.partners'), navigation);
	};
	partnerList = [];
	constructor(props) {
		super(props);
		makeObservable(this, {
			partnerList: observable
		});
	}
	gotoDetails = data => {
		const { navigation } = this.props;
		navigation.navigate('PartnerDetails', { ...data });
	};

	componentDidMount() {
		this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
			this.fetchPartnerList();
		});
	}

	fetchPartnerList() {
		APIService.getPartnerList((success, json) => {
			if (success) {
				this.partnerList = json;
			}
		});
	}

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<ScrollView>
					{this.partnerList.map((e, index) => (
						<PartnerItem imageSrc={e.icon} onItemPress={() => this.gotoDetails(e)} key={index} />
					))}
				</ScrollView>
			</OnboardingScreenWithBg>
		);
	}
}

export default inject('store')(observer(Partners));
