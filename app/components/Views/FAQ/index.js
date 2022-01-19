import React, { PureComponent } from 'react';
import { ActivityIndicator, ScrollView, StyleSheet, View, Text } from 'react-native';
import { observer } from 'mobx-react';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import SettingsDrawer from '../../UI/SettingsDrawer';
import { colors } from '../../../styles/common';
import { makeObservable, observable } from 'mobx';
import APIService from '../../../services/APIService';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.transparent,
		flex: 1,
		paddingHorizontal: 15,
		zIndex: 99999999999999
	},
	loading: {
		position: 'absolute',
		left: 0,
		right: 0,
		top: 0,
		bottom: 0,
		alignItems: 'center',
		justifyContent: 'center'
	}
});


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
			loading: observable,
		});
	}

	componentDidMount() {
		this.fetchQuestions();
	}

	async fetchQuestions() {
		APIService.getFAQs((success, json) => {
			this.questions = [...json];
			this.loading = false;
		});
	}

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				{this.loading ? <View style={styles.loading}>
					<ActivityIndicator />
				</View> :
					<ScrollView style={styles.wrapper}>
						{this.questions.map(e =>
							<SettingsDrawer
								key={e.uuid}
								description={e.question}
								onPress={() => this.gotoAnwser(e)}
							/>)}
					</ScrollView>}
			</OnboardingScreenWithBg>
		);
	}
}

export default observer(FAQScreen);
