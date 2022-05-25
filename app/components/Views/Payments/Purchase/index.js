import React from 'react';
import { View, Text, Dimensions, SafeAreaView } from 'react-native';
const height = Math.round(Dimensions.get('window').height);
import { getPurchaseMethodNavbar } from '../../.../UI/Navbar';
import ScreenView from '../components/ScreenView';
import Title from '../components/Title';
import { connect } from 'react-redux';
import TrackingScrollView from '../../../UI/TrackingScrollView';
const Colors = {
	primary: '#370e75',
	secondary: '#eee',
	warning: '#FFCC00',
	danger: '#FF0000',
	lightGray: '#eee',
	container: '#eee',
	black: '#000',
	white: '#fff',
	gray: '#555'
};
function Purchase({ selectedAddress, ...props }) {
	return (
		<SafeAreaView
			style={{
				flex: 1
			}}
		>
			<TrackingScrollView
				style={{
					flex: 1
				}}
				showsVerticalScrollIndicator={false}
			>
				<View
					style={{
						paddingLeft: 10,
						paddingRight: 10,
						minHeight: height
					}}
				>
					<View
						style={{
							borderRadius: 12,
							borderColor: 'red',
							borderWidth: 1,
							padding: 10
						}}
					>
						<View
							style={{
								flexDirection: 'row',
								alignItems: 'center'
							}}
						>
							{/*<FontAwesomeIcon icon={faPaypal} color={Colors.primary} size={20}/>*/}
							<Text
								style={{
									paddingLeft: 10
								}}
							>
								PayPal
							</Text>
						</View>
						<Text
							style={{
								paddingTop: 10,
								paddingBottom: 10,
								fontWeight: 'bold'
							}}
						>
							With Credit/Debit Card
						</Text>

						<Text
							style={{
								color: Colors.gray
							}}
						>
							Fees vary based from paypal.
						</Text>

						{/*<GenericButton
              title={'Buy LiquiChain with PayPal'}
              style={{
                backgroundColor: Colors.primary,
                width: '100%',
                marginTop: 20
              }}
              textStyle={{
                fontWeight: 'bold',
                color: Colors.white
              }}
              onClick={() => {
                this.props.navigation.navigate('paypalStack')
              }}
            />*/}
					</View>
				</View>
			</TrackingScrollView>
		</SafeAreaView>
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
