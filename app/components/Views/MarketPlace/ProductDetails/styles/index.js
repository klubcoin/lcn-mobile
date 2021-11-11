import { StyleSheet } from 'react-native';
import { isTablet } from 'react-native-device-info';
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
  image: {
    height: 180,
    width: '100%',
    resizeMode: 'cover',
  },
  header: {
    marginTop: 20,
    marginHorizontal: 10,
  },
  badge: {
    backgroundColor: colors.green600,
    width: 24,
    height: 24,
    borderRadius: 12,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    left: -8,
    bottom: -5,
  },
  counter: {
    color: colors.white,
    fontSize: 14,
  },
  about: {
    flex: 1,
    marginTop: isTablet() ? 0 : 20,
    marginLeft: isTablet() ? 20 : 10,
  },
  title: {
    marginTop: 5,
    fontSize: isTablet() ? 22 : 18,
    color: colors.blue,
    fontWeight: '600'
  },
  category: {
    fontSize: isTablet() ? 16 : 14,
  },
  infoTitle: {
    fontWeight: '600'
  },
  infoDesc: {
    fontSize: 12,
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
    marginTop: 10
  },
  price: {
    fontSize: 20,
    fontWeight: '600',
    color: '#1588C8'
  },
  actions: {
    flexDirection: 'row',
    marginVertical: 10,
  },
  quantityView: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  quantity: {
    width: isTablet() ? 40 : 32,
    height: isTablet() ? 40 : 32,
    fontSize: 18,
    fontWeight: '600',
    textAlign: 'center',
    borderWidth: StyleSheet.hairlineWidth,
    borderColor: colors.grey600,
  },
  adjustQuantity: {
    padding: 8,
  },
  quantityIcon: {
    color: colors.grey600
  },
  purchase: {
    width: 120,
    height: 40,
    marginLeft: 10,
    alignItems: 'center',
    justifyContent: 'center',
    borderRadius: 8,
    backgroundColor: colors.green500,
  },
  addFavorite: {
    marginTop: 10,
    marginLeft: 20,
  },
  favorite: {
    color: colors.red
  },
  addToCart: {
    color: colors.white,
    fontSize: 16,
    fontWeight: '600'
  },
  body: {
    marginTop: 25,
    marginHorizontal: 20,
    marginBottom: 50,
  },
  tags: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginTop: 10
  },
  tagLabel: {
    fontWeight: '600'
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
  chat: {
    backgroundColor: colors.green400,
    width: 45,
    height: 45,
    borderRadius: 25,
    alignItems: 'center',
    justifyContent: 'center',
    position: 'absolute',
    bottom: 40,
    right: 20,
  },
  chatBubble: {
    color: colors.white
  }
});

export default assignNestedObj(styles, brandStyles);