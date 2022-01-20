import React from 'react';
import { View, Image, TouchableHighlight, StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';
import APIService, { basicAuth } from '../../../../services/APIService';
import * as base64 from 'base-64';

export default function PartnerItem({ imageSrc, onItemPress }) {
	const styles = StyleSheet.create({
		wrapper: {
			flex: 1,
			paddingHorizontal: 20
		},
		imgWrapper: {
			paddingHorizontal: 15,
			paddingVertical: 20,
			alignItems: 'center',
			backgroundColor: colors.purple,
			borderRadius: 15,
			marginTop: 20
		},
		img: {
			height: 50,
			width: 150
		}
	});
	return (
		<TouchableHighlight style={styles.wrapper} onPress={onItemPress} underlayColor={colors.grey}>
			<View style={styles.imgWrapper}>
				<Image
					source={{
						uri:
							'https://account.liquichain.io/meveo/api/rest/fileSystem/binaries/default/KlubCoinPartner/88540662-605e-4b2f-8028-3405b3d6b4ac/icon',
						headers: {
							Authorization: `Basic ${base64.encode(basicAuth)}`
						}
					}}
					resizeMode={'contain'}
					style={styles.img}
					onError={error => {
						console.log(error);
					}}
				/>
			</View>
		</TouchableHighlight>
	);
}
