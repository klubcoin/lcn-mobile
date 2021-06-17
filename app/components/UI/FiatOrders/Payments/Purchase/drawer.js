import React from 'react';
import {
  View,
  TouchableOpacity,
  Text
} from 'react-native';
import { createStackNavigator } from 'react-navigation-stack';
import FeatherIcon from 'react-native-vector-icons/Feather';
import Stack from './index'
 
class HeaderLeft extends React.Component{
  constructor(props){
    super(props);
  }

  back(){
    this.props.navigationProps.pop()
  }

  getFeatherIcon(name, size) {
		return <FeatherIcon name={name} size={size || 24} color={'#555'} />;
  }
  
  render(){
    return(
      <View style={{
        flexDirection: 'row'
      }}>
        <TouchableOpacity style={{
          width: 50,
          justifyContent: 'center',
          alignItems: 'center'
        }}
        onPress={() => {
          this.back()
        }}
        >
          {this.getFeatherIcon('menu', 24)}
        </TouchableOpacity>
      </View>
    )
  }
}

const Drawer = createStackNavigator({
  screen: {
    screen: Stack,
    navigationOptions: ({navigation}) => ({
      title: 'Purchase Methods',
      headerLeft: <HeaderLeft navigationProps={navigation} />,
      drawerLabel: 'Purchase Methods',
      headerStyle: {
        backgroundColor: 'white'
      },
      headerRight: null
    })
  }
})


export default Drawer;