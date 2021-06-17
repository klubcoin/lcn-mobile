import React, { useState, useEffect } from 'react';
import {
  View,
  ScrollView,
  Text,
  Dimensions,
  SafeAreaView,
  TextInput,
  Image,
  TouchableOpacity,
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import { getPayPalNavbar } from '../../../../UI/Navbar';
import ScreenView from '../../components/ScreenView';
import Title from '../../components/Title';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import API from 'services/api'
import Routes from 'common/routes'
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
const height = Math.round(Dimensions.get('window').height);
function PayPal({selectedAddress, ...props}){

 const [from, setFrom] = useState({
  currency: 'EUR',
  amount: 0
 });
 const [to, setTo] = useState({
  currency: 'LCN',
  amount: 0
 });
 const [selected, setSelected] = useState(null);
 const [currencies, setCurrencies] = useState([])
 const [errorMessage, setErrorMessage] = useState(null)
  

  useEffect(() => {
    if(currencies.length == 0){
      API.getRequest(Routes.getConversions, response => {
        if(response.data.length > 0){
          setCurrencies(response.data)
          manageCurrencies()
        }else{
          setCurrencies([])
        }
      }, error => {
        console.log(error)
      })
    }
  });


  manageCurrencies = () => {
    for (var i = 0; i < currencies.length; i++) {
      let item = currencies[i]
      if(item.from.currency == from.currency && item.to.currency == to.currency){
        setSelected(item)
        break
      }
    }
  }

  getFeatherIcon = (name, size) => {
    return (<FeatherIcon name={name} size={size || 24} color={Colors.gray} />)
  }

  payWithPayPal = () => {
    const { from, selected } = this.state;
    if(from == null || selected == null){
      setErrorMessage('Fields are required')
      return
    }
    const { network } = this.state
    if(network == null){
      setErrorMessage('Invalid network or no network available')
      return
    }
  }

  stepper = () => {
    return(
      <View style={{
        borderLeftColor: Colors.lightGray,
        borderLeftWidth: 5,
        paddingLeft: 10
      }}>
        <View style={{
          paddingTop: 10,
          paddingBottom: 10
        }}>
          <Text>Using payment method</Text>
          <TouchableOpacity style={{
            marginTop: 10
          }}>
            <View style={{
              padding: 10,
              width: '40%',
              flexDirection: 'row',
              borderColor: Colors.primary,
              borderWidth: 1,
              borderRadius: 12,
              alignItems: 'center',
            }}>
              {getFeatherIcon('menu', 24)}
              <Text>PayPal</Text>
            </View>
          </TouchableOpacity>
        </View>


        <TouchableOpacity
          style={{
            paddingTop: 10,
            paddingBottom: 10
          }}>
          <Text>See calculation</Text>
        </TouchableOpacity>



        {
          from && (
            <TouchableOpacity style={{
              paddingTop: 10,
              paddingBottom: 10
            }}>
              <Text>{from.amount + ' ' + from.currency}</Text>
            </TouchableOpacity>
          )
        }
        

        {
          (selected && from) && (
            <TouchableOpacity style={{
              paddingTop: 10,
              paddingBottom: 10
            }}>
              <Text>{from.amount * selected.to.value + ' ' + selected.to.currency}</Text>
            </TouchableOpacity>
          )
        }
        


      </View>
    )
  }


  amount = () => {
    return(
      <View style={{
        borderColor: Colors.lightGray,
        borderWidth: 1,
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'row',
        marginTop: 20
      }}>
        <View style={{
          width: '70%',
          paddingTop: 10,
          paddingBottom: 10
        }}>
          <Text style={{
            color: Colors.gray
          }}>You pay</Text>

          <TextInput
            placeholder={'0.00'}
            style={{
              fontSize: 24
            }}
            value={from.amount}
            keyboardType={'numeric'}
            onChangeText={(input) => {
              setFrom({
                ...from,
                amount: input
              })
            }}
            />
        </View>
        <View style={{
          borderLeftWidth: 1,
          borderLeftColor: Colors.lightGray,
          width: '30%',
          paddingTop: 10,
          paddingBottom: 10,
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {/*<Flag
            code="FR"
            size={32}
          />*/}
        </View>
      </View>
    )
  }
  receive = () => {
    return(
      <View style={{
        borderColor: Colors.lightGray,
        borderWidth: 1,
        paddingLeft: 10,
        paddingRight: 10,
        flexDirection: 'row',
      }}>
        <View style={{
          width: '60%',
          paddingTop: 10,
          paddingBottom: 10
        }}>
          <Text style={{
            color: Colors.gray
          }}>receive(estimate)</Text>

          <Text style={{
            fontSize: 24,
            color: Colors.gray,
            paddingTop: 10,
            paddingBottom: 10
          }}>{from.amount * selected.to.value}</Text>

        </View>
        <View style={{
          borderLeftWidth: 1,
          borderLeftColor: Colors.lightGray,
          width: '40%',
          paddingTop: 10,
          paddingBottom: 10,
        }}>
          <View style={{
            alignItems: 'center',
            justifyContent: 'center',
            flexDirection: 'row'
          }}>
            {/*<Image source={require('assets/logo.png')} style={{
              width: 30,
              height: 30
            }}/>*/}
            <Text>LCN</Text>
          </View>
          {/*
            network && (
              <Text style={{
                width: '100%',
                textAlign: 'center',
                fontSize: 11
              }}>{network.name}</Text>
            )
          */}
          
        </View>
      </View>
    )
  }

  console.log(selected)
  return(
    <SafeAreaView style={{
      flex: 1
    }}>
      <ScrollView style={{
      }}
      showsVerticalScrollIndicator={false}
      >
        <View style={{
          paddingLeft: 20,
          paddingRight: 20
        }}>

          <Text style={{
            width: '100%',
            paddingLeft: 20,
            paddingRight: 20,
            paddingTop: 20,
            textAlign: 'center'
          }}>Buy Cryto to your wallet</Text>


          {amount()}
          <View style={{
            marginLeft: 40
          }}>
          {stepper()}
          </View>
          {
            selected && (
              receive()
            )
          }
          

        </View>
      </ScrollView>
      {
        (selected && from && from.amount > 0) && (
          <View style={{
            position: 'absolute',
            bottom: 10,
            width: '100%',
            paddingLeft: 20,
            paddingRight: 20
          }}>
            <TouchableOpacity
              style={{
                borderRadius: 25,
                height: 50,
                backgroundColor: Colors.primary,
                borderColor: Colors.primary,
                borderWidth: 1,
                alignItems: 'center',
                justifyContent: 'center',
                marginTop: 25,
                width: '100%'
              }}

              onPress={() => {
                props.navigation.navigate('BuyWithPayPal')
              }}
              >
              <Text style={{
                color: Colors.white,
              }}>Proceed Checkout</Text>
            </TouchableOpacity>
          </View>
        )
      }
    </SafeAreaView>
  )
}

PayPal.propTypes = {
  selectedAddress: PropTypes.string.isRequired
};

PayPal.navigationOptions = ({ navigation }) => getPayPalNavbar(navigation);

const mapStateToProps = state => ({
  selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress
});

export default connect(mapStateToProps)(PayPal);