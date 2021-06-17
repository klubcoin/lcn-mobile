import React from 'react';
import {
  View,
  TouchableOpacity,
  Text
} from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import Stack from './index'
// import HeaderLeftWalletConnect from 'modules/generic/Header'
const Drawer = createStackNavigator({
  screen: {
    screen: Stack,
    navigationOptions: ({navigation}) => ({
      title: null,
      headerLeft: null, /*<HeaderLeftWalletConnect navigationProps={navigation} from={'PayPal'}/>,*/
      drawerLabel: null,
      headerStyle: {
        backgroundColor: 'white'
      },
      headerRight: null
    })
  }
})


export default Drawer;