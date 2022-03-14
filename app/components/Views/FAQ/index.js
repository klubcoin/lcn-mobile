import React, { PureComponent } from 'react';
import { ActivityIndicator, ScrollView, View } from 'react-native';
import { observer } from 'mobx-react';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import SettingsDrawer from '../../UI/SettingsDrawer';
import { makeObservable, observable } from 'mobx';
import APIService from '../../../services/APIService';
import styles from './styles';
class FAQScreen extends PureComponent {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle(strings('drawer.faq'), navigation);

	gotoAnwser = data => {
		const { navigation } = this.props;
		navigation.navigate('FAQAnswer', { question: data });
	};

	questions = [];
	loading = true;

	constructor(props) {
		super(props);
		makeObservable(this, {
			questions: observable,
			loading: observable
		});
	}

	componentDidMount() {
		this.fetchQuestions();
	}

	async fetchQuestions() {
		APIService.getFAQs((success, json) => {
			this.questions = [...json.filter(faq => this.isValidFAQ(faq))];
			this.loading = false;
		});
	}

	isValidFAQ(faq) {
		if (!faq || typeof faq !== 'object' || Array.isArray(faq)) {
			return false;
		}
		const keys = Object.keys(faq);
		if (
			!keys.includes('answer') ||
			!faq.answer ||
			!keys.includes('question') ||
			!faq.question
		) {
			return false;
		}
		return true;
	}

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				{this.loading ? (
					<View style={styles.loading}>
						<ActivityIndicator />
					</View>
				) : (
					<ScrollView style={styles.wrapper}>
						{this.questions.map(e => (
							<SettingsDrawer key={e.uuid} description={e.question} onPress={() => this.gotoAnwser(e)} />
						))}
					</ScrollView>
				)}
			</OnboardingScreenWithBg>
		);
	}
}

export default observer(FAQScreen);
