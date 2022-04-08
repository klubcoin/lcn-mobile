import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { MessageImage } from 'react-native-gifted-chat';
import { colors } from '../../../../styles/common';

const ImageMessage = ({ loading, ...props }) => {
  return (
    <View style={styles.root}>
      {loading ? <ActivityIndicator color={colors.white} /> : <MessageImage currentMessage={props} />}
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    width: 180,
    height: 120,
    alignItems: 'center',
    justifyContent: 'center',
  },
})
export default ImageMessage;