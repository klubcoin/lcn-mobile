import React, { PureComponent } from 'react';
import { Dimensions, Image, ScrollView, Text, TouchableOpacity, View } from 'react-native';
import { connect } from 'react-redux';
import { SafeAreaView } from 'react-native-safe-area-context';
import AppIntroSlider from 'react-native-app-intro-slider';
import Icon from 'react-native-vector-icons/FontAwesome5';
import { colors } from '../../../styles/common';
import SearchBar from '../../Base/SearchBar';
import NavbarTitle from '../../UI/NavbarTitle';
import styles from './styles';
import metaCategories, { photos } from './test';
import APIService from '../../../services/APIService';
import preferences from '../../../store/preferences';
import store from './store';
import LinearGrad from '../../Base/LinearGrad';
import test from './test';
import { menuKeys } from './Drawer';

const window = Dimensions.get('window');
const screenWidth = window.width;
const screenHeight = window.height;

class MarketPlace extends PureComponent {
  static navigationOptions = () => ({ header: null });

  state = {
    categories: metaCategories,
    activeTab: 0,
    searchQuery: ''
  }

  componentDidMount() {
    store.marketMenuKey = menuKeys().shopping;
    this.fetchCategories();
    this.slideAnimate();
  }

  slideAnimate() {
    this.animateTrending();
    this.animateAdSlide();
  }

  animateTrending() {
    this.trendSlideIndex = 0;
    setInterval(() => {
      this.trendSlideIndex++;
      if (this.trendSlideIndex >= photos.length / 3) {
        this.trendSlideIndex = 0;
      }
      this.sliderTrend && this.sliderTrend.goToSlide(this.trendSlideIndex);
    }, 3000);
  }

  animateAdSlide() {
    this.adSlideIndex = 0;
    setInterval(() => {
      this.adSlideIndex++;
      if (this.adSlideIndex >= photos.length) {
        this.adSlideIndex = 0;
      }
      this.sliderAds && this.sliderAds.goToSlide(this.adSlideIndex);
    }, 2400);
  }

  fetchCategories() {
    APIService.getMarketCategories((success, json) => {
      console.log('wowow', json)
      if (success && json) {
        store.saveProductCategories(json);
        this.setState({ categories: [...json] })
      }
    })
  }

  handleSearch = (text) => {
    const { searchQuery } = this.state;
    this.setState({ searchQuery: text })
  }

  renderCategoryTabs() {
    const { activeTab } = this.state;
    const categories = test;
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

  renderCategorySlide = ({ index }) => {
    const { categories } = this.state;
    const size = 5;
    const start = index * size;
    const items = categories.slice(start, start + size);
    if (items.length != size) {
      Array(size - items.length).fill(0).map(() => items.push(false));
    }

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
        {
          items.map((e, i) => {
            const { name } = e || {};
            const blank = !name;
            return (
              blank
                ? <View style={{ width: 64 }} />
                : <View style={{ width: 64 }}>
                  <View style={{
                    width: 56, height: 56, borderRadius: 28, backgroundColor: colors.white100,
                    alignItems: 'center', justifyContent: 'center'
                  }}>
                    <Image style={{ width: 32, height: 32 }} source={{ uri: photos[(index + i) % photos.length] }} />
                  </View>
                  <Text numberOfLines={2} style={{ textAlign: 'center', marginTop: 5 }}>{name}</Text>
                </View>
            )
          })
        }
      </View>

    )
  }

  onCategorySlideChange = (index, bnum) => {
    alert(bnum)
  }

  renderCategoryBubbles = () => {
    const { categories } = this.state;
    const slideCount = Math.ceil(categories.length / 5);
    return (
      <AppIntroSlider
        ref={e => this.sliderCateBubble = e}
        showSkipButton={false}
        showPrevButton={true}
        showNextButton={false}
        showDoneButton={false}
        renderPagination={() => null}
        data={Array(slideCount).fill(0)}
        onSlideChange={(index, bnum) => this.onCategorySlideChange(index, bnum)}
        renderItem={this.renderCategorySlide}
        dotStyle={styles.dotStyles}
        activeDotStyle={styles.dotActive}
      />
    )
  }

