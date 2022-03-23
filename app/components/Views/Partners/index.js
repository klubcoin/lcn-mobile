import React, { PureComponent } from 'react';
import { ScrollView } from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import PartnerItem from './components/PartnerItem';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import APIService from '../../../services/APIService';
import { STORED_CONTENT } from '../../../constants/storage';
import preferences from '../../../store/preferences';

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

	async componentDidMount() {
		this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
			this.fetchPartnerList();
		});
		const PARTNERS = await preferences.fetch(STORED_CONTENT.PARTNERS);
		if (PARTNERS) {
			this.partnerList = PARTNERS;
		}
	}

	fetchPartnerList() {
		APIService.getPartnerList((success, json) => {
			if (success && Array.isArray(json)) {
				const data = json;
				data.sort((a, b) => a.name.toUpperCase().localeCompare(b.name.toUpperCase()));
				this.partnerList = data;
				preferences.save(STORED_CONTENT.PARTNERS, data);
			}
		});
	}

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<ScrollView contentContainerStyle={{ flexGrow: 1 }}>
					{this.partnerList.length > 0 &&
						this.partnerList.map((e, index) => (
							<PartnerItem imageSrc={e.icon} onItemPress={() => this.gotoDetails(e)} key={index} />
						))}
				</ScrollView>
			</OnboardingScreenWithBg>
		);
	}
}

export default inject('store')(observer(Partners));
