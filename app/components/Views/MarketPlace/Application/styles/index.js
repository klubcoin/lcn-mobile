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
  banner: {
    height: 180,
    width: '100%',
    resizeMode: 'cover',
  },
  header: {
    marginTop: 20,
    marginHorizontal: 10,
    flexDirection: 'row'
  },
  about: {
    flex: 1,
    marginLeft: 20,
  },
  icon: {
    width: 70,
    height: 70,
    borderRadius: 20,
  },
  title: {
    marginTop: 5,
    fontSize: 22,
    color: colors.blue,
    fontWeight: '600'
  },
  provider: {
    fontSize: 16,
    fontWeight: '600'
  },
  infoTitle: {
    fontWeight: '600'
  },
  infoDesc: {

  },
  columns: {
    flex: 1,
    width: '100%',
    flexDirection: 'row',
    marginTop: 5,
  },
  spacing: {
    marginLeft: 40
  },
  pricing: {
    marginTop: 20
  },
  price: {
    fontSize: 18,
    fontWeight: '600'
  },
  purchase: {
    marginTop: 10,
    width: 120,
    height: 40,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.green500,
  },
  install: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600'
  },
  body: {
    marginTop: 25,
    marginHorizontal: 20,
    marginBottom: 50,
  },
  desc: {
    fontSize: 14,
  },
  more: {
    color: colors.green400,
    fontWeight: '600',
    marginVertical: 10,
  },
  heading: {
    fontSize: 20,
    fontWeight: '600',
    marginTop: 15,
  },
  user: {
    marginTop: 10,
    fontWeight: '600'
  },
  rating: {
    fontWeight: 'normal'
  },
  comment: {
    marginTop: 3,
    marginBottom: 8,
  },
  info: {
    marginTop: 10,
    flex: 1,
    flexDirection: 'row',
    flexWrap: 'wrap',
  },
  infoColumn: {
    marginTop: 5,
    width: '50%',
  },
});

export default assignNestedObj(styles, brandStyles);