  renderTrendingSlide = ({ index }) => {
    const size = 3;
    const start = index * size;
    const items = photos.slice(start, start + size);
    if (items.length != size) {
      Array(size - items.length).fill(0).map(() => items.push(false));
    }
    const width = (screenWidth - 40) / 3 - 20;

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
        {
          items.map((e, i) => {
            const { name } = e || {};
            const blank = !e;
            return (
              blank
                ? <View style={{ width }} />
                : <View style={{ width, alignItems: 'center' }}>
                  <Image style={{ width, height: width }} source={{ uri: photos[(index + i) % photos.length] }} />
                  <Text numberOfLines={1} style={{ textAlign: 'center', marginTop: 5, color: '#f84880', fontWeight: 'bold' }}>{'$89'}</Text>
                  <Text numberOfLines={1} style={{ textAlign: 'center', textDecorationLine: 'line-through', color: colors.grey500 }}>{'$99'}</Text>
                  <Text numberOfLines={2} style={{ textAlign: 'center', color: colors.grey }}>{'Best buy'}</Text>
                </View>
            )
          })
        }
      </View>

    )
  }

  renderAdsSlide = ({ index }) => {
    const size = 1;
    const start = index * size;
    const items = photos.slice(start, start + size);
    if (items.length != size) {
      Array(size - items.length).fill(0).map(() => items.push(false));
    }
    const width = (screenWidth - 40) / size - 20;

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
        {
          items.map((e, i) => {
            const { name } = e || {};
            const blank = !e;
            return (
              blank
                ? <View style={{ width }} />
                : <View style={{ width, alignItems: 'center' }}>
                  <Image style={{ width, height: 140 }} source={{ uri: photos[(index + i * 3 + 2) % photos.length] }} />
                </View>
            )
          })
        }
      </View>

    )
  }

  renderAds = () => {
    return (
      <AppIntroSlider
        ref={e => this.sliderAds = e}
        showSkipButton={false}
        showPrevButton={true}
        showNextButton={false}
        showDoneButton={false}
        renderPagination={() => null}
        data={photos}
        renderItem={this.renderAdsSlide}
        dotStyle={styles.dotStyles}
        activeDotStyle={styles.dotActive}
      />
    )
  }

  renderTrending = () => {
    const slideCount = Math.ceil(photos.length / 3);
    return (
      <AppIntroSlider
        ref={e => this.sliderTrend = e}
        showSkipButton={false}
        showPrevButton={true}
        showNextButton={false}
        showDoneButton={false}
        renderPagination={() => null}
        data={Array(slideCount).fill(0)}
        renderItem={this.renderTrendingSlide}
        dotStyle={styles.dotStyles}
        activeDotStyle={styles.dotActive}
      />
    )
  }

  renderPromotionSlide = ({ index }) => {
    const size = 3;
    const start = index * size;
    const items = photos.slice(start, start + size);
    if (items.length != size) {
      Array(size - items.length).fill(0).map(() => items.push(false));
    }
    const width = (screenWidth - 40) / size - 20;

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
        {
          items.map((e, i) => {
            const { name } = e || {};
            const blank = !e;
            return (
              blank
                ? <View style={{ width }} />
                : <View style={{ width, alignItems: 'center' }}>
                  <Image style={{ width, height: width }} source={{ uri: photos[(index + i * 2 + 1) % photos.length] }} />
                  <Text numberOfLines={1} style={{ textAlign: 'center', marginTop: 5, color: '#f84880', fontWeight: 'bold' }}>{'$89'}</Text>
                  <Text numberOfLines={1} style={{ textAlign: 'center', textDecorationLine: 'line-through', color: colors.grey500 }}>{'$99'}</Text>
                </View>
            )
          })
        }
      </View>

    )
  }

  renderPromotions = () => {
    const slideCount = Math.ceil(photos.length / 3);
    return (
      <AppIntroSlider
        ref={e => this.sliderPromo = e}
        showSkipButton={false}
        showPrevButton={true}
        showNextButton={false}
        showDoneButton={false}
        renderPagination={() => null}
        data={Array(slideCount).fill(0)}
        renderItem={this.renderPromotionSlide}
        dotStyle={styles.dotStyles}
        activeDotStyle={styles.dotActive}
      />
    )
  }

  renderTodayOfferSlide = ({ index }) => {
    const size = 2;
    const start = index * size;
    const items = photos.slice(start, start + size);
    if (items.length != size) {
      Array(size - items.length).fill(0).map(() => items.push(false));
    }
    const width = (screenWidth - 40) / size - 20;

    return (
      <View style={{ flexDirection: 'row', justifyContent: 'space-evenly' }}>
        {
          items.map((e, i) => {
            const { name } = e || {};
            const blank = !e;
            return (
              blank
                ? <View style={{ width }} />
                : <View style={{ width, alignItems: 'center' }}>
                  <Image style={{ width, height: width }} source={{ uri: photos[(index + i * 3 + 2) % photos.length] }} />
                  <Text numberOfLines={1} style={{ textAlign: 'center', marginTop: 5, color: '#f84880', fontWeight: 'bold' }}>{'$89'}</Text>
                  <Text numberOfLines={1} style={{ textAlign: 'center', textDecorationLine: 'line-through', color: colors.grey500 }}>{'$99'}</Text>
                </View>
            )
          })
        }
      </View>

    )
  }

  renderTodayOffer = () => {
    const slideCount = Math.ceil(photos.length / 3);
    return (
      <AppIntroSlider
        ref={e => this.sliderOffer = e}
        showSkipButton={false}
        showPrevButton={true}
        showNextButton={false}
        showDoneButton={false}
        renderPagination={() => null}
        data={Array(slideCount).fill(0)}
        renderItem={this.renderTodayOfferSlide}
        dotStyle={styles.dotStyles}
        activeDotStyle={styles.dotActive}
      />
    )
  }

  renderCategories = () => {
    const { activeTab } = this.state;
    const categories = test;
    const tabCategory = categories[activeTab];

    return (
      this.renderCategory(tabCategory.categories[0])
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
    const { activeTab } = this.state;
    const { apps } = category;
    return (
      <View style={styles.category}>
        {apps && apps.map((e, index) => {
          const photo = photos[(activeTab * 3 + index) % photos.length];
          return (
            <TouchableOpacity
              style={styles.app}
              activeOpacity={0.6}
              onPress={() => this.showApp(e)}
            >
              <Image source={{ uri: photo }} style={styles.icon} />
              <Text numberOfLines={2} style={{ textAlign: 'center', color: colors.grey }}>{'Awesome product name and brief description'}</Text>
              <Text numberOfLines={1} style={{ textAlign: 'center', marginTop: 5, color: '#f84880', fontWeight: 'bold' }}>{'$89'}</Text>
              <Text numberOfLines={1} style={{ textAlign: 'center', textDecorationLine: 'line-through', color: colors.grey500 }}>{'$99'}</Text>
            </TouchableOpacity>
          )
        })}
      </View>
    )
  }

  onBack = () => {
    this.props.navigation.navigate('WalletView');
  }

  toggleDrawer = () => {
    this.props.navigation.toggleDrawer();
  }

  renderNavBar() {
    return (
      <SafeAreaView >
        <View style={styles.navBar}>
          <TouchableOpacity onPress={this.toggleDrawer.bind(this)} style={styles.navButton}>
            <Icon style={styles.backIcon} name={'bars'} size={16} />
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
            hideIcon
            containerStyle={styles.search}
            placeholder={'Search...'}
            value={searchQuery}
            onChange={this.handleSearch}
          />
          <TouchableOpacity
            onPress={this.handleSearch}
            style={styles.searchButton}
            activeOpacity={0.6}
          >
            <LinearGrad
              start={{ x: 0, y: 1 }}
              end={{ x: 1, y: 1 }}
              colors={['#e88e0e', '#e83e3e']}
            />
            <Icon name="search" size={18} style={styles.searchIcon} />
          </TouchableOpacity>
        </View>
        <ScrollView style={styles.categories} nestedScrollEnabled>
          {this.renderCategoryBubbles()}
          <View style={{ marginTop: 20, paddingTop: 20, backgroundColor: colors.white }}  >
            {this.renderTrending()}
          </View>
          <View style={{ paddingTop: 30, backgroundColor: colors.white }}>
            {this.renderAds()}
          </View>
          <View style={{ paddingTop: 30, backgroundColor: colors.white }}  >
            <View style={{ marginHorizontal: 20 }}>
              {this.renderHeading({
                title: 'Flash Sale',
                // desc: 'Good deal'
              })}
            </View>
            {this.renderPromotions()}
          </View>
          <View style={{ paddingTop: 30, backgroundColor: colors.white }}>
            <View style={{ marginHorizontal: 20 }}>
              {this.renderHeading({
                title: 'Today Offer',
                desc: 'Just for you'
              })}
            </View>
            {this.renderTodayOffer()}
          </View>
          <View style={{ paddingTop: 30, paddingBottom: 40, backgroundColor: colors.white }}  >
            {this.renderCategoryTabs()}
            {this.renderCategories()}
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

export default connect(mapStateToProps)(MarketPlace);