import PropTypes from 'prop-types';
import React, { PureComponent } from 'react';
import { Text, Switch, View, Image, TouchableOpacity } from 'react-native';
import { connect } from 'react-redux';

import Engine from '../../../../core/Engine';
import I18n, { strings, getLanguages, setLocale } from '../../../../../locales/i18n';
import SelectComponent from '../../../UI/SelectComponent';
import infuraCurrencies from '../../../../util/infura-conversion.json';
import { colors } from '../../../../styles/common';
import { getNavigationOptionsTitle } from '../../../UI/Navbar';
import {
	setSearchEngine,
	setPrimaryCurrency,
	setUseBlockieIcon,
	setHideZeroBalanceTokens
} from '../../../../actions/settings';
import PickComponent from '../../PickComponent';
import { toDataUrl } from '../../../../util/blockies.js';
import Jazzicon from 'react-native-jazzicon';
import OnboardingScreenWithBg from '../../../UI/OnboardingScreenWithBg';
import styles from './styles/index';
import TrackingScrollView from '../../../UI/TrackingScrollView';

const diameter = 40;
const spacing = 8;

const sortedCurrencies = infuraCurrencies.objects.sort((a, b) =>
	a.quote.code.toLocaleLowerCase().localeCompare(b.quote.code.toLocaleLowerCase())
);

const infuraCurrencyOptions = sortedCurrencies.map(({ quote: { code, name } }) => ({
	label: `${code.toUpperCase()} - ${name}`,
	key: code,
	value: code
}));
/**
 * Main view for general app configurations
 */
class Settings extends PureComponent {
	static propTypes = {
		/**
		/* State current currency
		*/
		currentCurrency: PropTypes.string,
		/**
		/* navigation object required to push new views
		*/
		navigation: PropTypes.object,
		/**
		 * Called to set the active search engine
		 */
		setSearchEngine: PropTypes.func,
		/**
		 * Called to set primary currency
		 */
		setPrimaryCurrency: PropTypes.func,
		/**
		 * Active search engine
		 */
		searchEngine: PropTypes.string,
		/**
		 * Active primary currency
		 */
		primaryCurrency: PropTypes.string,
		/**
		 * Show a BlockieIcon instead of JazzIcon
		 */
		useBlockieIcon: PropTypes.bool,
		/**
		 * called to toggle BlockieIcon
		 */
		setUseBlockieIcon: PropTypes.func,
		/**
		 * A string that represents the selected address
		 */
		selectedAddress: PropTypes.string,
		/**
		 * A bool that represents if the user wants to hide zero balance token
		 */
		hideZeroBalanceTokens: PropTypes.bool,
		/**
		 * Called to toggle zero balance token display
		 */
		setHideZeroBalanceTokens: PropTypes.func
	};

	static navigationOptions = ({ navigation }) =>
		getNavigationOptionsTitle(strings('app_settings.general_title'), navigation);

	state = {
		currentLanguage: I18n.locale.substr(0, 2),
		languages: {}
	};

	selectCurrency = async currency => {
		const { CurrencyRateController } = Engine.context;
		CurrencyRateController.setCurrentCurrency(currency);
	};

	selectLanguage = language => {
		if (language === this.state.currentLanguage) return;
		setLocale(language);
		this.setState({ currentLanguage: language });
		setTimeout(() => this.props.navigation.navigate('Home'), 100);
	};

	selectSearchEngine = searchEngine => {
		this.props.setSearchEngine(searchEngine);
	};

	selectPrimaryCurrency = primaryCurrency => {
		this.props.setPrimaryCurrency(primaryCurrency);
	};

	toggleHideZeroBalanceTokens = toggleHideZeroBalanceTokens => {
		this.props.setHideZeroBalanceTokens(toggleHideZeroBalanceTokens);
	};

	componentDidMount = () => {
		const languages = getLanguages();
		this.setState({ languages });
		this.languageOptions = Object.keys(languages).map(key => ({ value: key, label: languages[key], key }));
		this.searchEngineOptions = [
			{ value: 'DuckDuckGo', label: 'DuckDuckGo', key: 'DuckDuckGo' },
			{ value: 'Google', label: 'Google', key: 'Google' }
		];
		this.primaryCurrencyOptions = [
			{ value: 'ETH', label: strings('app_settings.primary_currency_text_first'), key: 'Native' },
			{ value: 'Fiat', label: strings('app_settings.primary_currency_text_second'), key: 'Fiat' }
		];
	};

