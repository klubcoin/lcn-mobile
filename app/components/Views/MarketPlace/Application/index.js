import React, { PureComponent } from "react";
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";
import Icon from "react-native-vector-icons/FontAwesome5";
import NavbarTitle from "../../../UI/NavbarTitle";
import test from "./test";
import routes from "../../../../common/routes";
import { strings } from "../../../../../locales/i18n";

class MarketApp extends PureComponent {
  static navigationOptions = () => ({ header: null });

  state = {
    app: {}
  }

  constructor(props) {
    super(props);
    this.state.app = props.navigation.getParam('app');
  }

  onBack = () => {
    this.props.navigation.goBack();
  }

  renderNavBar() {
    const { app } = this.state;
    return (
      <SafeAreaView >
        <View style={styles.navBar}>
          <TouchableOpacity onPress={this.onBack.bind(this)} style={styles.navButton}>
            <Icon style={styles.backIcon} name={'arrow-left'} size={16} />
          </TouchableOpacity>
          <NavbarTitle title={app.title} disableNetwork translate={false} />
          <View style={styles.navButton} />
        </View>
      </SafeAreaView>
    )
  }

  render() {
    const { app } = this.state;

    return (
      <View style={styles.root}>
        {this.renderNavBar()}
        <ScrollView nestedScrollEnabled>
          <Image style={styles.banner} source={{ uri: app.banner || test.banner }} />
          <View style={styles.header}>
            <Image style={styles.icon} source={{ uri: app.icon }} />
            <View style={styles.about}>
              <Text style={styles.title} >{app.title}</Text>
              <Text style={styles.provider} >{'Twilio Inc Ltd'}</Text>
              <View style={styles.columns}>
                <View>
                  <Text style={styles.infoTitle} >{'Review'}</Text>
                  <Text style={styles.infoDesc} >{'4.2'}</Text>
                </View>
                <View style={styles.spacing}>
                  <Text style={styles.infoTitle} >{'Downloads'}</Text>
                  <Text style={styles.infoDesc} >{'500+'}</Text>
                </View>
              </View>
              <View style={styles.pricing}>
                <Text style={styles.price} >{`1.2 ${routes.mainNetWork.ticker}`}</Text>
                <TouchableOpacity
                  style={styles.purchase}
                  activeOpacity={0.6}
                  onPress={this.onPurchase}
                >
                  <Text style={styles.install} >{`Purchase`}</Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
          <View style={styles.body}>
            <Text style={styles.desc} >{test.desc}</Text>
            <Text style={styles.more}>{'READ MORE'}</Text>
            <View>
              <Text style={styles.heading} >{'Reviews'}</Text>
              {
                test.reviews.map(e => (
                  <View>
                    <Text style={styles.user} >{e.name}
                      <Text style={styles.rating} > ({e.rating})</Text>
                    </Text>
                    <Text style={styles.comment} >{e.comment}</Text>
                  </View>
                ))
              }
            </View>
            <View>
              <Text style={styles.heading} >{strings('market.additional_info')}</Text>
              <View style={styles.info}>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoTitle} >{strings('market.provided_by')}</Text>
                  <Text style={styles.infoDesc} >{'MobiStar'}</Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoTitle} >{strings('market.developer')}</Text>
                  <Text style={styles.infoDesc} >{'Haris Jenny'}</Text>
                  <Text style={styles.infoDesc} >{'Tom May'}</Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoTitle} >{'Support email'}</Text>
                  <Text style={styles.infoDesc} >{'support@twi.com'}</Text>
                </View>
                <View style={styles.infoColumn}>
                  <Text style={styles.infoTitle} >{'Contact phone'}</Text>
                  <Text style={styles.infoDesc} >{'+123456789'}</Text>
                </View>
              </View>
              <View>
                <Text style={styles.heading} >{'Other apps from this provider'}</Text>
                <Text>....</Text>
              </View>
              <View>
                <Text style={styles.heading} >{'Related apps'}</Text>
                <Text>....</Text>
              </View>
            </View>
          </View>
        </ScrollView>
      </View>
    )
  }
}


const mapStateToProps = state => ({
  network: state.engine.backgroundState.NetworkController.network,
  selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
});

export default connect(mapStateToProps)(MarketApp);