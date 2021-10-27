import React from 'react';
import { Image, StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Text from '../../../Base/Text';
import { colors } from '../../../../styles/common';
import MediaPlayer from './MediaPlayer';
import { Message } from 'react-native-gifted-chat';

const AudioMessage = ({ name, path, incoming, ...props }) => {
  const sender = !incoming;

  const renderAudio = () => {
    alert('nae' + name)
    return (
      <View style={styles.media}>
        <Text style={styles.name}>{name}</Text>
        <MediaPlayer source={path} visible={!!path} />
      </View>
    )
  }

  return (
    <View style={styles.root}>
      <View style={styles.media}>
        <Text style={styles.name}>{name}</Text>
        <MediaPlayer source={path} visible={!!path} />
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    height: 50,
    flexDirection: 'row',
    padding: 10
  },
  media: {
    height: 50,
    backgroundColor: 'red'
  },
  icon: {
    color: colors.white
  },
  bubble: {
    maxWidth: 200,
    marginLeft: 10
  },
  textWhite: {
    color: colors.white,
  },
})
export default AudioMessage;