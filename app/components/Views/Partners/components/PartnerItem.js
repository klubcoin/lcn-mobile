import React from 'react';
import { View, Image, TouchableHighlight, StyleSheet } from 'react-native';
import { colors } from '../../../../styles/common';

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
				<Image source={imageSrc} resizeMode={'contain'} style={styles.img} />
			</View>
		</TouchableHighlight>
	);
}
