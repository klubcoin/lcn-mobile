import React, { Component } from 'react';
import { Image, StyleSheet, View } from 'react-native';
import { action, makeObservable, observable } from 'mobx';
import { observer } from 'mobx-react';
import * as base64 from 'base-64';
import * as RNFS from 'react-native-fs';
import RNFetchBlob from 'rn-fetch-blob';
import { sha256 } from '../../../../core/CryptoSignature';
import { basicAuth } from '../../../../services/APIService';
import ContentLoader from 'react-native-content-loader';
import { Rect } from 'react-native-svg';
import { colors } from '../../../../styles/common';

class PartnerImage extends Component {
	image = '';
	source = '';
	isLoadedImg = false;
	constructor(props) {
		super(props);
		makeObservable(this, {
			image: observable,
			isLoadedImg: observable,
			setImage: action
		});
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

	fetchPartnerImage = async source => {
		const folder = `${RNFS.DocumentDirectoryPath}`;
		const path = `${folder}/img_${sha256(source)}`;

		if (await RNFS.exists(path)) {
			const content = await RNFS.readFile(path);
			this.setImage(`data:image/png;base64,${content}`);
			return;
		}

		const headers = { Authorization: `Basic ${base64.encode(basicAuth)}` };
		RNFetchBlob.fetch('GET', source, headers)
			.then(response => response.base64())
			.then(async payload => {
				this.setImage(`data:image/png;base64,${payload}`);
				await RNFetchBlob.fs.writeFile(path, payload);
			})
			.catch(error => {
				console.log(error);
			});
	};

	fetchImage = async () => {
		const { base64, source } = this.props;

		if (base64) {
			this.setImage(`data:image/png;base64,${base64}`);
		} else if (source) {
			this.fetchPartnerImage(source);
		}
	};

	monitorUpdate = () => {
		const { source, base64 } = this.props;
		if (source != this.source || (base64 && base64 != this.image)) {
			this.fetchImage();
		}
	};

	render() {
		const { style, imageStyle, width, height } = this.props;
		this.monitorUpdate();

		return (
			<View style={style}>
				<View style={styles.contentLoader}>
					{!this.isLoadedImg && (
						<ContentLoader
							primaryColor={colors.lightPurple}
							secondaryColor={colors.purple500}
							height={height}
							width={width}
							duration={'1500'}
						>
							<Rect x="0" y="0" rx="8" ry="8" width={width} height={height} />
						</ContentLoader>
					)}
				</View>
				<Image
					style={[styles.image, imageStyle]}
					source={{ uri: this.image }}
					onLoadEnd={() => {
						this.isLoadedImg = true;
					}}
				/>
			</View>
		);
	}
}

const styles = StyleSheet.create({
	image: {
		width: '100%',
		height: '100%',
		resizeMode: 'stretch'
	},
	contentLoader: {
		position: 'absolute',
		top: 0,
		bottom: 0,
		left: 0,
		right: 0
	}
});

export default observer(PartnerImage);
