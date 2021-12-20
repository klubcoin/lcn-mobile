import React, { Component } from 'react';
import { DeviceEventEmitter, Image, StyleSheet, View } from 'react-native';
import { action, makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import * as RNFS from 'react-native-fs';
import { refWebRTC } from '../../../../../services/WebRTC';
import FileTransferWebRTC from '../../../FilesManager/store/FileTransferWebRTC';
import { ReadFile } from '../../../FilesManager/store/FileStore';
import { sha256 } from '../../../../../core/CryptoSignature';

class StoreImage extends Component {
	image = '';

	constructor(props) {
		super(props)
		makeObservable(this, {
			image: observable,
			setImage: action,
		})
		const { address, path } = props;
		this.setImage(path);
		this.source = ReadFile(refWebRTC().address(), address, sha256(path), path);
	}

	componentDidMount() {
		this.fetchImage();
	}

	setImage(image) {
		this.image = image;
	}

	fetchImage = async () => {
		const { address, local } = this.props;
		const { hash } = this.source;

		if (local) return;

		const folder = `${RNFS.DocumentDirectoryPath}/${address.toLowerCase()}`;
		const path = `${folder}/${hash}`;

		if (await RNFS.exists(path)) {
			const content = await RNFS.readFile(path, 'base64');
			this.setImage(`data:image/png;base64,${content}`);
			return;
		}

		FileTransferWebRTC.readFile(this.source, [this.source?.to], refWebRTC());
		const listener = DeviceEventEmitter.addListener('FileTransReceived', async ({ path, data }) => {
			if (data?.name == this.source.hash) {
				const content = await RNFS.readFile(path, 'base64');
				this.setImage(`data:image/png;base64,${content}`);
				listener.remove();
			}
		});
	}

	render() {
		const { style } = this.props;

		return (
			<View style={style}>
				<Image style={styles.image} source={{ uri: this.image }} />
			</View>
		)
	}
}

const styles = StyleSheet.create({
	image: {
		width: '100%',
		height: '100%',
		resizeMode: 'cover',
	},
});

export default observer(StoreImage);
