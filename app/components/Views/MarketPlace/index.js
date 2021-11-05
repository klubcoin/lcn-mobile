import React, { PureComponent } from 'react';
import { Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../../../styles/common';
import SearchBar from '../../Base/SearchBar';
import NavbarTitle from '../../UI/NavbarTitle';
import styles from './styles';
import metaCategories from './test';

class MarketPlace extends PureComponent {
  static navigationOptions = () => ({ header: null });

  state = {
    categories: metaCategories,
    activeTab: 0,
    searchQuery: ''
  }

  handleSearch = () => {
    const { searchQuery } = this.state;

  }

  renderCategoryTabs() {
    const { activeTab, categories } = this.state;
    return (
      <View style={styles.tabs}>
        {categories.map((e, index) => {
          const active = index == activeTab;
          return (
            <TouchableOpacity
              style={styles.tab}
              activeOpacity={0.6}
              onPress={() => this.setState({ activeTab: index })}
            >
              <Text style={[styles.tabTitle, active && styles.activeTab]}>{e.title}</Text>
              {active && <View style={styles.tabActive} />}
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  renderCategories = () => {
    const { activeTab, categories } = this.state;
    const tabCategory = categories[activeTab];

    return (
      tabCategory && tabCategory.categories.map(e => this.renderCategory(e))
    )
  }

  showMore = (category) => {
    this.props.navigation.navigate('MarketCategory', { category })
  }

  showApp = (app) => {
    this.props.navigation.navigate('MarketApp', { app })
  }

  renderHeading = (category) => {
    const { title, desc } = category;
    return (
      <View style={styles.sectionHead}>
        <View style={{ flex: 1 }}>
          <Text style={styles.sectionTitle}>{title}</Text>
          {!!desc && <Text style={styles.desc}>{desc}</Text>}
        </View>
        <TouchableOpacity
          style={styles.more}
          activeOpacity={0.6}
          onPress={() => this.showMore(category)}>
          <Icon name={'arrow-right'} size={16} color={colors.blue} />
        </TouchableOpacity>
      </View>
    )
  }

  renderCategory = (category) => {
    const { apps } = category;
    return (
      <View style={styles.category}>
        {this.renderHeading(category)}

        <ScrollView style={styles.apps} horizontal>
          {apps && apps.map(e => {
            const { title, desc, icon } = e;
            return (
              <TouchableOpacity
                style={styles.app}
                activeOpacity={0.6}
                onPress={() => this.showApp(e)}
              >
                <Image source={{ uri: icon }} style={styles.icon} />
                <Text style={styles.title}>{title}</Text>
                <Text style={styles.desc}>{desc}</Text>
              </TouchableOpacity>
            )
          })}
        </ScrollView>
      </View>
    )
  }

  onBack = () => {
    this.props.navigation.navigate('WalletView');
  }

  renderNavBar() {
    return (
      <SafeAreaView >
        <View style={styles.navBar}>
          <TouchableOpacity onPress={this.onBack.bind(this)} style={styles.navButton}>
            <Icon style={styles.backIcon} name={'home'} size={16} />
          </TouchableOpacity>
          <NavbarTitle title={'market.title'} disableNetwork />
          <View style={styles.navButton} />
        </View>
      </SafeAreaView>
    )
  }

  render() {
    const { searchQuery } = this.state;

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
        {this.renderCategoryTabs()}
        <ScrollView style={styles.categories} nestedScrollEnabled>
          {this.renderCategories()}
        </ScrollView>
      </View>
    )
  }
}


const mapStateToProps = state => ({
  network: state.engine.backgroundState.NetworkController.network,
  selectedAddress: state.engine.backgroundState.PreferencesController.selectedAddress,
});

export default connect(mapStateToProps)(MarketPlace);