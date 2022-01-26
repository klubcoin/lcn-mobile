import React from 'react';
import { View, Image, StyleSheet, TouchableOpacity } from 'react-native';
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
		<TouchableOpacity activeOpacity={0.7} style={styles.wrapper} onPress={onItemPress} underlayColor={colors.grey}>
			<View style={styles.imgWrapper}>
				<Image
					source={{
						uri: APIService.apiGetPartnerIcon(imageSrc),
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
		</TouchableOpacity>
	);
}
