import React, { Component } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { action, makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import * as base64 from 'base-64';
import * as RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import { sha256 } from '../../../../core/CryptoSignature';
import { basicAuth } from '../../../../services/APIService';

class PartnerImage extends Component {
  image = '';
  source = '';
  placeholder = require('../../../../images/ic_partners.png')

  constructor(props) {
    super(props)
    makeObservable(this, {
      image: observable,
      setImage: action,
    })
    const { source } = props;
    this.source = source;
    this.setImage(`${source || ''}`);
  }

  componentDidMount() {
    this.fetchImage();
  }

  setImage(image) {
    this.image = image && image != 'undefined' ? image : null;
  }

  fetchPartnerImage = async (source) => {
    const folder = `${RNFS.DocumentDirectoryPath}`;
    const path = `${folder}/img_${sha256(source)}`;

    if (await RNFS.exists(path)) {
      const content = await RNFS.readFile(path);
      this.setImage(`data:image/png;base64,${content}`);
      return;
    }

    const headers = { Authorization: `Basic ${base64.encode(basicAuth)}` }
    RNFetchBlob.fetch('GET', source, headers)
      .then(response => response.base64())
      .then(async payload => {
        this.setImage(`data:image/png;base64,${payload}`);
        await RNFetchBlob.fs.writeFile(path, payload);
      })
      .catch(error => {
        console.log(error)
      });
  }

  fetchImage = async () => {
    const { base64, source } = this.props;

    if (base64) {
      this.setImage(`data:image/png;base64,${base64}`);
    } else if (source) {
      this.fetchPartnerImage(source);
    }
  }

  monitorUpdate = () => {
    const { source, base64 } = this.props;
    if (source != this.source || (base64 && base64 != this.image)) {
      this.fetchImage();
    }
  }

  render() {
    const { style, imageStyle } = this.props;
    this.monitorUpdate();

    return (
      <View style={style}>
        <Image style={[styles.image, imageStyle]} source={{ uri: this.image }} defaultSource={this.placeholder} />
      </View>
    )
  }
}

const styles = StyleSheet.create({
  image: {
    width: '100%',
    height: '100%',
    resizeMode: 'contain'
  },
});

export default observer(PartnerImage);
