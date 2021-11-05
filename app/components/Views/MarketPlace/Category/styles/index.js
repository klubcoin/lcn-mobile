import { StyleSheet } from 'react-native';
import { colors } from '../../../../../styles/common';
import { assignNestedObj } from '../../../../../util/object';
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
  category: {
    marginHorizontal: 10,
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
  },
  app: {
    width: 80,
    marginTop: 20,
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