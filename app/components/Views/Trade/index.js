import React, { PureComponent } from 'react';
import { Text, View, TouchableOpacity, Image } from 'react-native';
import { inject, observer } from 'mobx-react';
import OnboardingScreenWithBg from '../../UI/OnboardingScreenWithBg';
import { getTradeNavbar } from '../../UI/Navbar';
import { strings } from '../../../../locales/i18n';
import TrackingScrollView from '../../UI/TrackingScrollView';
import styles from './styles';

const kucoinIcon = require('../../../images/kucoin_logo.png');

class Trade extends PureComponent {
	static navigationOptions = ({ navigation }) => {
		return getTradeNavbar(navigation);
	};

	renderItem() {
		return (
			<View style={styles.itemWrapper}>
				<View style={styles.itemHeader}>
					<View style={styles.iconWrapper}>
						<Image style={styles.icon} source={kucoinIcon} />
					</View>
					<Text style={styles.itemHeaderText}>{strings('trade.kucoin').toUpperCase()}</Text>
				</View>
				<Text style={styles.itemDescription}>{strings('trade.kucoin_description')}</Text>
				<TouchableOpacity style={styles.tradeButton} activeOpacity={0.7}>
					<Text style={styles.tradeButtonText}>{`${strings('trade.trade')} KlubCoins ${strings(
						'trade.with'
					)} ${strings('trade.kucoin')}`}</Text>
				</TouchableOpacity>
			</View>
		);
	}

	render() {
		return (
			<OnboardingScreenWithBg screen="a">
				<TrackingScrollView contentContainerStyle={styles.container}>
					<Text style={styles.description}>{strings('trade.trade_description')}</Text>
					{this.renderItem()}
				</TrackingScrollView>
			</OnboardingScreenWithBg>
		);
	}
}

export default inject('store')(observer(Trade));
