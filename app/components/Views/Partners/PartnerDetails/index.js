import React, { PureComponent } from 'react';
import { Text, View, Linking, Alert } from 'react-native';
import { observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import OnboardingScreenWithBg from '../../../UI/OnboardingScreenWithBg';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { strings } from '../../../../../locales/i18n';
import StyledButton from '../../../UI/StyledButton';
import styles from './styles/index';
import APIService from '../../../../services/APIService';
import PartnerImage from '../components/PartnerImage';

class PartnerDetails extends PureComponent {
	static navigationOptions = ({ navigation }) => {
		return getNavigationOptionsTitle(navigation.getParam('name'), navigation);
	};
	name = '';
	description = '';
	image = '';
	websiteUrl = '';

	constructor(props) {
		super(props);
		makeObservable(this, {
			name: observable,
			description: observable,
			websiteUrl: observable,
			image: observable
		});
		const { params } = this.props.navigation.state;
		this.name = params?.name ?? '';
		this.description = params?.description ?? '';
		this.websiteUrl = params?.websiteUrl ?? '';
		this.image = params?.image ?? '';
	}

	async onViewPartners() {
		const supported = await Linking.canOpenURL(this.websiteUrl);

		if (supported) {
			await Linking.openURL(this.websiteUrl);
		} else {
			Alert.alert(`Don't know how to open this URL: ${this.websiteUrl}`);
		}
	}

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<View style={styles.wrapper}>
					<Text style={styles.title}>{this.name}</Text>
					<Text style={styles.desc}>{this.description}</Text>
					{this.image && (
						<PartnerImage
							source={APIService.apiGetPartnerIcon(this.image)}
							height={300}
							width={'100%'}
							style={styles.partnerImage}
						/>
					)}
					<View style={styles.button}>
						<StyledButton
							type={'normal-padding'}
							onPress={() => this.onViewPartners()}
							testID={'partner-detail-go-to-website-button'}
						>
							{strings('onboarding.website').toUpperCase()}
						</StyledButton>
					</View>
				</View>
			</OnboardingScreenWithBg>
		);
	}
}
export default observer(PartnerDetails);
