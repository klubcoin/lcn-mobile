import React, { PureComponent } from "react";
import { Image, SafeAreaView, ScrollView, Text, TouchableOpacity, View } from "react-native";
import { connect } from "react-redux";
import styles from "./styles";
import Icon from "react-native-vector-icons/FontAwesome5";
import SearchBar from "../../../Base/SearchBar";
import NavbarTitle from "../../../UI/NavbarTitle";


class MarketCategory extends PureComponent {
  static navigationOptions = () => ({ header: null });

  state = {
    category: {}
  }

  constructor(props) {
    super(props);
    this.state.category = props.navigation.getParam('category');
  }

  showApp = (app) => {
    this.props.navigation.navigate('MarketApp', { app })
  }

  renderCategory = (category) => {
    const { apps } = category;
    return (
      <View style={styles.category}>
        {
          Array(3).fill(1).map(e => {
            return apps && apps.map(e => {
              const { title, desc, icon } = e;
              return (
                <TouchableOpacity
                  style={styles.app}
                  activeOpacity={0.6}
                  onPress={() => this.showApp(e)}
                >
                  <Image source={{ uri: icon }} style={styles.icon} />
                  <Text style={styles.title} numberOfLines={1}>{title}</Text>
                  <Text style={styles.desc} numberOfLines={2}>{desc}</Text>
                </TouchableOpacity>
              )
            })
          })
        }
      </View>
    )
  }

  onBack = () => {
    this.props.navigation.goBack();
  }

  renderNavBar() {
    const { category } = this.state;
    return (
      <SafeAreaView >
        <View style={styles.navBar}>
          <TouchableOpacity onPress={this.onBack.bind(this)} style={styles.navButton}>
            <Icon style={styles.backIcon} name={'arrow-left'} size={16} />
          </TouchableOpacity>
          <NavbarTitle title={category.title} disableNetwork translate={false} />
          <View style={styles.navButton} />
        </View>
      </SafeAreaView>
    )
  }

  render() {
    const { searchQuery, category } = this.state;

    return (
      <View style={styles.root}>
        {this.renderNavBar()}
        <View style={styles.searchBox}>
          <SearchBar
            placeholder={'Search...'}
            value={searchQuery}
            onChange={this.handleSearch}
          />
        </View>
        <ScrollView nestedScrollEnabled>
          {this.renderCategory(category)}
        </ScrollView>
      </View>
    )
  }
}


const mapStateToProps = state => ({
  network: state.engine.backgroundState.NetworkController.network,
  selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
});

export default connect(mapStateToProps)(MarketCategory);