	render() {
		const {
			currentCurrency,
			primaryCurrency,
			useBlockieIcon,
			setUseBlockieIcon,
			selectedAddress,
			hideZeroBalanceTokens
		} = this.props;
		return (
			<OnboardingScreenWithBg screen="a">
				<TrackingScrollView style={styles.wrapper}>
					<View style={styles.inner}>
						<View style={[styles.setting, styles.firstSetting]}>
							<Text style={styles.title}>{strings('app_settings.conversion_title')}</Text>
							<Text style={styles.desc}>{strings('app_settings.conversion_desc')}</Text>
							<View style={styles.picker}>
								<SelectComponent
									selectedValue={currentCurrency}
									onValueChange={this.selectCurrency}
									label={strings('app_settings.current_conversion')}
									options={infuraCurrencyOptions}
								/>
							</View>
						</View>
						<View style={styles.setting}>
							<Text style={styles.title}>{strings('app_settings.primary_currency_title')}</Text>
							<Text style={styles.desc}>{strings('app_settings.primary_currency_desc')}</Text>
							<View style={styles.simplePicker}>
								{this.primaryCurrencyOptions && (
									<PickComponent
										pick={this.selectPrimaryCurrency}
										textFirst={strings('app_settings.primary_currency_text_first')}
										valueFirst={'ETH'}
										textSecond={strings('app_settings.primary_currency_text_second')}
										valueSecond={'Fiat'}
										selectedValue={primaryCurrency}
									/>
								)}
							</View>
						</View>
						<View style={styles.setting}>
							<Text style={styles.title}>{strings('app_settings.current_language')}</Text>
							<Text style={styles.desc}>{strings('app_settings.language_desc')}</Text>
							<View style={styles.picker}>
								{this.languageOptions && (
									<SelectComponent
										selectedValue={this.state.currentLanguage}
										onValueChange={this.selectLanguage}
										label={strings('app_settings.current_language')}
										options={this.languageOptions}
									/>
								)}
							</View>
						</View>
						{/* <View style={styles.setting}>
							<Text style={styles.title}>{strings('app_settings.search_engine')}</Text>
							<Text style={styles.desc}>{strings('app_settings.engine_desc')}</Text>
							<View style={styles.picker}>
								{this.searchEngineOptions && (
									<SelectComponent
										selectedValue={this.props.searchEngine}
										onValueChange={this.selectSearchEngine}
										label={strings('app_settings.search_engine')}
										options={this.searchEngineOptions}
									/>
								)}
							</View>
						</View> */}
						<View style={styles.setting}>
							<Text style={styles.title}>{strings('app_settings.hide_zero_balance_tokens_title')}</Text>
							<Text style={styles.desc}>{strings('app_settings.hide_zero_balance_tokens_desc')}</Text>
							<View style={styles.marginTop}>
								<Switch
									value={hideZeroBalanceTokens}
									onValueChange={this.toggleHideZeroBalanceTokens}
									trackColor={{ true: colors.blue, false: colors.grey200 }}
									ios_backgroundColor={colors.grey000}
								/>
							</View>
						</View>
						<View style={styles.setting}>
							<Text style={styles.title}>{strings('app_settings.accounts_identicon_title')}</Text>
							<Text style={styles.desc}>{strings('app_settings.accounts_identicon_desc')}</Text>
							<View style={styles.identicon_container}>
								<TouchableOpacity
									onPress={() => setUseBlockieIcon(false)}
									style={styles.identicon_row}
									activeOpacity={0.6}
								>
									<View style={[styles.border, !useBlockieIcon && styles.selected]}>
										<Jazzicon size={diameter} address={selectedAddress} />
									</View>
									<Text style={[styles.identicon_type, !useBlockieIcon && styles.selected_text]}>
										{strings('app_settings.jazzicons')}
									</Text>
								</TouchableOpacity>
								<TouchableOpacity
									onPress={() => setUseBlockieIcon(true)}
									style={styles.identicon_row}
									activeOpacity={0.6}
								>
									<View style={[styles.border, useBlockieIcon && styles.selected]}>
										<Image source={{ uri: toDataUrl(selectedAddress) }} style={styles.blockie} />
									</View>
									<Text style={[styles.identicon_type, useBlockieIcon && styles.selected_text]}>
										{strings('app_settings.blockies')}
									</Text>
								</TouchableOpacity>
							</View>
						</View>
					</View>
				</TrackingScrollView>
			</OnboardingScreenWithBg>
		);
	}
}

const mapStateToProps = state => ({
	currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
	searchEngine: state.settings.searchEngine,
	primaryCurrency: state.settings.primaryCurrency,
	useBlockieIcon: state.settings.useBlockieIcon,
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
	hideZeroBalanceTokens: state.settings.hideZeroBalanceTokens
});

const mapDispatchToProps = dispatch => ({
	setSearchEngine: searchEngine => dispatch(setSearchEngine(searchEngine)),
	setPrimaryCurrency: primaryCurrency => dispatch(setPrimaryCurrency(primaryCurrency)),
	setUseBlockieIcon: useBlockieIcon => dispatch(setUseBlockieIcon(useBlockieIcon)),
	setHideZeroBalanceTokens: hideZeroBalanceTokens => dispatch(setHideZeroBalanceTokens(hideZeroBalanceTokens))
});

export default connect(
	mapStateToProps,
	mapDispatchToProps
)(Settings);
