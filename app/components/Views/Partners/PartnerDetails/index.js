import React, { PureComponent } from 'react';
import { Text, View, Image, Linking, Alert } from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import OnboardingScreenWithBg from '../../../UI/OnboardingScreenWithBg';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import { strings } from '../../../../../locales/i18n';
import StyledButton from '../../../UI/StyledButton';
import styles from './styles/index';
import APIService, { basicAuth } from '../../../../services/APIService';
import * as base64 from 'base-64';

class PartnerDetails extends PureComponent {
	static navigationOptions = ({ navigation }) => {
		return getNavigationOptionsTitle(navigation.getParam('name'), navigation);
	};
	name = '';
	description = '';
	icon = '';
	websiteUrl = '';
	constructor(props) {
		super(props);
		makeObservable(this, {
			name: observable,
			description: observable,
			icon: observable,
			websiteUrl: observable
		});
		const { params } = this.props.navigation.state;
		this.name = params?.name ?? '';
		this.description = params?.description ?? '';
		this.icon = params?.icon ?? '';
		this.websiteUrl = params?.websiteUrl ?? '';
		// console.log(this.props.navigation);
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
					<Image
						source={{
							uri: APIService.apiGetPartnerIcon(this.icon),
							headers: {
								Authorization: `Basic ${base64.encode(basicAuth)}`
							}
						}}
						resizeMode={'cover'}
						style={styles.partnerImage}
					/>
					<View style={styles.button}>
						<StyledButton
							type={'normal-padding'}
							onPress={() => this.onViewPartners()}
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
export default observer(PartnerDetails);
