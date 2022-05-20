import React from 'react';
import { SafeAreaView } from 'react-native';
import { getPurchaseMethodNavbar } from '../../../../UI/Navbar';
import Title from '../../components/Title';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import OnboardingScreenWithBg from '../../../OnboardingScreenWithBg';
import styles from './styles/index';
import { displayName } from '../../../../../../app.json';
import PaymentMethodItem from './PurchaseMethod';
import TrackingScrollView from '../../../TrackingScrollView';

function Purchase({ selectedAddress, ...props }) {
	const onBuyWithPayPal = () => {
		props.navigation.navigate('BuyWithPayPal');
	};

	const onBuyWithWyre = () => {
		props.navigation.navigate('BuyWithWyre');
	};

	return (
		<OnboardingScreenWithBg screen="a">
			<Title />
			<SafeAreaView style={styles.wrapper}>
				<TrackingScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
					<PaymentMethodItem
						onBuy={onBuyWithPayPal}
						displayName={displayName}
						image={require('../../../../../images/paypal_logo.png')}
						typeText={'PayPal'}
					/>

					{/* <PaymentMethodItem
						onBuy={onBuyWithWyre}
						displayName={displayName}
						image={require('../../../../../images/wyre.png')}
						typeText={'Wyre'}
					/> */}
				</TrackingScrollView>
			</SafeAreaView>
		</OnboardingScreenWithBg>
	);
}

Purchase.propTypes = {
	selectedAddress: PropTypes.string.isRequired
};

Purchase.navigationOptions = ({ navigation }) => getPurchaseMethodNavbar(navigation);

const mapStateToProps = state => ({
	selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress
});

export default connect(mapStateToProps)(Purchase);
