import React from 'react';
import {
  View,
  ScrollView,
  Text,
  Dimensions,
  SafeAreaView
} from 'react-native';
const height = Math.round(Dimensions.get('window').height)
class Purchase extends React.Component{
  constructor(props){
    super(props);
  }

  render(){
    return(
      <SafeAreaView style={{
        flex: 1
      }}>
        <ScrollView style={{
          ...BasicStyles.scrollViewContainer
        }}
        showsVerticalScrollIndicator={false}
        >
          <View style={{
            paddingLeft: 10,
            paddingRight: 10,
            minHeight: height
          }}>
            <View style={{
              ...BasicStyles.borderRadius,
              borderColor: 'red',
              borderWidth: 1,
              padding: 10
            }}>
              <View style={{
                flexDirection: 'row',
                alignItems: 'center'
              }}>
                {/*<FontAwesomeIcon icon={faPaypal} color={Colors.primary} size={20}/>*/}
                <Text style={{
                  ...BasicStyles.subTitleText,
                  paddingLeft: 10
                }}>PayPal</Text>
              </View>
              <Text style={{
                paddingTop: 10,
                paddingBottom: 10,
                fontWeight: 'bold'
              }}>With Credit/Debit Card</Text>

              <Text style={{
                color: Colors.gray
              }}>
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
        </ScrollView>
      </SafeAreaView>
    )
  }
}

const mapStateToProps = state => ({ state: state })
const mapDispatchToProps = dispatch => {
  return {
    // method: (params) => dispatch(actions.method(params))
  }
}

export default connect(mapStateToProps, mapDispatchToProps)(Purchase);
