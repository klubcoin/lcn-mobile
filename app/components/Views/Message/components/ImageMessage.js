import React from 'react';
import { ActivityIndicator, StyleSheet, View } from 'react-native';
import { MessageImage } from 'react-native-gifted-chat';

const ImageMessage = ({ loading, ...props }) => {
  return (
    <View style={styles.root}>
      {loading ? <ActivityIndicator /> : <MessageImage currentMessage={props} />}
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