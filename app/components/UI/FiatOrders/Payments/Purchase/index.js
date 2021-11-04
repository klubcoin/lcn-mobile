import React from 'react';
import { View, ScrollView, Text, Dimensions, SafeAreaView, TouchableOpacity, Image } from 'react-native';
import { getPurchaseMethodNavbar } from '../../../../UI/Navbar';
import ScreenView from '../../components/ScreenView';
import Title from '../../components/Title';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import OnboardingScreenWithBg from '../../../OnboardingScreenWithBg';
import { styles } from './styles/index';
import { brandStyles } from './styles/brand';
import StyledButton from '../../../StyledButton';
import { displayName } from '../../../../../../app.json';

function Purchase({ selectedAddress, ...props }) {
	const onBuy = () => {
		props.navigation.navigate('BuyWithPayPal');
	};

	return (
		<OnboardingScreenWithBg screen="a">
			{/* <ScreenView> */}
			<Title />
			<SafeAreaView style={styles.wrapper}>
				<ScrollView style={styles.scrollView} showsVerticalScrollIndicator={false}>
					<View style={[styles.card, brandStyles.card]}>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center'
							}}
						>
							<Image
								source={require('../../../../../images/paypal_logo.png')}
								style={styles.paypalIc}
								resizeMode={'contain'}
							/>
							<Text style={[styles.paypal, brandStyles.paypal]}>PayPal</Text>
						</View>
						<Text style={styles.creditCard}>With Credit/Debit Card</Text>
						<Text style={styles.fee}>Fees vary based from paypal.</Text>
						<View style={{ marginBottom: 5 }}>
							<StyledButton type={'normal'} onPress={onBuy}>
								Buy {displayName} with PayPal
							</StyledButton>
						</View>
					</View>
				</ScrollView>
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
