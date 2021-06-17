import React from 'react';
import { connect, Provider } from 'react-redux';
import { createStore }  from 'redux';
import rootReducer from '@redux';
import { createAppContainer }  from 'react-navigation';
import AppNavigation from 'navigation';
import Colors from 'common/Colors';
import {
  View
} from 'react-native';

const AppContainer = createAppContainer(AppNavigation);

class ReduxNavigation extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return (
      <View style={{
        flex: 1
      }}>
        <AppContainer />
      </View>
    )
  }
}

const mapStateToProps = state => ({ state: state })
const mapDispatchToProps = dispatch => {
  const { actions } = require('@redux')
  return {
    // method: (params) => dispatch(actions.method(params))
  }
}

let AppReduxNavigation = connect(mapStateToProps, mapDispatchToProps)(ReduxNavigation);
const store = createStore(rootReducer)

export default class App extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <Provider store={store}>
        <View style={{
          flex: 1,
          backgroundColor: Colors.container
        }}>
          <AppReduxNavigation />
        </View>
      </Provider>
    )
  }
}