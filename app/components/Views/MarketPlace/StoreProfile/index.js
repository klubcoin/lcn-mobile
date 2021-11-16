import React, { PureComponent } from 'react';
import {
	KeyboardAvoidingView,
	ScrollView,
	StyleSheet,
	TouchableOpacity,
	View,
	Image,
	Text,
	SafeAreaView,
	Dimensions
} from 'react-native';
import { inject, observer } from 'mobx-react';
import { makeObservable, observable } from 'mobx';
import preferences from '../../../../store/preferences';
import { getOnboardingNavbarOptions } from '../../../UI/Navbar';
import RemoteImage from '../../../Base/RemoteImage';
import drawables from '../../../../common/drawables';
import * as RNFS from 'react-native-fs';
import ImagePicker from 'react-native-image-crop-picker';
import { colors, fontStyles } from '../../../../styles/common';
import OnboardingProgress from '../../../UI/OnboardingProgress';
import { CHOOSE_PASSWORD_STEPS } from '../../../../constants/onboarding';
import { ONBOARDING, PREVIOUS_SCREEN } from '../../../../constants/navigation';
import StyledButton from '../../../UI/StyledButton';
import { strings } from '../../../../../locales/i18n';
import { TextInput } from 'react-native-gesture-handler';
import Device from '../../../../util/Device';
import Toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { RFPercentage, RFValue } from 'react-native-responsive-fontsize';
import styles from './styles/index';
import store from '../store';
import Engine from '../../../../core/Engine';
import infuraCurrencies from '../../../../util/infura-conversion.json';

class StoreProfile extends PureComponent {
	profile = {};

	constructor(props) {
		super(props);
		makeObservable(this, {
			profile: observable
		});
	}

	toggleDrawer = () => {
		this.props.navigation.toggleDrawer();
	};

	onEdit = () => {
		this.props.navigation.navigate('EditStoreProfile');
	};

	fetchStoreProfile = async () => {
		await store.load();
		this.profile = store.storeProfile;

		(this.selectedCurrency = Engine.state.CurrencyRateController.currentCurrency),
			(this.profile.currentCurrency = infuraCurrencies.objects.find(
				({ quote: { code, name } }) => code === this.selectedCurrency
			));
	};

	componentDidMount() {
		this.fetchStoreProfile();
		this.willFocusSubscription = this.props.navigation.addListener('willFocus', () => {
			this.fetchStoreProfile();
		});
	}

	componentWillUnmount() {
		if (this.willFocusSubscription) this.willFocusSubscription.remove();
	}

	renderNavBar() {
		return (
			<SafeAreaView>
				<View style={styles.navBar}>
					<TouchableOpacity onPress={this.toggleDrawer.bind(this)} style={styles.navButton}>
						<Icon style={styles.backIcon} name={'bars'} size={RFValue(15)} />
					</TouchableOpacity>
					<Text style={styles.titleNavBar}>{strings('market.store_profile')}</Text>
					<View style={styles.navButton} />
				</View>
			</SafeAreaView>
		);
	}

	render() {
		return (
			<KeyboardAvoidingView style={styles.container} behavior={'padding'} enabled={Device.isIos()}>
				{this.renderNavBar()}
				<View style={styles.topBody} />
				<View>
					<ScrollView>
						<View style={styles.body}>
							<TouchableOpacity onPress={this.onEdit} style={styles.editIcon}>
								<Icon name={'edit'} size={RFPercentage(2)} />
							</TouchableOpacity>
							<Text style={styles.storeName}>{this.profile.storeName}</Text>
							<View style={styles.content}>
								<Text style={styles.header}>{strings('market.about')}</Text>
								<Text style={styles.desc}>{this.profile.about || 'No description'}</Text>
								<Text style={styles.header}>{strings('market.contacts')}</Text>
								<Text style={styles.contact}>
									{strings('market.phone')}: {this.profile.phone || 'No phone'}
								</Text>
								<Text style={[styles.contact, styles.desc]}>
									{strings('market.email')}: {this.profile.email || 'No email'}
								</Text>
								<Text style={styles.header}>{strings('market.payment_term')}</Text>
								<Text style={styles.contact}>
									{strings('market.first_payment')}:{' '}
									{(this.profile.firstPaymentPercent * 100).toFixed(0)}%
								</Text>
								<Text style={styles.contact}>
									{strings('market.second_payment')}:{' '}
									{(this.profile.secondPaymentPercent * 100).toFixed(0)}%
								</Text>
								<Text style={styles.explainText}>{strings('market.payment_explain')}</Text>
								<Text style={styles.header}>{strings('market.current_currency')}</Text>
								<Text style={styles.desc}>
									{this.profile?.currentCurrency?.quote.code.toUpperCase()} -{' '}
									{this.profile?.currentCurrency?.quote.name}
								</Text>
							</View>
						</View>
					</ScrollView>
					<Image
						source={{ uri: this.profile.logoStore || drawables.noImage }}
						style={styles.logo}
						resizeMode={'cover'}
					/>
				</View>
			</KeyboardAvoidingView>
		);
	}
}
// const mapStateToProps = state => ({
// 	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency
// });

export default inject('store')(observer(StoreProfile));
