import React, { PureComponent } from 'react';
import { ScrollView, StyleSheet } from 'react-native';
import { observer } from 'mobx-react';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import { getNavigationOptionsTitle } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import SettingsDrawer from '../../UI/SettingsDrawer';
import { colors } from '../../../styles/common';

const styles = StyleSheet.create({
	wrapper: {
		backgroundColor: colors.transparent,
		flex: 1,
		paddingHorizontal: 15,
		zIndex: 99999999999999
	}
});


class FAQScreen extends PureComponent {
	static navigationOptions = ({ navigation }) => getNavigationOptionsTitle(strings('drawer.faq'), navigation);

	// gotoDetails = data => {
	// 	const { navigation } = this.props;
	// 	navigation.navigate('PartnerDetails', { partner: data });
	// };

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<ScrollView style={styles.wrapper}>
					<SettingsDrawer
						description={strings('app_settings.general_desc')}
					/>
					<SettingsDrawer
						description={strings('app_settings.security_desc')}
					/>
				</ScrollView>
			</OnboardingScreenWithBg>
		);
	}
}

export default observer(FAQScreen);
