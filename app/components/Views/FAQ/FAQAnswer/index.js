import React, { PureComponent } from 'react';
import { StyleSheet, Text } from 'react-native';
import { observer } from 'mobx-react';
import OnboardingScreenWithBg from '../../../UI/OnboardingScreenWithBg';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { strings } from '../../../../../locales/i18n';
import styles from './styles';
import TrackingScrollView from '../../../UI/TrackingScrollView';

class FAQAnswer extends PureComponent {
    static navigationOptions = ({ navigation }) => getNavigationOptionsTitle(strings('drawer.faq_answer'), navigation);

    render() {
        const { question, answer } = this.props.navigation.state.params.question;

        return (
            <OnboardingScreenWithBg screen="a">
                <TrackingScrollView style={styles.wrapper}>
                    <Text style={styles.question}>{question}</Text>
                    <Text style={styles.answer}>{answer}</Text>
                </TrackingScrollView>
            </OnboardingScreenWithBg>
        );
    }
}

export default observer(FAQAnswer);
