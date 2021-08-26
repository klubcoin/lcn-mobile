import React from 'react';
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
const height = Math.round(Dimensions.get('window').height)
export default class PayPal extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      from: {
        currency: 'EUR',
        amount: 0,
      },
      to: {
        currency: 'LCN',
        amount: 0
      },
      currencies: [],
      selected: null,
      errorMessage: null,
      isLoading: false
    }
  }


  getFeatherIcon(name, size) {
    return <FeatherIcon name={name} size={size || 24} color={colors.grey400} />;
  }

  componentDidMount() {
    const { network } = this.props.state;
    if (!network) {
      return
    }
    this.setState({
      isLoading: true
    })
    API.getRequest(network.route + Routes.getConversions, response => {
      if (response.data.length > 0) {
        this.setState({
          currencies: response.data,
          isLoading: false
        })
        this.manageCurrencies()
      } else {
        this.setState({
          currencies: [],
          isLoading: false
        })
      }
    }, error => {
      console.log(error)
      this.setState({
        isLoading: false
      })
    })
  }

  manageCurrencies() {
    const { currencies, from, to } = this.state;
    for (var i = 0; i < currencies.length; i++) {
      let item = currencies[i]
      if (item.from.currency == from.currency && item.to.currency == to.currency) {
        this.setState({
          selected: item
        })
        break
      }
    }
  }

  payWithPayPal() {
    const { from, selected } = this.state;
    if (from == null || selected == null) {
      this.setState({
        errorMessage: 'Fields are required'
      })
      return
    }
    const { network } = this.state
    if (network == null) {
      this.setState({
        errorMessage: 'Invalid network or no network available'
      })
      return
    }
  }

  stepper() {
    const { from, selected } = this.state;
    return (
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
              {this.getFeatherIcon('menu', 24)}
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
  amount() {
    return (
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
            value={this.state.from.amount}
            keyboardType={'numeric'}
            onChangeText={(input) => {
              this.setState({
                from: {
                  ...this.state.from,
                  amount: input
                }
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
  receive() {
    const { network } = this.props.state;
    const { from, selected } = this.state;
    return (
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
          }}>{Helper.APP_NAME} receive(estimate)</Text>

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
            <Text>{this.state.to.currency}</Text>
          </View>
          {
            network && (
              <Text style={{
                width: '100%',
                textAlign: 'center',
                fontSize: 11
              }}>{network.name}</Text>
            )
          }

        </View>
      </View>
    )
  }
  render() {
    const { selected } = this.state;
    return (
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


            {this.amount()}
            <View style={{
              marginLeft: 40
            }}>
              {this.stepper()}
            </View>
            {
              selected && (
                this.receive()
              )
            }


          </View>
        </ScrollView>
        <View style={{
          position: 'absolute',
          bottom: 10,
          width: '100%',
          paddingLeft: 20,
          paddingRight: 20
        }}>
        </View>
      </SafeAreaView>
    )
  }
}