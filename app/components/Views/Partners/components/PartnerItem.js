import React from 'react';
import { View, StyleSheet, TouchableOpacity } from 'react-native';
import { colors } from '../../../../styles/common';
import APIService from '../../../../services/APIService';
import PartnerImage from './PartnerImage';
import { testID } from '../../../../util/Logger';

export default function PartnerItem({ imageSrc, onItemPress, testID: testId }) {
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
		<TouchableOpacity
			{...testID(testId)}
			activeOpacity={0.7}
			style={styles.wrapper}
			onPress={onItemPress}
			underlayColor={colors.grey}
		>
			<View style={styles.imgWrapper}>
				<PartnerImage
					source={APIService.apiGetPartnerIcon(imageSrc)}
					style={styles.img}
					width={150}
					height={50}
				/>
			</View>
		</TouchableOpacity>
	);
}
