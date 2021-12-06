import React, { Component } from 'react';
import { DeviceEventEmitter, Image, StyleSheet, View } from 'react-native';
import { makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import * as RNFS from 'react-native-fs';
import { refWebRTC } from '../../../../../services/WebRTC';
import FileTransferWebRTC from '../../../FilesManager/store/FileTransferWebRTC';

class StoreImage extends Component {
	image = '';

	constructor(props) {
		super(props)
		makeObservable(this, {
			image: observable,
		})
		const { source } = props;
		this.source = source;
	}

	componentDidMount() {
		FileTransferWebRTC.readFile(this.source, [this.source?.to], refWebRTC());
		const listener = DeviceEventEmitter.addListener('FileTransReceived', async ({ path, data }) => {
			if (data?.name == this.source.hash) {
				const content = await RNFS.readFile(path, 'base64');
				this.image = `data:image/png;base64,${content}`;
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
