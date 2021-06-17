import React from 'react';
import {
  View,
  ScrollView,
  Text,
  Dimensions,
  SafeAreaView,
  TouchableOpacity
} from 'react-native';
const height = Math.round(Dimensions.get('window').height)
import { getPurchaseMethodNavbar } from '../../../../UI/Navbar';
import ScreenView from '../../components/ScreenView';
import Title from '../../components/Title';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
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
}
function Purchase({selectedAddress, ...props}) {
  return(

		<ScreenView>
      <Title />
      <SafeAreaView style={{
        flex: 1
      }}>
        <ScrollView style={{
          flex: 1
        }}
        showsVerticalScrollIndicator={false}
        >
          <View style={{
            paddingLeft: 10,
            paddingRight: 10,
            minHeight: height
          }}>
            <View style={{
              borderRadius: 12,
              borderColor: Colors.primary,
              borderWidth: 1,
              padding: 10,
              backgroundColor: Colors.primary
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                <Text style={{
                  color: Colors.white,
                  fontSize: 24
                }}>PayPal</Text>
              </View>
              <Text style={{
                paddingTop: 10,
                paddingBottom: 10,
                fontWeight: 'bold',
                color: Colors.white
              }}>With Credit/Debit Card</Text>

              <Text style={{
                color: Colors.gray,
                color: Colors.white
              }}>
                Fees vary based from paypal.
              </Text>

              <TouchableOpacity
                style={{
                  borderRadius: 25,
                  height: 50,
                  backgroundColor: 'transparent',
                  borderColor: Colors.white,
                  borderWidth: 1,
                  alignItems: 'center',
                  justifyContent: 'center',
                  marginTop: 25,
                  width: '80%',
                  marginLeft: '10%'
                }}

                onPress={() => {
                  props.navigation.navigate('BuyWithPayPal')
                }}
                >
                <Text style={{
                  color: Colors.white,
                }}>Buy LiquiChain with PayPal</Text>
              </TouchableOpacity>

            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </ScreenView>
  )
}


Purchase.propTypes = {
  selectedAddress: PropTypes.string.isRequired
};

Purchase.navigationOptions = ({ navigation }) => getPurchaseMethodNavbar(navigation);

const mapStateToProps = state => ({
  selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress
});

export default connect(mapStateToProps)(Purchase);