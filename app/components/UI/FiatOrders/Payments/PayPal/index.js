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
  ActivityIndicator
} from 'react-native';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Icon from 'react-native-vector-icons/FontAwesome';
import { getPayPalNavbar } from '../../../../UI/Navbar';
import ScreenView from '../../components/ScreenView';
import Title from '../../components/Title';
import { connect } from 'react-redux';
import PropTypes from 'prop-types';
import API from 'services/api'
import Routes from 'common/routes'
import Engine from '@core/Engine'
import { renderAccountName } from '@util/address';
import { renderFromWei, weiToFiat, hexToBN } from '@util/number';
import { getTicker } from '@util/transactions';
import { WebView } from 'react-native-webview';
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
const width = Math.round(Dimensions.get('window').width);
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
 const { AssetsDetectionController, AccountTrackerController } = Engine.context;
 const [payPalUrl, setPayPalUrl] = useState(null)
 const [orderId, setOrderId] = useState(null)

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

  paypalDirect = () => {
    API.paypalPostRequest(response => {
      console.log(response)
      if(response && response.access_token != null){
        API.paypalCreateOrderRequest({
          intent: 'CAPTURE',
          purchase_units: [{
            amount: {
              currency_code: 'USD',
              value: "100.00"
            }
          }]
        }, response.access_token, orderResponse => {
          console.log(orderResponse)
          if(orderResponse && (orderResponse.links || (orderResponse.links && orderResponse.links.length > 0))){
            orderResponse.links.map((item) => {
              if(item.rel == 'approve'){
                console.log('load link', item.href)
                setPayPalUrl(item.href) 
              }
            })
          }
        }, errorOrderResponse => {
          console.log('error', errorOrderResponse.message)
        })
      }
    }, error => {
      console.log(error)
    })
  }

  capturePayPalOrder = (url) => {
    if(orderId == null){
      return
    }
    console.log('orderId', orderId)
    API.standardPostRequest(Routes.paypalPaymentCapture + '/' + orderId, params, response => {
      if(response){
        // success
        props.navigation.navigate('PurchaseMethods')
      }else{
        // error
        // alert error here
        props.navigation.navigate('PurchaseMethods')
      }
    }, error => {
      // alert error here
      console.log('error', error.message)
      props.navigation.navigate('PurchaseMethods')
    }) 
  }

  manageRequest = (url) => {
    if(url && url.includes("error")){
      console.log('navigate to PurchaseMethods')
      props.navigation.navigate('PurchaseMethods')
    }else if(url && url.includes("success")){
      capturePayPalOrder(url)
    }else{
      // unknown url
      capturePayPalOrder()
    }
  }

  payWithPayPal = () => {

    console.log({
      selectedAddress
    })

    if(from == null || selected == null){
      setErrorMessage('Fields are required')
      return
    }

    if(from.amount <= 0){
      setErrorMessage('Amount must be greater than 0')
      return
    }

    if(selectedAddress == null){
      return
    }

    let address = selectedAddress.selectedAddress

    let params = {
      from,
      to,
      account: address ? address.substring(2, address.length) : null,
      // account: 'B51b96f26923F5c9Ac438E0D74E0cD8F5171F412'
    }

    console.log(params)

    API.standardPostRequest(Routes.paypalCreateOrder, params, response => {
      if(response && response.links.length > 0){
        setOrderId(response.id)
        response.links.map((item) => {
          if(item.rel == 'approve'){
            console.log('load link', item.href)
            setPayPalUrl(item.href) 
          }
        })
      }else{
        // error
      }
    }, error => {
      console.log('error', error.message)
    })
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
              width: '50%',
              flexDirection: 'row',
              borderColor: Colors.primary,
              borderWidth: 1,
              borderRadius: 12,
              alignItems: 'center',
            }}>
              <Icon name={'paypal'} size={22} color={Colors.primary} />
              <Text style={{
                paddingLeft: 10
              }}>PayPal</Text>
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
          alignItems: 'center',
          justifyContent: 'center'
        }}>
          {
            from && (
              <Text style={{
                fontSize: 24,
                color: Colors.primary
              }}>{from.currency}</Text>
            )
          }
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
          }}>Receive(estimate)</Text>

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
            flexDirection: 'row',
            flex: 1
          }}>
            <Image source={require('images/logo.png')} style={{
              width: 30,
              height: 30
            }}/>
            {
              to && (
                <Text style={{
                  fontSize: 24,
                  color: Colors.primary
                }}>{to.currency}</Text>
              )
            }
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

  return(
    <SafeAreaView style={{
      flex: 1,
      width: '100%',
      height: '100%'
    }}>

      {
        payPalUrl == null && (
          <ScrollView style={{
          }}
          showsVerticalScrollIndicator={false}
          >
            <View style={{
              paddingLeft: 20,
              paddingRight: 20
            }}
            >
              <View>
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
            </View>
        </ScrollView>)
      }

      {
        payPalUrl !== null && (
          <WebView
            source={{ uri: payPalUrl }}
            startInLoadingState={true}
            renderLoading={() => (<View style={{
              flex: 1,
              justifyContent: 'center',
              alignItems: 'center',
              height: '100%',
              width: '100%',
              top: -(height * 0.25)
            }}>
                <ActivityIndicator size="large" color={Colors.primary} />
              </View>
            )}
            onLoadEnd={() => {
              console.log('Loaded')
            }}
            onShouldStartLoadWithRequest={(request) => {
              if(request && request.url.startsWith('https://www.sandbox.paypal.com')){
                console.log('This should load')
                return true
              }else if(request){
                manageRequest(request.url)
                return false
              }else{
                return false
              }
            }}
            />
        )
      }
      {
        (selected && from && from.amount > 0 && payPalUrl == null) && (
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
                payWithPayPal()
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
  selectedAddress: PropTypes.string,
  accounts: PropTypes.object,
  identities: PropTypes.object,
  chainId: PropTypes.string,
  ticker: PropTypes.string,
  currentCurrency: PropTypes.string,
  tokens: PropTypes.array,
  currentCurrency: PropTypes.string,
};

PayPal.navigationOptions = ({ navigation }) => getPayPalNavbar(navigation);

const mapStateToProps = state => ({
  tokens: state.engine.backgroundState.AssetsController.tokens,
  accounts: state.engine.backgroundState.AccountTrackerController.accounts,
  currentCurrency: state.engine.backgroundState.CurrencyRateController.currentCurrency,
  selectedAddress: state.engine.backgroundState.PreferencesController,
  identities: state.engine.backgroundState.PreferencesController.identities,
  chainId: state.engine.backgroundState.NetworkController.provider.chainId,
  ticker: state.engine.backgroundState.NetworkController.provider.ticker,
  conversionRate: state.engine.backgroundState.CurrencyRateController.conversionRate,
});

export default connect(mapStateToProps)(PayPal);