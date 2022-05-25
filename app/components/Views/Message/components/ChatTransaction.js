import React, { useEffect, useState } from 'react';
import { StyleSheet, View } from 'react-native';
import Icon from 'react-native-vector-icons/FontAwesome';
import Text from '../../../Base/Text';
import { colors } from '../../../../styles/common';
import { strings } from '../../../../../locales/i18n';
import decodeTransaction from '../../../UI/TransactionElement/utils';
import Engine from '../../../../core/Engine';

const ChatTransaction = ({ data, incoming, dark }) => {
  const [details, setDetails] = useState({});
  const sender = !incoming;
  const title = sender ? strings('chat.sent_transaction') : strings('chat.received_transaction');

  const decodeTrans = async () => {
    const { tokens } = Engine.state.AssetsController;
    data.tokens = tokens.reduce((tokens, token) => {
      tokens[token.address] = token;
      return tokens;
    }, {});
    data.contractExchangeRates = {};
    const [details] = await decodeTransaction(data);
    setDetails(details);
  }

  useEffect(() => {
    decodeTrans();
  }, [data]);

  return (
    <View style={styles.root}>
      <Icon name={incoming ? 'dollar' : 'send'} size={24} style={[styles.icon, incoming && styles.highlight]} />
      <View style={styles.bubble}>
        <Text style={[sender && !dark && styles.textWhite]}>{title}</Text>
        <Text style={[sender && !dark && styles.textWhite, styles.bold]}>{details?.value || ''}</Text>
      </View>
    </View>
  )
}

const styles = StyleSheet.create({
  root: {
    flexDirection: 'row',
    padding: 10
  },
  icon: {
    color: colors.white
  },
  bubble: {
    maxWidth: 200,
    marginLeft: 10
  },
  highlight: {
    color: colors.blue,
  },
  textWhite: {
    color: colors.white,
  },
  bold: {
    fontWeight: '600',
    fontSize: 14
  }
})
export default ChatTransaction;