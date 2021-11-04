import React from 'react';
import { View, Image } from 'react-native';
import { colors } from '../../../../styles/common';

export default function PartnerItem({ imageSrc }) {
	return (
		<View
			style={{
				paddingHorizontal: 15,
				paddingVertical: 20,
				borderBottomColor: colors.grey500,
				borderBottomWidth: 1
			}}
		>
			<Image source={imageSrc} resizeMode={'contain'} style={{ height: 50, width: 150 }} />
		</View>
	);
}
