import React from 'react';
import { StyleSheet, View, TouchableOpacity } from 'react-native';
import Text from '../../../Base/Text';
import Icon from 'react-native-vector-icons/FontAwesome';
import { colors } from '../../../../styles/common';
import Share from 'react-native-share';

const FileMessage = ({ name, path, uri, incoming }) => {
  const sender = !incoming;

  const onShare = () => {
    Share.open({
      message: name,
      url: path || uri
    }).catch(err => console.log(err));
  }

  return (
    <View style={styles.root}>
      <TouchableOpacity style={styles.body} onPress={onShare}>
        <Icon name={'file'} size={24} style={[styles.icon, incoming && styles.highlight]} />
        <Text style={[styles.name, sender && styles.textWhite]}>{name}</Text>
      </TouchableOpacity>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: 240,
    padding: 10
  },
  body: {
    flexDirection: 'row',
  },
  icon: {
    color: colors.white
  },
  highlight: {
    color: colors.blue,
  },
  name: {
    flex: 1,
    marginLeft: 10,
    fontWeight: '600',
  },
  textWhite: {
    color: colors.white,
  },
})
export default FileMessage;