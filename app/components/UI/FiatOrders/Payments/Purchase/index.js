import React from 'react';
import { View, Text, Dimensions, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { getPurchaseMethodNavbar } from '../../../../UI/Navbar';
import ScreenView from '../../components/ScreenView';
import Title from '../../components/Title';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import OnboardingScreenWithBg from '../../../OnboardingScreenWithBg';
import styles from './styles/index';
import { displayName } from '../../../../../../app.json';
import PaymentMethodItem from './PurchaseMethod';
import drawables from '../../../../../common/drawables';
import TrackingScrollView from '../../../TrackingScrollView';

function Purchase({ selectedAddress, ...props }) {
	const onBuy = () => {
		props.navigation.navigate('BuyWithPayPal');
	};

	return (
		<OnboardingScreenWithBg screen="a">
			{/* <ScreenView> */}
			<Title />
			<SafeAreaView style={styles.wrapper}>
				<TrackingScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
					<PaymentMethodItem
						onBuy={onBuy}
						displayName={displayName}
						image={require('../../../../../images/paypal_logo.png')}
						typeText={'PayPal'}
					/>

					<PaymentMethodItem
						onBuy={onBuy}
						displayName={displayName}
						image={require('../../../../../images/stripe.png')}
						typeText={'Stripe'}
					/>
				</TrackingScrollView>
			</SafeAreaView>
			{/* </ScreenView> */}
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
