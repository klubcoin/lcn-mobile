import { StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';
import { assignNestedObj } from '../../../../util/object';
import brandStyles from './brand';

const styles = StyleSheet.create({
  root: {
    flex: 1,
  },
  navBar: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  navButton: {
    width: 32,
    height: 32,
    alignItems: 'center',
    justifyContent: 'center',
  },
  backIcon: {
    color: colors.blue
  },
  logo: {
    width: 60,
    height: 60
  },
  searchBox: {
    marginHorizontal: 20,
  },
  categories: {
    marginBottom: 20,
  },
  tabs: {
    flexDirection: 'row',
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderColor: colors.grey200,
  },
  tab: {
    marginHorizontal: 8,
  },
  tabTitle: {
    fontSize: 14,
    paddingVertical: 5,
    color: colors.grey700,
  },
  activeTab: {
    color: colors.blue,
    fontWeight: '600'
  },
  tabActive: {
    height: 2,
    backgroundColor: colors.blue,
  },
  category: {
    marginHorizontal: 10,
    marginTop: 20,
  },
  sectionHead: {
    flexDirection: 'row'
  },
  sectionTitle: {
    color: colors.blue,
    fontWeight: '600',
    fontSize: 15,
  },
  more: {
    width: 28,
    height: 28,
    alignItems: 'center',
    justifyContent: 'center',
  },
  apps: {
    marginTop: 20,
    flexDirection: 'row',
    paddingBottom: 15,
  },
  app: {
    width: 100,
    marginRight: 10,
  },
  icon: {
    width: 70,
    height: 70,
    borderRadius: 20,
  },
  title: {
    marginTop: 5,
    fontSize: 14,
    color: colors.blue,
    fontWeight: '600'
  },
  desc: {
    marginTop: 5,
    fontSize: 12,
    color: colors.grey500,
  }
});

export default assignNestedObj(styles, brandStyles);