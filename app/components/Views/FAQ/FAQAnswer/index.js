import React, { PureComponent } from 'react';
import { ScrollView, StyleSheet, Text } from 'react-native';
import { observer } from 'mobx-react';
import OnboardingScreenWithBg from '../../../UI/OnboardingScreenWithBg';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { strings } from '../../../../../locales/i18n';
import styles from './styles';

class FAQAnswer extends PureComponent {
    static navigationOptions = ({ navigation }) => getNavigationOptionsTitle(strings('drawer.faq_answer'), navigation);

    render() {
        const { question, answer } = this.props.navigation.state.params.question;

        return (
            <OnboardingScreenWithBg screen="a">
                <ScrollView style={styles.wrapper}>
                    <Text style={styles.question}>{question}</Text>
                    <Text style={styles.answer}>{answer}</Text>
                </ScrollView>
            </OnboardingScreenWithBg>
        );
    }
}

export default observer(FAQAnswer);
