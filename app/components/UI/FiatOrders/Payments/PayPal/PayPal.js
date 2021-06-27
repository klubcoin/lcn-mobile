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
  WebView
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
  const { params } = props.navigation.state
  if(!params.url){
    props.navigation.pop()
  }
  return(
    <SafeAreaView style={{
      flex: 1
    }}>
      <WebView
        source={{
          uri: params ? params.url : null
        }}
        style={{ marginTop: 20 }}
      />
    </SafeAreaView>
  )
}

PayPal.propTypes = {
};

PayPal.navigationOptions = ({ navigation }) => getPayPalNavbar(navigation);

const mapStateToProps = state => ({
});

export default connect(mapStateToProps)(PayPal);