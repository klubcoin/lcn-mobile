import React from 'react';
import { StyleSheet, View } from 'react-native';
import Text from '../../../Base/Text';
import { colors } from '../../../../styles/common';
import MediaPlayer from './MediaPlayer';

const AudioMessage = ({ name, path, incoming }) => {
  const sender = !incoming;

  return (
    <View style={styles.root}>
      <Text style={[styles.name, sender && styles.textWhite]}>{name}</Text>
      <View style={styles.media}>
        <MediaPlayer source={path} visible={!!path} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: 240,
    flexDirection: 'row',
    padding: 10
  },
  name: {
    flex: 1,
    fontWeight: '600',
  },
  media: {
    width: 80,
  },
  textWhite: {
    color: colors.white,
  },
})
export default AudioMessage;